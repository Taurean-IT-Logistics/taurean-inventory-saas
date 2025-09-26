import { Schema, model, Model, Document } from "mongoose";
import { Cheque } from "../types";

interface ChequeDocument extends Document, Cheque {}

const ChequeSchema = new Schema<ChequeDocument>(
  {
    number: { type: String, required: true },
    bank: { type: String, required: true },
    accountNumber: { type: String, required: true },
    amount: { type: Number, required: true },
    issuedDate: { type: Date, required: true },
    expiryDate: { type: Date, required: true },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const ChequeModel: Model<ChequeDocument> = model("Cheque", ChequeSchema);

export { ChequeDocument, ChequeModel };
