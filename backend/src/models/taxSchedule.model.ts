import { Schema, model, Model, Document, Types } from "mongoose";

const MIN_TAX_COMPONENTS = 4; // Business rule: every schedule must include at least 4 tax components

interface TaxScheduleDocument extends Document {
  name: string;
  components: Types.ObjectId[];
  startDate: Date;
  sunsetDate?: Date;
  taxOnTax: boolean;
  taxInclusive: boolean;
  taxExclusive: boolean;
  company?: Types.ObjectId | null;
  createdBy: Types.ObjectId;
  isSuperAdminSchedule: boolean;
  isActive: boolean;
  appliesTo: "facilities" | "inventoryItem" | "all";
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
        (v: any[]) => v.length >= MIN_TAX_COMPONENTS,
        `At least ${MIN_TAX_COMPONENTS} tax components required`,
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
    isActive: { type: Boolean, default: true },
    appliesTo: {
      type: String,
      enum: ["facilities", "inventoryItem", "all"],
      default: "all",
    },
  },
  { timestamps: true }
);

/**
 * Compound indexes:
 * - For tenant schedules (isSuperAdminSchedule = false):
 *   Ensures uniqueness of name + startDate within the same company.
 *
 * - For super admin schedules (isSuperAdminSchedule = true):
 *   Ensures global uniqueness of name + startDate across all companies.
 */
TaxScheduleSchema.index(
  { company: 1, name: 1, startDate: -1 },
  { unique: true, partialFilterExpression: { isSuperAdminSchedule: false } }
);

TaxScheduleSchema.index(
  { name: 1, startDate: -1 },
  { unique: true, partialFilterExpression: { isSuperAdminSchedule: true } }
);

// Validation: taxInclusive and taxExclusive cannot both be true
TaxScheduleSchema.pre("validate", function (next) {
  if (this.taxInclusive && this.taxExclusive) {
    return next(
      new Error("A schedule cannot be both tax-inclusive and tax-exclusive.")
    );
  }

  if (this.isSuperAdminSchedule && this.company) {
    return next(
      new Error("Super admin schedules cannot be tied to a company.")
    );
  }

  next();
});

// Post-save hook: deactivate old schedules when a new active one is created
TaxScheduleSchema.post("save", async function (doc, next) {
  if (doc.isActive) {
    const query: any = {
      _id: { $ne: doc._id },
      name: doc.name,
      isActive: true,
    };

    if (doc.isSuperAdminSchedule) {
      query.isSuperAdminSchedule = true;
    } else {
      query.company = doc.company;
      query.isSuperAdminSchedule = false;
    }

    // Use the model directly instead of doc.constructor to avoid type errors
    const TaxSchedule = doc.model("TaxSchedule");
    await TaxSchedule.updateMany(query, { $set: { isActive: false } });

    next();
  }
});

const TaxScheduleModel: Model<TaxScheduleDocument> = model<TaxScheduleDocument>(
  "TaxSchedule",
  TaxScheduleSchema
);

export { TaxScheduleDocument, TaxScheduleModel };
