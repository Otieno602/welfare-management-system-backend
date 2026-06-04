import express from "express";
import {
  createFinancialRecord,
  getFinancialRecords,
} from "../controllers/financialRecordController.js";

const router = express.Router();

router.post("/", createFinancialRecord);
router.get("/", getFinancialRecords);

export default router;