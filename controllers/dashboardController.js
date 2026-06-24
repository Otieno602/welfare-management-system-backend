import Member from "../models/Member.js";
import Meeting from "../models/Meeting.js";
import FinancialRecord from "../models/FinancialRecord.js";

export const getDashboardStats = async (req, res) => {
  try {
    // Members
    const totalMembers = await Member.countDocuments();

    // Meetings
    const meetings = await Meeting.find();
    const totalMeetings = meetings.length;

    // Attendance Rate
    let totalPresent = 0;
    let totalAttendanceRecords = 0;

    meetings.forEach((meeting) => {
      meeting.attendance.forEach((record) => {
        totalAttendanceRecords++;

        if (record.status === "present") {
          totalPresent++;
        }
      });
    });

    const attendanceRate =
      totalAttendanceRecords === 0
        ? 0
        : Math.round(
            (totalPresent / totalAttendanceRecords) * 100
          );

    // Financial Records
    const financialRecords =
      await FinancialRecord.find();

    const totalFinancialRecords =
      financialRecords.length;

    let totalCollected = 0;
    let totalOutstanding = 0;

    financialRecords.forEach((record) => {
      record.payments.forEach((payment) => {
        totalCollected += payment.amountPaid || 0;
      });

      const expected =
        record.amount * record.payments.length;

      const collected =
        record.payments.reduce(
          (sum, payment) =>
            sum + (payment.amountPaid || 0),
          0
        );

      totalOutstanding +=
        expected - collected;
    });

    res.status(200).json({
      totalMembers,
      totalMeetings,
      attendanceRate,
      totalFinancialRecords,
      totalCollected,
      totalOutstanding,
    });

  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};