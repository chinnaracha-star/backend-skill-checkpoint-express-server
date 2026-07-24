// Database Configuration: โหลดค่าจาก .env เพื่อไม่เขียนรหัสผ่านไว้ใน source code
import "dotenv/config";
import pg from "pg";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not defined in the .env file");
}

// Connection Pool: นำ connection กลับมาใช้ซ้ำเพื่อลดค่าใช้จ่ายในการเชื่อมต่อ
const connectionPool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export default connectionPool;
