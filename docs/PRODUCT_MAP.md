# HóaLab product map

HóaLab tập trung vào một vòng lặp học tập có thể đo lường: **Học → Luyện → Thi → Phân tích → Học bù**. Thí nghiệm ảo và Trợ lý Hóa là công cụ hỗ trợ theo ngữ cảnh, không phải các luồng độc lập cạnh tranh sự chú ý.

```mermaid
flowchart TD
    A[HóaLab] --> B[Tổng quan cá nhân]
    A --> C[Kho tài liệu]
    A --> D[Luyện đề]
    A --> E[Phòng thí nghiệm]
    A --> F[Trợ lý Hóa]
    A --> G[Công cụ]

    B --> B1[Tiếp tục bài đang học]
    B --> B2[Kế hoạch hôm nay]
    B --> B3[Mục tiêu tuần]
    B --> B4[Tiến độ chuyên đề]

    C --> C0[Hóa 10 / Hóa 11 / Hóa 12]
    C0 --> C1[Chương SGK]
    C1 --> C2[Bài học video]
    C2 --> C3[Checkpoint]
    C3 --> C4[Luyện cuối bài]
    C4 --> C5[Mở khóa bài tiếp theo]

    D --> D0[Hóa 10 / Hóa 11 / Hóa 12]
    D0 --> D1[Thư mục Quiz]
    D0 --> D2[Thư mục Đề thi]
    D2 --> D3[Kết quả và chữa chi tiết]
    D3 --> C1

    E --> E1[Chọn thí nghiệm]
    E1 --> E2[Thiết lập điều kiện]
    E2 --> E3[Mô phỏng tương tác]
    E3 --> E4[Báo cáo thực hành]

    F --> F1[Gợi ý từng bước]
    F --> F2[Giải thích khái niệm]
    F --> F3[Chấm tự luận]

    G --> G1[Bảng tuần hoàn]
    G --> G2[Máy tính Hóa học]
```

## Tính năng cốt lõi

1. **Kho tài liệu:** cây nội dung Hóa 10, 11, 12 theo bộ SGK; demo hiện tập trung 8 chương, 30 bài Hóa 12 Kết nối tri thức.
2. **Luyện đề:** luyện nhanh, phòng thi có giám sát và chữa bài chi tiết.
3. **Phòng thí nghiệm:** mô phỏng hiện tượng và cơ chế phản ứng, tạo báo cáo thực hành.
4. **Trợ lý Hóa:** hỗ trợ theo từng bước và chấm phần tự luận; không thay học sinh làm bài.
5. **Tổng quan cá nhân:** chỉ hiển thị việc cần làm tiếp theo, mục tiêu và tiến độ.

## Những phần không còn là điều hướng chính

- Game Hóa học: chỉ nên xuất hiện như một loại hoạt động trong bài học.
- Cộng đồng: hoãn đến khi có cơ chế kiểm duyệt và giá trị học tập rõ ràng.
- Tài liệu PDF: gắn vào từng bài trong Kho tài liệu hoặc mục Công cụ.
- Mini chat AI trên Dashboard: thay bằng lối tắt theo ngữ cảnh để giảm nhiễu.

## Nguyên tắc giao diện

- Một màn hình có một hành động chính.
- Không dùng gradient để trang trí mọi thẻ; màu chỉ thể hiện trạng thái hoặc phân loại.
- Giảm bo góc, bóng đổ và badge không cần thiết.
- Nội dung học và tiến độ xuất hiện trước hoạt động khám phá.
- AI hiện diện như một công cụ hỗ trợ, không phải ngôn ngữ hình ảnh của toàn sản phẩm.
