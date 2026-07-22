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

    // ===== Attendance Trend =====

    const attendanceTrend = meetings.map((meeting) => {
      const attendance = meeting.attendance || [];

      const present = attendance.filter(
        (record) => record.status === "present",
      ).length;

      const total = attendance.length;

      return {
        meeting: meeting.title,
        attendanceRate: total === 0 ? 0 : Math.round((present / total) * 100),
      };
    });

    // ===== Monthly Collections =====

    const monthlyCollectionsMap = {};

    financialRecords.forEach((record) => {
      record.payments.forEach((payment) => {
        // Use the payment date if available.
        // Otherwise fall back to when the financial record was created.
        const paymentDate = payment.datePaid || record.createdAt;

        const date = new Date(paymentDate);

        const month = `${date.toLocaleString("default", {
          month: "short",
        })} ${date.getFullYear()}`;

        if (!monthlyCollectionsMap[month]) {
          monthlyCollectionsMap[month] = 0;
        }

        monthlyCollectionsMap[month] += payment.amountPaid;
      });
    });

    const monthlyCollections = Object.entries(monthlyCollectionsMap).map(
      ([month, amount]) => ({
        month,
        amount,
      }),
    );

    // ===== Outstanding Members =====

    const outstandingMembers = [];

    financialRecords.forEach((record) => {
      record.payments.forEach((payment) => {
        const remaining = record.amount - payment.amountPaid;

        if (remaining > 0) {
          outstandingMembers.push({
            member: payment.member?.name || "Unknown Member",
            title: record.title,
            amount: remaining,
            status: payment.status,
          });
        }
      });
    });

    // Sort by highest amount first.
    // If amounts are equal, sort alphabetically.
    outstandingMembers.sort((a, b) => {
      if (b.amount !== a.amount) {
        return b.amount - a.amount;
      }

      return a.member.localeCompare(b.member);
    });

    const topOutstandingMembers = outstandingMembers.slice(0, 5);

    // Recent Meetings
    const recentMeetings = meetings
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5)
      .map((meeting) => {
        const attendance = meeting.attendance || [];

        const present = attendance.filter(
          (record) => record.status === "present",
        ).length;

        const total = attendance.length;

        return {
          id: meeting._id,
          title: meeting.title,
          date: meeting.date,
          present,
          total,
          attendanceRate: total === 0 ? 0 : Math.round((present / total) * 100),
        };
      });

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

      attendanceTrend,

      monthlyCollections,

      outstandingMembers: topOutstandingMembers,

      recentMeetings,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};
