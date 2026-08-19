import os
import re
from PIL import Image

# 1. Đường dẫn thư mục ảnh gốc và thư mục xuất WebP
input_folder = r"C:\Users\TRAMCAN\Downloads\KinhPhapCu"
output_folder = r"C:\Users\TRAMCAN\Downloads\KinhPhapCu_WebP"

# Tạo thư mục đích nếu chưa có
os.makedirs(output_folder, exist_ok=True)

# 2. Lấy danh sách toàn bộ file ảnh (.jpg, .jpeg, .png)
supported_exts = ('.jpg', '.jpeg', '.png', '.webp')
all_files = [f for f in os.listdir(input_folder) if f.lower().endswith(supported_exts)]

print(f"🔍 Tìm thấy {len(all_files)} file ảnh trong thư mục gốc.")
print("🚀 Bắt đầu quá trình tối ưu & đổi sang chuẩn WebP...")

success_count = 0

for filename in all_files:
    file_path = os.path.join(input_folder, filename)
    
    # Trích xuất số thứ tự kệ từ tên file (bắt được cả DS001, DS059.png, DSa409.jpg...)
    num_match = re.search(r'\d+', filename)
    if not num_match:
        print(f"⚠️ Bỏ qua file không có số: {filename}")
        continue
    
    verse_num = int(num_match.group())
    new_filename = f"verse-{verse_num:03d}.webp"
    output_path = os.path.join(output_folder, new_filename)
    
    try:
        with Image.open(file_path) as img:
            # Chuyển hệ màu sang RGB nếu là ảnh PNG/RGBA
            if img.mode in ("RGBA", "P"):
                img = img.convert("RGB")
            
            # Giới hạn kích thước tối đa 1400px (giữ nguyên tỷ lệ, tối ưu in A5)
            max_size = 1400
            if max(img.size) > max_size:
                img.thumbnail((max_size, max_size), Image.Resampling.LANCZOS)
            
            # Lưu sang định dạng WebP chất lượng cao (quality=85)
            img.save(output_path, "WEBP", quality=85, method=6)
            success_count += 1
            print(f"✅ [{success_count}/{len(all_files)}] Đã chuyển đổi: {filename} -> {new_filename}")
            
    except Exception as e:
        print(f"❌ Lỗi khi xử lý file {filename}: {e}")

print("-" * 50)
print(f"🎉 HOÀN THÀNH XUẤT SẮC {success_count} ẢNH CHUẨN WEBP!")
print(f"📁 Thư mục kết quả: {output_folder}")