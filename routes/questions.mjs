import express from "express";
import connectionPool from "../utils/db.mjs";
import { asyncHandler } from "../middleware/error-handler.mjs";
import {
  validateAnswer,
  validateCreateQuestion,
  validateId,
  validateSearch,
  validateUpdateQuestion,
  validateVote,
} from "../middleware/validation.mjs";

const questionRouter = express.Router();

// CREATE Question: เพิ่มคำถามใหม่และส่งข้อมูลที่ฐานข้อมูลสร้างกลับไป
questionRouter.post(
  "/",
  validateCreateQuestion,
  asyncHandler(async (req, res) => {
    const { title, description, category } = req.body;
    const result = await connectionPool.query(
      `INSERT INTO questions 
    (title, description, category) 
    VALUES ($1, $2, $3) 
    RETURNING id, title, description, category;`,
      [title, description, category],
    );

    return res.status(201).json({
      message: "Question created successfully.",
      data: result.rows[0],
    });
  }),
);

// READ All Questions: อ่านคำถามทั้งหมด
questionRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const result = await connectionPool.query(`SELECT * FROM questions ;`);

    return res.status(200).json({
      data: result.rows,
      message: "Questions fetched successfully.",
    });
  }),
);

// SEARCH Questions: ใช้ ILIKE เพื่อค้นหาโดยไม่แยกตัวพิมพ์เล็กและตัวพิมพ์ใหญ่
// Route นี้ต้องอยู่ก่อน /:questionId เพื่อไม่ให้ Express มองคำว่า search เป็น id
questionRouter.get(
  "/search",
  validateSearch,
  asyncHandler(async (req, res) => {
    const conditions = [];
    const values = [];

    if (req.query.title) {
      values.push(`%${req.query.title.trim()}%`);
      conditions.push(`title ILIKE $${values.length}`);
    }

    if (req.query.category) {
      values.push(`%${req.query.category.trim()}%`);
      conditions.push(`category ILIKE $${values.length}`);
    }

    const result = await connectionPool.query(
      `SELECT id, title, description, category
       FROM questions
       WHERE ${conditions.join(" AND ")}
       ORDER BY id ASC;`,
      values,
    );

    return res.status(200).json({ data: result.rows });
  }),
);

// READ One Question: อ่านคำถามจาก questionId
questionRouter.get(
  "/:questionId",
  validateId("questionId"),
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const result = await connectionPool.query(
      `SELECT id, title, description, category
       FROM questions
       WHERE id = $1;`,
      [questionId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      data: result.rows[0],
      message: "Question fetched successfully.",
    });
  }),
);

// UPDATE Question: สร้าง SET clause จาก field ที่ client ส่งมาเท่านั้น
questionRouter.put(
  "/:questionId",
  validateId("questionId"),
  validateUpdateQuestion,
  asyncHandler(async (req, res) => {
    const allowedFields = ["title", "description", "category"];
    const fields = allowedFields.filter(
      (field) => req.body[field] !== undefined,
    );
    const values = fields.map((field) => req.body[field].trim());
    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(", ");

    values.push(req.params.questionId);
    const result = await connectionPool.query(
      `UPDATE questions
       SET ${setClause}
       WHERE id = $${values.length}
       RETURNING id, title, description, category;`,
      values,
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    return res.status(200).json({
      message: "Question updated successfully.",
      data: result.rows[0],
    });
  }),
);

// DELETE Question: foreign keys แบบ ON DELETE CASCADE จะลบ answers และ votes ตามไปด้วย
questionRouter.delete(
  "/:questionId",
  validateId("questionId"),
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;

    const result = await connectionPool.query(
      `
      DELETE FROM questions WHERE id = $1 
      RETURNING id, title, description, category;`,
      [questionId],
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        message: "Question not found.",
      });
    }

    return res.status(200).json({
      message: "Question post has been deleted successfully.",
      deletedQuestion: result.rows[0],
    });
  }),
);

// CREATE Answer: ตรวจว่าคำถามมีอยู่ แล้วจึงบันทึกคำตอบที่อ้างอิง questionId
questionRouter.post(
  "/:questionId/answers",
  validateId("questionId"),
  validateAnswer,
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1;",
      [questionId],
    );

    if (questionResult.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const result = await connectionPool.query(
      `INSERT INTO answers (question_id, content)
       VALUES ($1, $2)
       RETURNING id, question_id, content;`,
      [questionId, req.body.content.trim()],
    );

    return res.status(201).json({
      message: "Answer created successfully.",
      data: result.rows[0],
    });
  }),
);

// READ Answers: ดูคำตอบทั้งหมดของคำถามหนึ่งข้อ
questionRouter.get(
  "/:questionId/answers",
  validateId("questionId"),
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1;",
      [questionId],
    );

    if (questionResult.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    const result = await connectionPool.query(
      `SELECT id, question_id, content
       FROM answers
       WHERE question_id = $1
       ORDER BY id ASC;`,
      [questionId],
    );

    return res.status(200).json({ data: result.rows });
  }),
);

// VOTE Question: บันทึก 1 สำหรับ upvote หรือ -1 สำหรับ downvote
questionRouter.post(
  "/:questionId/vote",
  validateId("questionId"),
  validateVote,
  asyncHandler(async (req, res) => {
    const { questionId } = req.params;
    const questionResult = await connectionPool.query(
      "SELECT id FROM questions WHERE id = $1;",
      [questionId],
    );

    if (questionResult.rowCount === 0) {
      return res.status(404).json({ message: "Question not found." });
    }

    await connectionPool.query(
      "INSERT INTO question_votes (question_id, vote) VALUES ($1, $2);",
      [questionId, req.body.vote],
    );

    return res.status(200).json({
      message: "Vote on the question has been recorded successfully.",
    });
  }),
);

export default questionRouter;
