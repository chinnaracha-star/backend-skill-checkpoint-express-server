// Validation Helper: ตรวจว่า value เป็นข้อความที่ไม่ใช่ช่องว่าง
const isNonEmptyString = (value) =>
  typeof value === "string" && value.trim().length > 0;

const sendInvalidRequest = (res, detail) =>
  res.status(400).json({
    message: "Invalid request data.",
    detail,
  });

// ID Validation: path parameter ต้องเป็นจำนวนเต็มบวก
export const validateId = (parameterName) => (req, res, next) => {
  const value = req.params[parameterName];

  if (!/^[1-9]\d*$/.test(value)) {
    return sendInvalidRequest(
      res,
      `${parameterName} must be a positive integer.`,
    );
  }

  return next();
};

// Question Validation: ตอนสร้างต้องส่งข้อมูลครบทั้งสามช่อง
export const validateCreateQuestion = (req, res, next) => {
  const { title, description, category } = req.body;

  if (
    !isNonEmptyString(title) ||
    !isNonEmptyString(description) ||
    !isNonEmptyString(category)
  ) {
    return sendInvalidRequest(
      res,
      "title, description and category are required non-empty strings.",
    );
  }

  return next();
};

// Question Update Validation: อนุญาตให้แก้บาง field แต่ต้องมีอย่างน้อยหนึ่ง field
export const validateUpdateQuestion = (req, res, next) => {
  const allowedFields = ["title", "description", "category"];
  const receivedFields = Object.keys(req.body);
  const fieldsToUpdate = receivedFields.filter((field) =>
    allowedFields.includes(field),
  );

  if (
    fieldsToUpdate.length === 0 ||
    receivedFields.some((field) => !allowedFields.includes(field))
  ) {
    return sendInvalidRequest(
      res,
      "Send at least one of: title, description or category.",
    );
  }

  if (fieldsToUpdate.some((field) => !isNonEmptyString(req.body[field]))) {
    return sendInvalidRequest(res, "Updated values must be non-empty strings.");
  }

  return next();
};

// Search Validation: ต้องมี title หรือ category อย่างน้อยหนึ่งค่า
export const validateSearch = (req, res, next) => {
  const { title, category } = req.query;

  if (
    (!isNonEmptyString(title) && !isNonEmptyString(category)) ||
    (title !== undefined && !isNonEmptyString(title)) ||
    (category !== undefined && !isNonEmptyString(category))
  ) {
    return sendInvalidRequest(
      res,
      "Provide a non-empty title or category query parameter.",
    );
  }

  return next();
};

// Answer Validation: คำตอบต้องเป็นข้อความและมีความยาวไม่เกิน 300 ตัวอักษร
export const validateAnswer = (req, res, next) => {
  const { content } = req.body;

  if (!isNonEmptyString(content) || content.trim().length > 300) {
    return sendInvalidRequest(
      res,
      "content is required and must not exceed 300 characters.",
    );
  }

  return next();
};

// Vote Validation: ค่าโหวตที่ฐานข้อมูลยอมรับมีเพียง 1 และ -1
export const validateVote = (req, res, next) => {
  if (req.body.vote !== 1 && req.body.vote !== -1) {
    return sendInvalidRequest(res, "vote must be either 1 or -1.");
  }

  return next();
};
