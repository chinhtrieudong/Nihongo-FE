# Hướng Dẫn Sử Dụng HanziWriter

## 1. HanziWriter là gì?

HanziWriter là một thư viện JavaScript mã nguồn mở giúp bạn tạo các ứng dụng tương tác để luyện tập viết ký tự Hán (Hanzi/Kanji). Thư viện này cung cấp:

- Hiển thị ký tự với animation nét vẽ đẹp mắt
- Theo dõi và phản hồi quá trình viết của người dùng
- Hỗ trợ đánh giá độ chính xác của nét vẽ
- Có thể tùy chỉnh giao diện và hành vi

## 2. Cài đặt HanziWriter

### Cài đặt từ NPM

```bash
npm install hanzi-writer
# hoặc
yarn add hanzi-writer
# hoặc
pnpm add hanzi-writer
```

### Cài đặt từ CDN (trong HTML)

```html
<script src="https://cdn.jsdelivr.net/npm/hanzi-writer@2.2.6/dist/hanzi-writer.min.js"></script>
```

## 3. Cách Sử Dụng Cơ Bản

### 3.1 Khởi tạo HanziWriter

```javascript
import HanziWriter from 'hanzi-writer';

const writer = HanziWriter.create('target-div', {
  character: '好',  // Ký tự muốn hiển thị
  width: 400,
  height: 400,
  padding: 20,
});
```

**Các thành phần:**
- `'target-div'`: ID hoặc phần tử DOM nơi vẽ canvas
- `character`: Ký tự Hán cần hiển thị (yêu cầu bắt buộc)
- `width`, `height`: Kích thước canvas (px)
- `padding`: Khoảng cách từ ký tự đến mép canvas (px)

### 3.2 Hiển thị Animation Nét Vẽ

```javascript
// Phát lại animation của tất cả nét vẽ
writer.animate();

// Phát lại animation nét vẽ thứ i (bắt đầu từ 0)
writer.animateStroke(0);

// Phát lại animation từ nét vẽ thứ i đến j
writer.animateStrokes(1, 3);
```

### 3.3 Vẽ từng phần của ký tự

```javascript
// Vẽ toàn bộ ký tự
writer.drawCharacter();

// Vẽ riêng từng nét vẽ
writer.drawStroke(0);  // Nét thứ nhất
writer.drawStroke(1);  // Nét thứ hai

// Vẽ một phạm vi các nét vẽ
writer.drawStrokes(0, 3);
```

### 3.4 Xóa Canvas

```javascript
// Xóa toàn bộ canvas
writer.clear();

// Chỉ xóa nét vẽ người dùng (không xóa ký tự gốc)
writer.cancelAnimation();
```

## 4. Tùy Chỉnh Cấu Hình (Options)

### Các tùy chọn màu sắc

```javascript
const writer = HanziWriter.create('target', {
  character: '好',
  strokeColor: '#00ff00',           // Màu nét vẽ gốc (mặc định: #1f1f1f)
  outlineColor: '#cccccc',          // Màu viền ngoài (mặc định: #ddd)
  radicalColor: '#ff0000',          // Màu của phần chủ yếu (radical)
  highlightColor: '#ff9600',        // Màu nổi bật khi hover
  drawingColor: '#0066cc',          // Màu nét vẽ của người dùng
  drawingWidth: 4,                  // Độ dày nét vẽ của người dùng (mặc định: 2)
});
```

### Các tùy chọn animation

```javascript
const writer = HanziWriter.create('target', {
  character: '好',
  animationDuration: 1000,  // Thời gian animation (ms) - mặc định: 400
  delayBetweenStrokes: 200, // Khoảng cách giữa các nét vẽ (ms) - mặc định: 100
  strokeAnimationSpeed: 1,  // Tốc độ animation (mặc định: 1)
});
```

### Tùy chọn phông chữ và kích thước

```javascript
const writer = HanziWriter.create('target', {
  character: '好',
  width: 500,
  height: 500,
  padding: 30,
  fontSize: 200,  // Kích thước ký tự (mặc định: width - 2*padding)
});
```

## 5. Các Sự Kiện (Events)

HanziWriter cung cấp callback functions để theo dõi các sự kiện:

```javascript
const writer = HanziWriter.create('target', {
  character: '好',
  onComplete: () => {
    console.log('Animation hoàn thành!');
  }
});

// Khi một nét vẽ hoàn thành
writer.onStrokeComplete = (strokeData) => {
  console.log('Nét vẽ đã hoàn thành:', strokeData);
};
```

## 6. Các Phương Thức Hữu Ích

### Quản lý State

```javascript
// Lấy số nét vẽ của ký tự
const strokeCount = writer.getNumStrokes();
console.log(`Ký tự '好' có ${strokeCount} nét vẽ`);

// Kiểm tra xem animation đang chạy hay không
const isAnimating = writer.isAnimating();

// Lấy thông tin về một nét vẽ
const strokeInfo = writer.getStrokeData(0);
```

