// Async Handler: ส่ง error จาก async route ไปให้ global error middleware
export const asyncHandler = (routeHandler) => async (req, res, next) => {
  try {
    await routeHandler(req, res, next);
  } catch (error) {
    next(error);
  }
};

// Not Found Middleware: ทำงานเมื่อ request ไม่ตรงกับ endpoint ใด
export const notFoundHandler = (req, res) =>
  res.status(404).json({ message: "Endpoint not found." });

// Global Error Handler: ป้องกัน server หยุดและซ่อนรายละเอียดภายในจาก client
export const errorHandler = (error, req, res, next) => {
  console.error(error);

  if (res.headersSent) {
    return next(error);
  }

  return res.status(500).json({ message: "Internal Server Error" });
};
