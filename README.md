# HóaLab

Nền tảng tự học Hóa học THPT tích hợp video tương tác, luyện tập, phòng thi thử và trợ lý AI. Bản demo hiện tập trung vào kiến thức **Hóa học 12** và chạy độc lập trên localhost.

Phiên bản giao diện hiện tại tập trung vào 5 năng lực cốt lõi: lộ trình Hóa 12, luyện đề, phòng thí nghiệm, Trợ lý Hóa và tổng quan tiến độ. Game, cộng đồng và tài liệu rời không còn chiếm điều hướng chính. Xem [sơ đồ sản phẩm](docs/PRODUCT_MAP.md).

## Demo Hóa học 12

- Bài học tương tác **Ester và Lipid** với checkpoint tại `01:30` và `03:45`.
- Bài luyện cuối bài gồm trắc nghiệm và tự luận được AI chấm theo rubric.
- Sổ tay nổi chứa công thức ester hóa, xà phòng hóa và các bẫy thường gặp.
- 15 câu hỏi mẫu thuộc các chuyên đề:
  - Ester – Lipid
  - Carbohydrate
  - Amin – Amino acid – Protein
  - Polymer
  - Điện hóa và kim loại
- 3 đề thi mẫu: 15 phút, 25 phút và đề tổng ôn 45 phút.
- Phòng thi thử có chế độ toàn màn hình, đồng hồ đếm ngược, tự lưu đáp án, đánh dấu xem lại và tự nộp khi hết giờ.
- Hệ thống ghi nhận số lần rời tab hoặc thoát toàn màn hình, nhưng tách tín hiệu giám sát khỏi điểm kiến thức để tránh trừ điểm oan.
- Sau khi nộp, học sinh nhận bảng đối chiếu từng câu gồm đáp án đã chọn, đáp án đúng, trọng số và giải thích.
- Phòng thí nghiệm ảo Hóa 12 có 5 mô phỏng: trùng ngưng nylon-6,6, điều chế ethyl acetate, tráng bạc glucose, phản ứng biuret và pin Zn–Cu.
- Mô phỏng polymer trực quan hóa hai monomer, sự hình thành liên kết amide, quá trình tách nước và chiều dài mạch nylon-6,6 theo tỉ lệ nhóm chức.
- Học sinh phải hoàn tất checklist an toàn, tự điều chỉnh lượng hóa chất, nhiệt độ và điều kiện phản ứng trước khi chạy mô phỏng.
- Hệ thống tạo báo cáo thực hành gồm nhật ký thao tác, hiện tượng, kết luận, điểm an toàn và hiệu suất mô phỏng.

## Hai luồng tài khoản độc lập

Chạy `npm run db:migrate`, cấu hình mật khẩu seed trong biến môi trường riêng, rồi chạy `npm run db:seed:auth`. Seed mặc định dùng ID `admin@hoalab.local` và có thể tạo thêm `student@hoalab.local` nếu cấu hình mật khẩu học sinh. Các tài khoản nằm trong PostgreSQL và chỉ lưu hash Argon2id.

Học sinh vào không gian học tập sau khi đăng nhập. Quản trị viên vào Admin Studio và có tab **Quản lý người dùng** để tìm tài khoản, lọc trạng thái và đặt lại mật khẩu.

Admin được chuyển thẳng vào cổng quản trị riêng. Admin Studio hỗ trợ:

- Nạp bộ dữ liệu demo Hóa 12 chỉ bằng một nút.
- Quản lý 30 bài Hóa 12 theo 8 chương của SGK Kết nối tri thức.
- Tải MP4/WebM lên Vercel Blob riêng tư hoặc gắn URL HTTPS, rồi lưu nháp bài giảng.
- Chọn trực tiếp thời điểm trên video để tạo câu hỏi checkpoint, đáp án và giải thích.
- Xuất bản bài giảng vào Kho tài liệu của học sinh.
- Tạo câu hỏi trắc nghiệm, tự luận hoặc phương trình.
- Chỉnh sửa, nhân bản và xóa an toàn câu hỏi chưa được dùng trong kỳ thi.
- Lọc ngân hàng câu hỏi theo khối lớp và tìm theo chủ đề.
- Nhập tối đa 100 câu từ JSON/CSV.
- Tạo thư mục đề riêng cho Hóa 10, 11, 12 theo cách quản lý file trên máy tính.
- Nhập file vào đúng thư mục và chuyển trực tiếp thành Quiz luyện nhanh hoặc Đề thi có thời gian.
- Ghép câu hỏi thành kỳ thi, đặt thời gian và điểm đạt.
- Xem trước, chỉnh sửa, nhân bản và thay đổi trạng thái kỳ thi.
- Xuất bản, kết thúc kỳ thi và theo dõi lượt làm bài.
- Theo dõi điểm trung bình, tỷ lệ đạt, thời gian làm bài và tín hiệu rời màn hình.
- Đồng bộ dữ liệu quản trị định kỳ 15 giây.

