import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Member",
    required: true,
  },

  status: {
    type: String,
    enum: ["unpaid", "partial", "paid"],
    default: "unpaid",
  },

  amountPaid: {
    type: Number,
    default: 0,
  },

  datePaid: {
    type: Date,
  },
});

const financialRecordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    type: {
      type: String,
      enum: ["monthly", "special", "fine"],
      required: true,
    },

    deadline: {
      type: Date,
    },

    appliesToAll: {
      type: Boolean,
      default: true,
    },

    payments: [paymentSchema],
  },
  {
    timestamps: true,
  }
);

const FinancialRecord = mongoose.model(
  "FinancialRecord",
  financialRecordSchema
);


export default FinancialRecord;