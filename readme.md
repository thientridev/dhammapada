# 🌸 KINH PHÁP CÚ TRANH MINH HỌA (DHAMMAPADA EBOOK & PRINT ENGINE)

> **Dự án Pháp thí số hóa cộng đồng** — Tuyển tập trọn bộ 423 Bài Kệ Kinh Pháp Cú với Tranh minh họa màu, Thơ Lục Bát, Văn xuôi Việt dịch, nguyên tác Pāli và Giọng tụng Audio của Trưởng lão Hòa thượng Thích Minh Châu.

[![GitHub license](https://img.shields.io/badge/license-MIT%20%2F%20Pháp%20Thí-amber.svg)](LICENSE)
[![GitHub stars](https://img.shields.io/github/stars/thientridev/dhammapada.svg?style=social)](https://github.com/thientridev/dhammapada)
[![CDN by jsDelivr](https://data.jsdelivr.com/v1/package/gh/thientridev/dhammapada/badge)](https://www.jsdelivr.com/package/gh/thientridev/dhammapada)

---

## ☸ GIỚI THIỆU DỰ ÁN

**Kinh Pháp Cú (Dhammapada)** là một trong những tác phẩm kinh điển Phật giáo phổ biến và cốt tủy nhất thuộc Tiểu Bộ Kinh (Khuddaka Nikāya). 

Dự án này là một nền tảng **Sách Điện Tử Tương Tác & Động Cơ In Ấn Xuất Bản (Web-to-Print A5 Landscape Engine)** mã nguồn mở, cho phép bất kỳ ai (cá nhân, tự viện, trang web Phật học, blog cá nhân) đều có thể **nhúng toàn bộ 450 trang sách vào website của mình chỉ với 3 dòng mã HTML**.

---

## ✨ CÁC TÍNH NĂNG NỔI BẬT

* 🎨 **Đồ họa chuẩn mực**: 450 trang sách khổ **A5 Nằm Ngang** (1 Trang Bìa Chính + 26 Bìa Phẩm + 423 Bài Kệ).
* 🖼️ **Tranh minh họa gốc HD**: 423 bức họa sơn dầu Phật giáo quý giá của họa sĩ người Sri Lanka **Mr. Piyadhasa Wickramanayake**.
* 📖 **Đa tầng nội dung**: Mỗi bài kệ gồm Tiêu đề, Thơ Lục Bát Việt dịch, Khung Pāli nguyên tác, và Phần Dịch Nghĩa tường minh.
* 🎧 **Trình phát Audio Phật học (Multi-track Audio Engine)**:
  - Tích hợp sẵn giọng tụng/đọc của **Trưởng lão HT. Thích Minh Châu** cho Lời Tựa và 26 Phẩm (Phẩm 26 tự động nối bài liên tục A ➔ B).
  - Hỗ trợ **Phát nhạc nền (Background Playback)**: Vừa nghe tụng vừa thoải mái lật xem từng bài kệ.
* 🖨️ **Động cơ In ấn PDF Siêu Nhẹ (Canvas Turbo Compressor)**:
  - Xuất bản file PDF chuẩn A5 Landscape tràn viền 100%, không khoảng trắng thừa.
  - Tự động nén ảnh qua Canvas giúp file PDF 21 trang chỉ nặng **~2MB - 3MB** (chữ Vector nét căng, phóng to 1000% không vỡ hạt).
* 📱 **Tương thích 100% Đa thiết bị**:
  - **Máy tính (PC/Laptop)**: Tự động co giãn theo Tỉ lệ Vàng 110% (`874px x 605px`) thanh thoát, sắc nét.
  - **Điện thoại (Mobile)**: Tự chuyển bố cục dọc thông minh, hỗ trợ **Cử chỉ vuốt chạm (Touch Swipe)** lật trang mượt mà.
* ⚡ **Tiện ích cao cấp**: Chế độ Toàn màn hình (Fullscreen `⛶`), Ô gõ số kệ nhảy nhanh (Quick Jump `[Kệ 154] -> Enter`), Hiệu ứng chuyển trang mờ nhẹ (Micro-fade `0.15s`).
* ☁️ **Không tốn chi phí Server**: Toàn bộ dữ liệu, hình ảnh và âm thanh được lưu trữ miễn phí trên GitHub và phân phối qua CDN jsDelivr toàn cầu.

---

## 🚀 CÁCH NHÚNG NHANH VÀO WEBSITE (CHỈ MẤT 30 GIÂY)

Bạn có thể nhúng cuốn sách điện tử này vào bất kỳ website nào (**Blogger, WordPress, Web tĩnh HTML, Notion, v.v.**) bằng cách dán đoạn mã sau vào bài viết:

```html
<!-- NHÚNG SÁCH KINH PHÁP CÚ TRANH MINH HỌA A5 -->
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada.css" />
<script src="https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada.js" defer></script>
```

> **Lưu ý**: Chỉ cần nhúng 2 dòng trên, JavaScript sẽ tự động khởi tạo toàn bộ không gian phòng đọc sách tương tác toàn màn hình, tải ảnh, âm thanh và kết nối cơ sở dữ liệu hoàn toàn tự động!

---

## 🛠️ HƯỚNG DẪN TỰ TRIỂN KHAI KHO RIÊNG (SELF-HOSTING GUIDE)

Nếu bạn muốn Fork hoặc tải toàn bộ mã nguồn về để lưu trữ trên GitHub cá nhân của mình:

### 1. Cấu trúc thư mục kho lưu trữ:

```text
dhammapada/
├── audio/                     # Chứa 28 file MP3 (Lời tựa + 26 Phẩm)
│   ├── 00LoiTua.mp3
│   ├── 01PhamSongYeu.mp3
│   └── ...
├── images/                    # Chứa 423 bức tranh WebP + 2 hình nền
│   ├── hinhnen01.webp         # Watermark Đức Phật
│   ├── hinhnen02.webp         # Watermark Hoa Sen
│   ├── verse-001.webp
│   └── ...
├── dhammapada_chapters.json   # Dữ liệu 26 Phẩm (Tên Pāli, Giới thiệu, Link Audio)
├── dhammapada_verses.json     # Dữ liệu 423 bài kệ (Thơ, Pāli, Dịch nghĩa)
├── dhammapada.css             # Giao diện, Hiệu ứng & Động cơ Print PDF
├── dhammapada.js              # Bộ dựng DOM, Audio Engine & Bộ điều hướng
└── README.md
```

### 2. Tùy biến đường dẫn CDN cá nhân:
Trong file `dhammapada.js` và `dhammapada.css`, bạn chỉ cần thay đổi tên tài khoản `thientridev` thành tên tài khoản GitHub của bạn:

```javascript
// Thay 'thientridev' bằng 'tai-khoan-cua-ban'
const CHAPTERS_URL = "https://cdn.jsdelivr.net/gh/tai-khoan-cua-ban/dhammapada@main/dhammapada_chapters.json";
const VERSES_URL = "https://cdn.jsdelivr.net/gh/tai-khoan-cua-ban/dhammapada@main/dhammapada_verses.json";
const AUDIO_BASE = "https://cdn.jsdelivr.net/gh/tai-khoan-cua-ban/dhammapada@main/audio/";
```

---

## ⌨️ PHÍM TẮT & THAO TÁC ĐIỀU HƯỚNG

| Thao tác | Hành động |
| :--- | :--- |
| **Phím Mũi Tên Phải (`→`) / Phím Cách (`Space`)** | Lật sang trang/bài kệ sau |
| **Phím Mũi Tên Trái (`←`)** | Lật về trang/bài kệ trước |
| **Gõ số vào ô `[Kệ...]` + Enter** | Nhảy tức thì đến bài kệ tương ứng (Kệ 1 - 423) |
| **Bấm vào Logo `EDEVX KINH PHÁP CÚ`** | Quay trở về Trang Bìa Sách Chính (Trang 1) |
| **Thanh Trượt (Range Slider)** | Kéo trượt tự do từ trang 1 đến 450 |
| **Menu Chọn Phẩm (Dropdown)** | Nhảy nhanh đến trang bìa của bất kỳ Phẩm nào trong 26 Phẩm |
| **Vuốt Trái / Vuốt Phải (Trên điện thoại)** | Lật trang bằng cảm ứng vuốt chạm |

---

## 🙏 CÔNG ĐỨC & TRI ÂN NGUỒN TÀI LIỆU

Dự án thành tựu nhờ vào sự cống hiến và tư liệu quý báu của chư tôn đức và các nghệ sĩ:

* ✍️ **Việt Dịch**: Trưởng lão Hòa thượng **Thích Minh Châu** (Bản dịch Việt văn kinh điển từ nguyên tác Pāli).
* 🎨 **Tranh Minh Họa Màu**: Họa sĩ **Mr. Piyadhasa Wickramanayake** (Sri Lanka).
* 🎙️ **Giọng Tụng / Đọc Audio**: Trưởng lão Hòa thượng **Thích Minh Châu**.
* ⚙️ **Nền tảng Kỹ thuật & UI/UX**: Đội ngũ phát triển **Education DevX (EDEVX Engine)**.

---

## 📜 GIẤY PHÉP & Ý THỨC CỘNG ĐỒNG (LICENSE)

- **Mục đích**: Dự án hoàn toàn **phi thương mại, phục vụ mục đích học Phật, hoằng pháp, nghiên cứu và pháp thí cộng đồng**.
- **Chia sẻ**: Mọi người đều có quyền tự do sử dụng, sao chép, nhúng vào trang web hoặc in ấn thành sách cúng dường mà không phải xin phép.
- Khi sử dụng, xin hoan hỷ giữ gìn sự tôn nghiêm của kinh điển và ghi rõ nguồn gốc tác giả dịch thuật, minh họa để tôn vinh công đức của các bậc tiền bối.

---

<p align="center">
  <i>"Pháp thí thắng mọi thí,<br/>
  Hương pháp thắng mọi hương,<br/>
  Vị pháp thắng mọi vị,<br/>
  Ái diệt dứt mọi khổ."</i><br/>
  <b>— Kinh Pháp Cú, Kệ số 354 —</b>
</p>