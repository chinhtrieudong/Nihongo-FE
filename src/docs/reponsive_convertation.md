# PROMPT AUDIT & FIX RESPONSIVE – PAGE BÀI HỌC HỘI THOẠI

Bạn là **Senior Frontend Engineer + UX/UI Specialist (10+ năm kinh nghiệm)**.
Hãy **đánh giá và cải thiện RESPONSIVE** cho một trang web học tiếng Nhật có layout như sau:

## 1. MÔ TẢ PAGE HIỆN TẠI
- Header trên cùng:
  - Bên trái: nút hamburger
  - Bên phải: toggle dark/light + avatar user
- Layout chính gồm 2 cột:
  - **Sidebar trái (Filter)**:
    - Bộ lọc
    - Ô tìm kiếm
    - Dropdown: Trình độ, Danh mục, Độ khó
    - Slider thời lượng (0–120 phút)
  - **Main content (phải)**:
    - Title: “Bài học hội thoại”
    - Subtitle mô tả
    - Thanh thông báo số lượng bài học tìm thấy
    - Grid các **lesson card**
      - Card có icon
      - Tiêu đề tiếng Nhật + tiếng Việt
      - Mô tả
      - Tag N5 / độ khó
      - Thời lượng
      - Button “Bắt đầu”

👉 Hiện tại trên mobile/tablet:
- Layout **gần như giữ nguyên desktop**
- Sidebar chiếm diện tích lớn
- Card bị hẹp, chữ xuống dòng xấu
- Khoảng cách không hợp lý
- Trải nghiệm mobile kém

---

## 2. NHIỆM VỤ CỦA BẠN
Hãy thực hiện **AUDIT RESPONSIVE TOÀN DIỆN** và đưa ra **GIẢI PHÁP CỤ THỂ**, bao gồm:

### A. BREAKPOINT STRATEGY
Đề xuất breakpoint rõ ràng cho:
- Desktop ≥ 1200px
- Laptop 992–1199px
- Tablet 768–991px
- Mobile ≤ 767px

Giải thích:
- Mỗi breakpoint thay đổi layout gì
- Vì sao chọn breakpoint đó

---

### B. SIDEBAR / FILTER (CỘT TRÁI)
Phân tích & đề xuất:
- Desktop:
  - Sidebar fixed hay scroll theo content?
- Tablet:
  - Sidebar nên:
    - collapse?
    - chuyển thành Drawer?
- Mobile:
  - Sidebar **BẮT BUỘC** chuyển thành:
    - Drawer / Bottom sheet / Fullscreen modal
  - Trigger mở filter ở đâu?
  - UX khi đóng/mở

Yêu cầu:
- Không làm sidebar chiếm chiều cao viewport
- Không che nội dung chính
- Không gây scroll lồng nhau

---

### C. HEADER & TOP BAR
Đánh giá:
- Hamburger hiện tại có hợp lý không?
- Toggle dark mode + avatar có quá nhỏ trên mobile không?

Đề xuất:
- Kích thước touch target (px)
- Khoảng cách an toàn cho ngón tay
- Có cần gom action vào menu không?

---

### D. GRID CARD BÀI HỌC
Phân tích chi tiết card:

#### Desktop:
- Số cột lý tưởng?
- Khoảng cách giữa card?

#### Tablet:
- 2 hay 1 cột?
- Card có cần tăng chiều cao không?

#### Mobile:
- Card full width
- Thứ tự thông tin trong card:
  - Icon
  - Title
  - Meta (N5, độ khó, thời lượng)
  - CTA

Yêu cầu:
- Không để chữ Nhật bị gãy khó đọc
- Không để button quá nhỏ
- Không để card cao quá gây mệt

---

### E. TYPOGRAPHY & SPACING
Đánh giá:
- Font size title / body / meta trên từng breakpoint
- Line-height tiếng Nhật
- Padding card

Đề xuất:
- Font-size cụ thể (px / rem)
- Spacing scale (4 / 8 / 16 / 24)

---

### F. SCROLL & OVERFLOW
Kiểm tra:
- Có scroll ngang không?
- Có double scroll không?
- Drawer / modal có vượt viewport không?

Đề xuất cách fix:
- overflow-x
- max-height
- safe-area-inset

---

### G. ANT DESIGN / CSS IMPLEMENTATION
Nếu dùng **Ant Design + React**, hãy đề xuất:
- Sử dụng `Grid (Row / Col)` hay CSS Grid?
- Dùng `useBreakpoint` như thế nào?
- Khi nào dùng `Drawer`, khi nào dùng `Collapse`

Yêu cầu:
- Ví dụ JSX / pseudo-code
- Không code quá dài
- Tập trung logic responsive

---

## 3. OUTPUT FORMAT (BẮT BUỘC)
Trả lời theo cấu trúc:

1. Tổng quan vấn đề responsive hiện tại
2. Responsive strategy theo breakpoint
3. Sidebar / Filter (chi tiết UX + UI)
4. Header / Navigation
5. Lesson Card grid
6. Typography & spacing
7. Scroll / overflow
8. Gợi ý triển khai kỹ thuật (React + AntD)
9. Checklist test responsive (QA)

👉 Viết **rõ ràng – có gạch đầu dòng – có lý do UX**
👉 Không nói chung chung
👉 Ưu tiên trải nghiệm học tập trên mobile

---

## 4. MỤC TIÊU CUỐI
Sau khi áp dụng:
- Mobile dùng **1 tay thoải mái**
- Tablet không bị “layout desktop thu nhỏ”
- Desktop gọn, học lâu không mệt
- UI nhìn **xịn – học thuật – hiện đại**

Bắt đầu phân tích.
