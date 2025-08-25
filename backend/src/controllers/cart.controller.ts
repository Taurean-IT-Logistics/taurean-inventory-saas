import { Request, Response } from "express";
import { UserModel } from "../models";
import { sendSuccess, sendError } from "../utils";

export async function list(req: Request, res: Response) {
  try {
    const user = await UserModel.findById((req.user as any).id).select("cart");
    sendSuccess(res, "Cart fetched", { cart: (user as any)?.cart || [] });
  } catch (e: any) {
    sendError(res, "Failed to fetch cart", e.message);
  }
}

export async function add(req: Request, res: Response) {
  try {
    const {
      type,
      itemId,
      quantity = 1,
      name,
      price,
      imageUrl,
      notes,
    } = req.body;
    if (!type || !itemId) {
      sendError(res, "type and itemId required", null, 400);
      return;
    }

    const user = await UserModel.findById((req.user as any).id);
    if (!user) {
      sendError(res, "User not found", null, 404);
      return;
    }
    user.cart = user.cart || [];
    const existingIndex = (user.cart as any).findIndex(
      (c: any) => c.itemId?.toString?.() === itemId && c.type === type
    );
    if (existingIndex >= 0) {
      (user.cart as any)[existingIndex].quantity =
        ((user.cart as any)[existingIndex].quantity || 1) + quantity;
    } else {
      (user.cart as any).push({
        type,
        itemId,
        quantity,
        name,
        price,
        imageUrl,
        notes,
      } as any);
    }
    await user.save();
    sendSuccess(res, "Added to cart", { cart: user.cart });
  } catch (e: any) {
    sendError(res, "Failed to add to cart", e.message);
  }
}

export async function remove(req: Request, res: Response) {
  try {
    const { itemId, type } = req.body;
    const user = await UserModel.findById((req.user as any).id);

    if (!user) {
      sendError(res, "User not found", null, 404);
      return;
    }
    user.cart = (user.cart || []).filter(
      (c: any) =>
        !(c.itemId?.toString?.() === itemId && (!type || c.type === type))
    );
    await user.save();
    sendSuccess(res, "Removed from cart", { cart: user.cart });
  } catch (e: any) {
    sendError(res, "Failed to remove from cart", e.message);
  }
}

export async function clear(req: Request, res: Response) {
  try {
    const user = await UserModel.findById((req.user as any).id);
    if (!user) {
      sendError(res, "User not found", null, 404);
      return;
    }

    user.cart = [] as any;
    await user.save();
    sendSuccess(res, "Cart cleared", { cart: user.cart });
  } catch (e: any) {
    sendError(res, "Failed to clear cart", e.message);
  }
}
