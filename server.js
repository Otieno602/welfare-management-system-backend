import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import memberRoutes from "./routes/memberRoutes.js";
import meetingRoutes from "./routes/meetingRoutes.js";
import financialRecordRoutes from "./routes/financialRecordRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/api/members", memberRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/financial-records", financialRecordRoutes);
app.use("/api/dashboard", dashboardRoutes);

// MongoDB connection
mongoose.connect("mongodb://127.0.0.1:27017/welfareDB")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

const PORT = 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));