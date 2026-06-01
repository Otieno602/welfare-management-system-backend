import express from "express";
import {
  createMeeting,
  getMeetings,
  updateMeeting,
} from "../controllers/meetingController.js";

const router = express.Router();

router.post("/", createMeeting);
router.get("/", getMeetings);
router.put("/:id", updateMeeting);

export default router;