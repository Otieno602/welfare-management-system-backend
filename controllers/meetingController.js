import Meeting from "../models/Meeting.js";

export const createMeeting = async (req, res) => {
  try {
    const meeting = await Meeting.create(req.body);

    res.status(201).json(meeting);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getMeetings = async (req, res) => {
  try {
    const meetings = await Meeting.find()
      .populate("attendance.member")
      .sort({ date: -1 });

    res.status(200).json(meetings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateMeeting = async (req, res) => {
  try {
    const updatedMeeting = await Meeting.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    res.status(200).json(updatedMeeting);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};