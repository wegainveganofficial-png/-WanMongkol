# วันมงคล · WanMongkol

ปฏิทินฤกษ์ดีรายวัน ค.ศ. 1900–2050: วันธงชัย วันอธิบดี วันอุบาทว์ วันโลกาวินาศ ปฏิทินจีนน้ำเอี๊ยง สีเสื้อมงคล เลขมงคล ดวงเด็กเกิดวันนี้ วันพระ วันหยุดราชการ และระบบสมาชิกบันทึกวันเกิด/วันโปรด

เว็บเป็นไฟล์ static ล้วน (ไม่ต้อง build) คำนวณปฏิทินในเบราว์เซอร์ทั้งหมด ส่วนข้อมูลสมาชิกเก็บใน Supabase

| ไฟล์ | หน้าที่ |
|---|---|
| `index.html`, `style.css` | หน้าเว็บ |
| `engine.js` | สูตรคำนวณ: จันทรคติไทย, ปฏิทินจีน, ก้านวัน, ดาว 12 ดวง, กาลโยค |
| `app.js` | มุมมองรายวัน / สัปดาห์ / เดือน |
| `member.js` | ล็อกอิน, วันเกิด, วันโปรด (Supabase) |
| `config.js` | URL และ publishable key ของ Supabase |

## Deploy บน Vercel
Import repo นี้ → Framework Preset: **Other** → ไม่ต้องตั้ง Build Command → Deploy

## ตั้งค่า Supabase (ครั้งเดียว)
Authentication → URL Configuration
- Site URL: โดเมนเว็บที่ deploy แล้ว
- Redirect URLs: เพิ่มโดเมนเดียวกัน (และ `http://localhost:*` ถ้าทดสอบในเครื่อง)

ตาราง `profiles`, `people`, `saved_days` เปิด Row Level Security ทุกตาราง ผู้ใช้เห็นเฉพาะข้อมูลของตัวเอง
