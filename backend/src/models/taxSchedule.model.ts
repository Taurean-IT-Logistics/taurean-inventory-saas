import { Schema, model, Model, Document, Types } from "mongoose";

interface TaxScheduleDocument extends Document {
  name: string;
  components: Types.ObjectId[];
  startDate: Date;
  sunsetDate?: Date;
  taxOnTax: boolean;
  taxInclusive: boolean;
  taxExclusive: boolean;
  company?: Types.ObjectId;
  createdBy: Types.ObjectId;
  isSuperAdminSchedule: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TaxScheduleSchema = new Schema<TaxScheduleDocument>(
  {
    name: { type: String, required: true, trim: true },
    components: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "Tax",
        },
      ],
      validate: [
        (v: any[]) => v.length >= 4,
        "At least 4 tax components required",
      ],
    },
    startDate: { type: Date, required: true },
    sunsetDate: { type: Date },
    taxOnTax: { type: Boolean, default: false },
    taxInclusive: { type: Boolean, default: false },
    taxExclusive: { type: Boolean, default: false },
    company: { type: Schema.Types.ObjectId, ref: "Company" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    isSuperAdminSchedule: { type: Boolean, default: false },
  },
  { timestamps: true }
);

TaxScheduleSchema.index(
  { company: 1, name: 1, startDate: -1 },
  { unique: true, partialFilterExpression: { isSuperAdminSchedule: false } }
);

TaxScheduleSchema.index(
  { name: 1, startDate: -1 },
  { unique: true, partialFilterExpression: { isSuperAdminSchedule: true } }
);

TaxScheduleSchema.pre("validate", function (next) {
  if (this.taxInclusive && this.taxExclusive) {
    return next(
      new Error("A schedule cannot be both tax-inclusive and tax-exclusive.")
    );
  }
  next();
});

const TaxScheduleModel: Model<TaxScheduleDocument> = model<TaxScheduleDocument>(
  "TaxSchedule",
  TaxScheduleSchema
);

export { TaxScheduleDocument, TaxScheduleModel };