Tài khoản demo chỉ tồn tại trong chế độ development. Khi build production, ứng dụng yêu cầu tài khoản qua biến môi trường.

## Chạy trên localhost

Yêu cầu Node.js `>=22.13.0`.

```bash
npm install
npm run build
npm run dev
```

Mở [http://127.0.0.1:5173](http://127.0.0.1:5173).

Nếu khởi tạo database local lần đầu:

```bash
npm run db:generate
npm run db:migrate
```

Sau khi đăng nhập admin, chọn **Nạp demo Hóa 12** để tạo 15 câu hỏi và 3 kỳ thi mẫu. Thao tác này an toàn khi chạy lại vì dùng ID cố định và cập nhật dữ liệu hiện có.

## Biến môi trường

Thiết lập `DATABASE_URL` và `HOALAB_SESSION_SECRET` trong môi trường chạy. Các biến email và mật khẩu dưới đây chỉ dùng khi seed tài khoản:

```env
DATABASE_URL=postgresql://your-user@localhost:5432/hoalab_dev
HOALAB_SESSION_SECRET=replace-with-a-long-random-secret
HOALAB_ADMIN_EMAIL=admin@example.com
HOALAB_ADMIN_PASSWORD=replace-admin-password
HOALAB_STUDENT_EMAIL=student@example.com
HOALAB_STUDENT_PASSWORD=replace-student-password
HOALAB_STUDENT_GRADE=12
OPENAI_API_KEY=
```

Không đưa `.env.local`, mật khẩu hoặc API key vào Git.

## Kiến trúc

```text
app/
  api/                       HTTP controllers; không chứa giao diện
backend/
  modules/auth/              Session, profile and role authorization
  modules/admin/             Admin authorization boundary
database/
  client.ts                  PostgreSQL connection pool
  schema.ts                  Drizzle PostgreSQL schema
  migrations/                Versioned PostgreSQL migrations
frontend/
  components/                Shared presentation and application shells
  features/                  Dashboard, library, exams, lab, AI and Admin Studio
  styles/                    Design tokens
shared/                      Contracts shared between frontend and backend
docs/                        Architecture and deployment notes
```

Các API luôn kiểm tra session và role ở máy chủ. Việc ẩn nút Admin trên giao diện không được dùng thay cho phân quyền server-side.

## Database

Database hiện tại dùng PostgreSQL 17 và Drizzle ORM, gồm các bảng:

- `profiles`
- `learning_progress`
- `question_bank`
- `exams`
- `exam_questions`
- `exam_attempts`
- `activity_log`
- `exam_folders`
- `lesson_contents`

Tiến trình học được đồng bộ 30 giây một lần; đề đã xuất bản cập nhật mỗi 20 giây; Admin Studio cập nhật mỗi 15 giây.

## AI

- Không có `OPENAI_API_KEY`: sử dụng demo grading engine và câu trả lời Hóa học mẫu.
- Có `OPENAI_API_KEY`: API route gọi OpenAI Responses API ở phía máy chủ.
- API key không bao giờ được gửi xuống trình duyệt.

## Đưa lên Vercel hoặc tên miền riêng

Giao diện, role flow và API contract đã tách khỏi `gpt.site`. Trước khi đưa lên Vercel:

1. Tạo PostgreSQL production trên Neon, Supabase hoặc nhà cung cấp tương đương.
2. Đặt `DATABASE_URL` trong Vercel và chạy migration production.
3. Seed tài khoản production vào PostgreSQL trước khi chuyển sang mã xác thực mới.
4. Khai báo khóa phiên production và các biến dịch vụ cần dùng trong Vercel Dashboard.
5. Kiểm thử đăng nhập, phân quyền admin và lưu tiến trình trước khi trỏ tên miền.

Xem thêm [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md) và [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md).

## Scripts

```bash
npm run dev          # chạy localhost với HMR
npm run build        # kiểm tra và build ứng dụng
npm run start        # chạy bản Next.js production đã build
npm run db:generate  # tạo migration sau khi sửa schema
npm run db:migrate   # chạy migration PostgreSQL
npm run db:studio    # mở giao diện quản trị database
npm run lint         # kiểm tra quy tắc mã nguồn
```
