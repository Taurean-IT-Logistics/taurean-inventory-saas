import { Request, Response } from "express";
import { UserModel } from "../models";
import { sendSuccess, sendError } from "../utils";
import * as InvoiceService from "../services/invoice.service";

export async function list(req: Request, res: Response) {
  try {
    const user = await UserModel.findById((req.user as any).id).select("cart");
    return sendSuccess(res, "Cart fetched", { cart: (user as any)?.cart || [] });
  } catch (e: any) {
    return sendError(res, "Failed to fetch cart", e.message);
  }
}

export async function add(req: Request, res: Response) {
  try {
    const { type, itemId, quantity = 1, name, price, imageUrl, notes } = req.body;
    if (!type || !itemId) return sendError(res, "type and itemId required", null, 400);
    const user = await UserModel.findById((req.user as any).id);
    if (!user) return sendError(res, "User not found", null, 404);
    user.cart = user.cart || [];
    const existingIndex = (user.cart as any).findIndex((c: any) => c.itemId?.toString?.() === itemId && c.type === type);
    if (existingIndex >= 0) {
      (user.cart as any)[existingIndex].quantity = ((user.cart as any)[existingIndex].quantity || 1) + quantity;
    } else {
      (user.cart as any).push({ type, itemId, quantity, name, price, imageUrl, notes } as any);
    }
    await user.save();
    return sendSuccess(res, "Added to cart", { cart: user.cart });
  } catch (e: any) {
    return sendError(res, "Failed to add to cart", e.message);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { itemId, type } = req.body;
    const user = await UserModel.findById((req.user as any).id);
    if (!user) return sendError(res, "User not found", null, 404);
    user.cart = (user.cart || []).filter((c: any) => !(c.itemId?.toString?.() === itemId && (!type || c.type === type)));
    await user.save();
    return sendSuccess(res, "Removed from cart", { cart: user.cart });
  } catch (e: any) {
    return sendError(res, "Failed to remove from cart", e.message);
  }
}

export async function clear(req: Request, res: Response) {
  try {
    const user = await UserModel.findById((req.user as any).id);
    if (!user) return sendError(res, "User not found", null, 404);
    user.cart = [] as any;
    await user.save();
    return sendSuccess(res, "Cart cleared", { cart: user.cart });
  } catch (e: any) {
    return sendError(res, "Failed to clear cart", e.message);
  }
}

export async function checkout(req: Request, res: Response) {
  try {
    const user = await UserModel.findById((req.user as any).id);
    if (!user) return sendError(res, "User not found", null, 404);
    const companyId = (req.user as any).companyId;
    const lines = (user.cart || []).map((c: any) => ({
      description: c.name || `${c.type} ${c.itemId}`,
      quantity: c.quantity || 1,
      unitPrice: c.price || 0,
    }));
    if (lines.length === 0) return sendError(res, "Cart is empty", null, 400);
    const invoice = await InvoiceService.createInvoice({
      companyId,
      createdBy: (req.user as any).id,
      customerId: (req.user as any).id,
      lines,
    });
    // clear cart
    user.cart = [] as any;
    await user.save();
    return sendSuccess(res, "Checkout created invoice", { invoice });
  } catch (e: any) {
    return sendError(res, "Checkout failed", e.message);
  }
}