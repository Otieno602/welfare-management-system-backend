import FinancialRecord from "../models/FinancialRecord.js";
import Member from "../models/Member.js";

export const createFinancialRecord = async (req, res) => {
  try {
    const { title, amount, type, deadline, appliesToAll, selectedMembers } =
      req.body;

    let members = [];

    if (appliesToAll) {
      members = await Member.find();
    } else {
      members = await Member.find({
        _id: { $in: selectedMembers },
      });
    }

    const payments = members.map((member) => ({
      member: member._id,
      status: "unpaid",
      amountPaid: 0,
    }));

    const financialRecord = await FinancialRecord.create({
      title,
      amount,
      type,
      deadline,
      appliesToAll,
      payments,
    });

    res.status(201).json(financialRecord);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const getFinancialRecords = async (req, res) => {
  try {
    const records = await FinancialRecord.find()
      .populate("payments.member")
      .sort({ createdAt: -1 });

    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

export const updateFinancialRecord = async (req, res) => {
  try {
    const existingRecord = await FinancialRecord.findById(req.params.id);

    if (!existingRecord) {
      return res.status(404).json({
        message: "Financial record not found",
      });
    }

    if (req.body.payments) {
      for (const payment of req.body.payments) {
        if (payment.amountPaid > existingRecord.amount) {
          return res.status(400).json({
            message: `Amount paid cannot exceed Ksh ${existingRecord.amount}`,
          });
        }

        if (payment.amountPaid < 0) {
          return res.status(400).json({
            message: "Amount paid cannot be negative",
          });
        }
      }
    }

    if (req.body.payments) {
      req.body.payments = req.body.payments.map((payment) => {
        // If the member has paid something and no payment date exists,
        // record today's date.
        if (payment.amountPaid > 0 && !payment.datePaid) {
          payment.datePaid = new Date();
        }

        return payment;
      });
    }

    const updatedRecord = await FinancialRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true },
    );

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
