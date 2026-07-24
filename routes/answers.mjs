import express from "express";
import connectionPool from "../utils/db.mjs";
import { asyncHandler } from "../middleware/error-handler.mjs";
import { validateId, validateVote } from "../middleware/validation.mjs";

const answerRouter = express.Router();

// DELETE Answer: ลบคำตอบรายอันตาม answerId
answerRouter.delete("/:answerId", validateId("answerId"), asyncHandler(async (req, res) => {
  const result = await connectionPool.query("DELETE FROM answers WHERE id = $1 RETURNING id;", [req.params.answerId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "Answer not found." });
    }

  return res.status(200).json({ message: "Answer has been deleted successfully." });
}));

// VOTE Answer: บันทึก 1 สำหรับ upvote หรือ -1 สำหรับ downvote
answerRouter.post("/:answerId/vote",validateId("answerId"), validateVote, asyncHandler(async (req, res) => {
    const answerResult = await connectionPool.query("SELECT id FROM answers WHERE id = $1;", [req.params.answerId]);

    if (answerResult.rowCount === 0) {
      return res.status(404).json({ message: "Answer not found." });
    }

    await connectionPool.query(
      "INSERT INTO answer_votes (answer_id, vote) VALUES ($1, $2);",
      [req.params.answerId, req.body.vote],
    );

    return res.status(200).json({
      message: "Vote on the answer has been recorded successfully.",
    });
  }),
);

export default answerRouter;