### Điều khiển Animation

```javascript
// Tạm dừng animation
writer.pauseAnimation();

// Tiếp tục animation
writer.resumeAnimation();

// Dừng animation
writer.cancelAnimation();

// Quay lại bước trước
writer.undoStroke();
```

### Kiểm tra Vẽ của Người Dùng

```javascript
// Kiểm tra xem người dùng vẽ đúng không
writer.checkStroke(strokeIndex, userStrokeData);

// Nhận tất cả thông tin nét vẽ
const allStrokes = writer.getStrokesData();
```

## 7. Ví Dụ Thực Tế

### Ví dụ 1: Hiển thị ký tự với animation

```javascript
import HanziWriter from 'hanzi-writer';

const writer = HanziWriter.create('canvas', {
  character: '中',
  width: 400,
  height: 400,
  padding: 20,
  strokeColor: '#000',
  outlineColor: '#ccc',
});

// Phát animation ngay khi tải
writer.animate({
  onComplete: () => {
    console.log('Hoàn thành vẽ ký tự 中');
  }
});
```

### Ví dụ 2: Interactive - Người dùng luyện tập

```javascript
const writer = HanziWriter.create('practice', {
  character: '好',
  width: 400,
  height: 400,
  strokeColor: '#ddd',
  drawingColor: '#0066cc',
  drawingWidth: 3,
});

// Hiển thị ký tự mờ để người dùng theo dõi
writer.drawCharacter();

// Cho phép người dùng vẽ trên canvas
let isDrawing = false;
const canvas = document.getElementById('practice').querySelector('canvas');

canvas.addEventListener('mousedown', () => { isDrawing = true; });
canvas.addEventListener('mouseup', () => { isDrawing = false; });
canvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  // Xử lý vẽ của người dùng
});
```

### Ví dụ 3: Danh sách ký tự để luyện tập

```javascript
const characters = ['好', '大', '小', '中', '人'];
let currentIndex = 0;

function loadCharacter(index) {
  const character = characters[index];
  const writer = HanziWriter.create('canvas', {
    character: character,
    width: 400,
    height: 400,
  });
  
  writer.animate();
  
  // Nút tiếp theo
  document.getElementById('next').addEventListener('click', () => {
    if (currentIndex < characters.length - 1) {
      currentIndex++;
      loadCharacter(currentIndex);
    }
  });
}

loadCharacter(0);
```

## 8. Các Ký Tự Được Hỗ Trợ

HanziWriter hỗ trợ:
- **Hán tự**: 好, 中, 国, 人, 大, 小, 水, 火, 木, v.v.
- **Ký tự Kanji Nhật Bản**: 漢, 字, 学, 書, v.v.
- **Tất cả các ký tự CJK** được định nghĩa trong cơ sở dữ liệu SVG chính thức của HanziWriter

Để xem danh sách đầy đủ, truy cập: https://github.com/chanind/hanzi-writer-data

## 9. Lỗi Thường Gặp và Cách Khắc Phục

### Lỗi 1: "Character not supported"

**Nguyên nhân**: Ký tự không được hỗ trợ hoặc cơ sở dữ liệu không tải được

**Giải pháp**:
```javascript
const writer = HanziWriter.create('target', {
  character: '好',
  // Chỉ định đường dẫn custom nếu cần
  dataSource: 'https://cdn.jsdelivr.net/npm/hanzi-writer-data@2.0.1/data/',
});
```

### Lỗi 2: Canvas không hiển thị

**Nguyên nhân**: Element không tồn tại hoặc không có kích thước

**Giải pháp**:
```javascript
// Đảm bảo element tồn tại
const element = document.getElementById('canvas');
if (element) {
  const writer = HanziWriter.create(element, {
    character: '好',
    width: 400,
    height: 400,
  });
}
```

## 10. Tài Liệu Tham Khảo

- **GitHub chính thức**: https://github.com/chanind/hanzi-writer
- **NPM Package**: https://www.npmjs.com/package/hanzi-writer
- **API Documentation**: https://github.com/chanind/hanzi-writer/blob/master/docs/api.md
- **Dữ liệu ký tự**: https://github.com/chanind/hanzi-writer-data

## 11. Mẹo Sử Dụng Hiệu Quả

1. **Tối ưu hóa performance**: Không tạo quá nhiều writer instance cùng lúc
2. **Responsive design**: Sử dụng media query để điều chỉnh width/height theo kích thước màn hình
3. **Preload data**: Tải dữ liệu trước để animation mượt mà hơn
4. **Gesture support**: Kết hợp với thư viện như Hammer.js để hỗ trợ gesture trên mobile
5. **Accessibility**: Thêm alt text và ARIA labels cho canvas

---

Hy vọng hướng dẫn này giúp bạn hiểu rõ về HanziWriter và cách sử dụng nó hiệu quả! 🎓
