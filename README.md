# Quora Backend Skill Checkpoint

REST API สำหรับเว็บไซต์ถาม-ตอบคล้าย Quora พัฒนาด้วย Node.js, Express และ PostgreSQL โปรเจกต์นี้ใช้ฝึกการออกแบบ REST API, เขียน SQL, เชื่อมตารางด้วย Foreign Key, ทำ CRUD, Validation, Middleware และ Express Router

## ความสามารถของระบบ

- สร้าง ดู แก้ไข ลบ และค้นหาคำถาม
- สร้างและดูคำตอบของคำถาม
- ลบคำตอบรายอันด้วย Answer ID
- Upvote หรือ Downvote คำถามและคำตอบ
- ลบคำตอบและโหวตที่เกี่ยวข้องอัตโนมัติเมื่อลบคำถามด้วย `ON DELETE CASCADE`
- ตรวจสอบ request ก่อนเข้าถึงฐานข้อมูล
- ดักจับ 400, 404 และ 500 errors

## เทคโนโลยีที่ใช้

- Node.js และ Express
- PostgreSQL และ `pg`
- Express Router
- CORS
- dotenv
- Nodemon
- Postman

## โครงสร้างโปรเจกต์

```text
.
├── app.mjs
├── middleware
│   ├── error-handler.mjs
│   └── validation.mjs
├── postman
│   └── Backend-Skill-Checkpoint.postman_collection.json
├── routes
│   ├── answers.mjs
│   └── questions.mjs
├── utils
│   └── db.mjs
├── .env.example
└── package.json
```

- `app.mjs` ตั้งค่า Express และนำ Router มาใช้งาน
- `routes/` เก็บ endpoint และ SQL ของแต่ละ resource
- `middleware/validation.mjs` ตรวจข้อมูลจาก params, query และ body
- `middleware/error-handler.mjs` จัดการ endpoint ที่ไม่มีและ server errors
- `utils/db.mjs` สร้าง PostgreSQL Connection Pool

## การติดตั้งและเริ่มใช้งาน

### 1. ติดตั้ง Dependencies

```bash
npm install
```

### 2. สร้างฐานข้อมูล

สร้าง PostgreSQL database แล้วรัน SQL Script จาก:

https://gist.github.com/napatwongchr/811ef7071003602b94482b3d8c0f32e0

Script จะสร้างตาราง `questions`, `answers`, `question_votes` และ `answer_votes` พร้อม Foreign Key แบบ `ON DELETE CASCADE`

### 3. ตั้งค่า Environment Variables

คัดลอก `.env.example` เป็น `.env` แล้วแก้ค่าตามเครื่องของตนเอง:

```env
DATABASE_URL=postgresql://YOUR_USERNAME:YOUR_PASSWORD@localhost:5432/YOUR_DATABASE
PORT=5001
```

ไม่ควร commit `.env` เพราะมี username และ password ของฐานข้อมูล

### 4. เริ่ม Server

```bash
npm start
```

Server เริ่มต้นที่ `http://localhost:5001`

## API Endpoints

### Questions

| Method | Endpoint | รายละเอียด | Success |
| --- | --- | --- | --- |
| POST | `/questions` | สร้างคำถาม | 201 |
| GET | `/questions` | ดูคำถามทั้งหมด | 200 |
| GET | `/questions/search?title=node&category=technology` | ค้นหาจากหัวข้อหรือหมวดหมู่ | 200 |
| GET | `/questions/:questionId` | ดูคำถามตาม ID | 200 |
| PUT | `/questions/:questionId` | แก้ไขคำถามบาง field | 200 |
| DELETE | `/questions/:questionId` | ลบคำถาม | 200 |
| POST | `/questions/:questionId/vote` | โหวตคำถาม | 200 |

ตัวอย่าง Body สำหรับสร้างคำถาม:

```json
{
  "title": "What is Node.js?",
  "description": "Please explain Node.js for a beginner.",
  "category": "Software"
}
```

