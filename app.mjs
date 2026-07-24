import cors from "cors";
import express from "express";
import questionRouter from "./routes/questions.mjs";
import answerRouter from "./routes/answers.mjs";
import connectionPool from "./utils/db.mjs";
import { errorHandler, notFoundHandler } from "./middleware/error-handler.mjs";

const app = express();
const serverPort = 5001;

// Global Middleware: เปิด CORS และแปลง JSON request body เป็น JavaScript object
app.use(cors());
app.use(express.json());

// Database Connection Test: ทดสอบว่า Server และ PostgreSQL ทำงาน
app.get("/test", async (req, res) => {
  try {
    const result = await connectionPool.query("SELECT * FROM questions;");

    return res.status(200).json({
      message: "Server API and Database are working 🚀",
      data: result.rows,
    });
  } catch (error) {
    console.error("Database Error:", error);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
});

// Router: จัดกลุ่ม endpoint ตาม resource เพื่อให้ app.mjs อ่านง่าย
app.use("/questions", questionRouter);
app.use("/answers", answerRouter);

// Error Middleware: ต้องวางหลัง routes ทั้งหมด
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server: เริ่มรับ request ที่ port 5001
app.listen(serverPort, () => {
  console.log(`Server is running at http://localhost:${serverPort}`);
});
