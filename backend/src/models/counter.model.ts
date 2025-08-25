import mongoose, { Schema, Document } from "mongoose";

export interface ICounter extends Document {
  _id: string; // Name of the counter, e.g., "ticketNumber"
  sequenceValue: number;
}

const CounterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  sequenceValue: { type: Number, default: 0 },
});

export const CounterModel = mongoose.model<ICounter>("Counter", CounterSchema);