ตัวอย่าง Body สำหรับแก้ไขคำถาม (ส่งเพียง field ที่ต้องการแก้ได้):

```json
{
  "title": "What is the Node.js runtime?"
}
```

### Answers

| Method | Endpoint | รายละเอียด | Success |
| --- | --- | --- | --- |
| POST | `/questions/:questionId/answers` | สร้างคำตอบ ความยาวไม่เกิน 300 ตัวอักษร | 201 |
| GET | `/questions/:questionId/answers` | ดูคำตอบทั้งหมดของคำถาม | 200 |
| DELETE | `/answers/:answerId` | ลบคำตอบรายอัน | 200 |
| POST | `/answers/:answerId/vote` | โหวตคำตอบ | 200 |

ตัวอย่าง Body สำหรับสร้างคำตอบ:

```json
{
  "content": "Node.js is a JavaScript runtime built on the V8 engine."
}
```

### Votes

ส่ง `1` สำหรับ Upvote หรือ `-1` สำหรับ Downvote:

```json
{
  "vote": 1
}
```

## HTTP Status Codes

- `200 OK` อ่าน แก้ไข ลบ หรือโหวตสำเร็จ
- `201 Created` สร้างคำถามหรือคำตอบสำเร็จ
- `400 Bad Request` body, query parameter หรือ ID ไม่ถูกต้อง
- `404 Not Found` ไม่พบ question, answer หรือ endpoint
- `500 Internal Server Error` เกิดข้อผิดพลาดจาก server หรือฐานข้อมูล

## หลักการสำคัญที่ใช้ในโปรเจกต์

### Parameterized SQL

ทุก query รับค่าผ่าน `$1`, `$2` แทนการนำ input มาต่อกับ SQL โดยตรง ช่วยป้องกัน SQL Injection

### Express Router

API ถูกจัดกลุ่มเป็น Question Router และ Answer Router ทำให้ `app.mjs` มีหน้าที่ตั้งค่าหลัก และค้นหา endpoint ได้ง่าย

### Validation Middleware

Middleware ตรวจข้อมูลก่อน route handler เช่น ID ต้องเป็นจำนวนเต็มบวก, ข้อความต้องไม่ว่าง, คำตอบต้องไม่เกิน 300 ตัวอักษร และ vote ต้องเป็น `1` หรือ `-1`

### Error Handling Middleware

Async route ส่ง error ไปยัง Global Error Handler เพื่อให้ server ตอบ `500` โดยไม่เปิดเผยรายละเอียดภายใน ส่วน resource ที่ไม่พบจะตอบ `404`

### ON DELETE CASCADE

เมื่อคำถามถูกลบ PostgreSQL จะลบ answers และ question votes ที่อ้างอิงคำถามนั้น จากนั้น answer votes จะถูกลบตาม answers อีกทอดหนึ่ง จึงไม่เหลือข้อมูลลูกที่ไม่มีข้อมูลแม่

## ทดสอบด้วย Postman

1. เปิด Postman แล้วเลือก **Import**
2. เลือกไฟล์ `postman/Backend-Skill-Checkpoint.postman_collection.json`
3. ตรวจว่า Collection Variable `baseUrl` เป็น `http://localhost:5001`
4. รัน request **Create Question** ก่อน ระบบจะบันทึก ID ไว้ใน `questionId`
5. รัน request **Create Answer** ระบบจะบันทึก ID ไว้ใน `answerId`
6. ทดสอบ read, update, search และ vote
7. ทดสอบ delete เป็นลำดับสุดท้าย
8. สามารถเลือก **Run collection** เพื่อรัน test ที่ตรวจ HTTP status ของทุก request

กรณีทดสอบ Error:

- ส่ง `title` เป็นข้อความว่าง ควรได้ `400`
- ใช้ ID ที่ไม่มีอยู่ เช่น `999999` ควรได้ `404`
- ส่ง `vote` เป็น `2` ควรได้ `400`
- ส่งคำตอบเกิน 300 ตัวอักษร ควรได้ `400`
