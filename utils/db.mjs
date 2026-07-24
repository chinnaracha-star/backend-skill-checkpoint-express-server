// Database Configuration: กำหนดข้อมูลสำหรับเชื่อมต่อ PostgreSQL
import pg from "pg";

const { Pool } = pg;

// Connection Pool: นำ connection กลับมาใช้ซ้ำเพื่อลดค่าใช้จ่ายในการเชื่อมต่อ
const connectionPool = new Pool({
  connectionString: "postgresql://postgres:Hlmshh.03@localhost:5432/CheckPoint",
});

export default connectionPool;
