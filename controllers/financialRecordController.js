import FinancialRecord from "../models/FinancialRecord.js";
import Member from "../models/Member.js";

export const createFinancialRecord = async (req, res) => {
  try {
    const {
      title,
      amount,
      type,
      deadline,
      appliesToAll,
      selectedMembers,
    } = req.body;

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
    const updatedRecord =
      await FinancialRecord.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};