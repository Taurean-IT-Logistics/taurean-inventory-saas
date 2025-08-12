import { Schema, model, Model, Document } from "mongoose";

interface TaxComponent {
  name: string; // e.g., VAT, NHIL
  rate: number; // 0.05 for 5%
}

interface TaxScheduleDocument extends Document {
  name: string;
  components: TaxComponent[];
  startDate: Date;
  sunsetDate?: Date;
  taxOnTax: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxComponentSchema = new Schema<TaxComponent>({
  name: { type: String, required: true, trim: true },
  rate: { type: Number, required: true, min: 0 },
});

const TaxScheduleSchema = new Schema<TaxScheduleDocument>(
  {
    name: { type: String, required: true, trim: true },
    components: { type: [TaxComponentSchema], validate: [(v: any[]) => v.length >= 4, "At least 4 tax components required"] },
    startDate: { type: Date, required: true },
    sunsetDate: { type: Date },
    taxOnTax: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaxScheduleSchema.index({ name: 1, startDate: -1 });

export const TaxScheduleModel: Model<TaxScheduleDocument> = model<TaxScheduleDocument>(
  "TaxSchedule",
  TaxScheduleSchema
);

export { TaxScheduleDocument, TaxComponent };