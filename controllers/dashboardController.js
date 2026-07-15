import Member from "../models/Member.js";
import Meeting from "../models/Meeting.js";
import FinancialRecord from "../models/FinancialRecord.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Fetch all data in parallel
    const [members, meetings, financialRecords] = await Promise.all([
      Member.find(),
      Meeting.find(),
      FinancialRecord.find().populate("payments.member", "name"),
    ]);

    // ===== Summary Statistics =====

    const totalMembers = members.length;

    const totalMeetings = meetings.length;

    const totalFinancialRecords = financialRecords.length;

    let attendanceRate = 0;

    if (meetings.length > 0) {
      let totalPresent = 0;
      let totalAttendance = 0;

      meetings.forEach((meeting) => {
        const attendance = meeting.attendance || [];

        totalPresent += attendance.filter(
          (record) => record.status === "present",
        ).length;

        totalAttendance += attendance.length;
      });

      attendanceRate =
        totalAttendance === 0
          ? 0
          : Math.round((totalPresent / totalAttendance) * 100);
    }

    const totalCollected = financialRecords.reduce(
      (sum, record) =>
        sum +
        record.payments.reduce(
          (paymentSum, payment) => paymentSum + payment.amountPaid,
          0,
        ),
      0,
    );

    const totalOutstanding = financialRecords.reduce((sum, record) => {
      const paid = record.payments.reduce(
        (paymentSum, payment) => paymentSum + payment.amountPaid,
        0,
      );

      return sum + (record.amount - paid);
    }, 0);

    // ===== Dashboard Response =====

    res.json({
      summary: {
        totalMembers,
        totalMeetings,
        attendanceRate,
        totalFinancialRecords,
        totalCollected,
        totalOutstanding,
      },

      members,

      meetings,

      financialRecords,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
