import Member from "../models/Member.js";

export const addMember = async (req, res) => {
  try {
    const { name, phone, idNumber } = req.body;

    if (!name || !idNumber) {
      return res.status(400).json({ message: "Name and ID number are required" });
    }

    const existingMember = await Member.findOne({ idNumber });

    if (existingMember) {
      return res.status(400).json({ message: "Member with this ID already exists" });
    }

    const newMember = new Member({ name, phone, idNumber });
    await newMember.save();

    res.status(201).json(newMember);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get All Members
export const getMembers = async (req, res) => {
  try {
    const members = await Member.find().sort({ createdAt: -1 });
    res.status(200).json(members);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update A Member
export const updateMember = async (req, res) => {
  try {
    const updated = await Member.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete A Member
export const deleteMember = async (req, res) => {
  try {
    const deleted = await Member.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.status(200).json({ message: "Member deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};