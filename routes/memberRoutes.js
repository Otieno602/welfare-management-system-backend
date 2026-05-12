import express from "express";
import { 
    addMember, 
    getMembers, 
    updateMember, 
    deleteMember 
} from "../controllers/memberController.js";

const router = express.Router();

router.post("/", addMember);
router.get("/", getMembers);
router.put("/:id", updateMember);
router.delete("/:id", deleteMember);

export default router;