import express from "express";
import {
  createFinancialRecord,
  getFinancialRecords,
  updateFinancialRecord,
} from "../controllers/financialRecordController.js";

const router = express.Router();

router.post("/", createFinancialRecord);
router.get("/", getFinancialRecords);
router.put("/:id", updateFinancialRecord);

export default router;