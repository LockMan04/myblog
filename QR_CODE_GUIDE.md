# Tính năng QR Code - LockMan Blog

## Tổng quan
Tính năng QR Code cung cấp một bộ công cụ hoàn chỉnh để tạo, quét và quản lý mã QR với nhiều tùy chọn khác nhau.

## Các tính năng chính

### 1. Tạo QR Code
- **Văn bản**: Tạo QR code từ văn bản tùy ý
- **Website**: Tạo QR code cho URL/địa chỉ web
- **WiFi**: Tạo QR code để chia sẻ thông tin WiFi
- **Danh bạ**: Tạo QR code chứa thông tin liên hệ (vCard)
- **Email**: Tạo QR code để gửi email nhanh
- **SMS**: Tạo QR code để gửi tin nhắn

### 2. Quét QR Code
- Quét QR code bằng camera
- Upload và đọc QR code từ hình ảnh
- Lưu lịch sử quét
- Xử lý nhiều loại QR code khác nhau

### 3. Tạo QR Code hàng loạt
- Tạo nhiều QR code cùng lúc
- Import dữ liệu từ file CSV
- Tải xuống tất cả QR code dưới dạng file ZIP
- Template có sẵn

### 4. Tính năng nâng cao
- Tùy chỉnh màu sắc và kích thước
- Lưu lịch sử QR code đã tạo
- Mẫu có sẵn cho từng loại QR
- Responsive design cho mobile

## Hướng dẫn sử dụng

### Tạo QR Code đơn lẻ
1. Chọn tab "Tạo QR Code"
2. Chọn loại QR code muốn tạo
3. Điền thông tin cần thiết
4. Tùy chỉnh kích thước và màu sắc (nếu cần)
5. Nhấn "Tải xuống" để lưu QR code

### Quét QR Code
1. Chọn tab "Quét QR Code"
2. Cho phép truy cập camera
3. Hướng camera vào QR code
4. Kết quả sẽ hiển thị ngay lập tức

### Tạo QR Code hàng loạt
1. Chọn tab "Tạo hàng loạt"
2. Thêm từng QR code vào danh sách hoặc import từ CSV
3. Cài đặt thông số chung cho tất cả QR code
4. Nhấn "Tạo & Tải xuống" để tạo file ZIP

### Format file CSV cho batch processing
```csv
Tên,Nội dung,Loại
Website công ty,https://example.com,url
Email hỗ trợ,support@example.com,email
Hotline,+84123456789,phone
Thông tin liên hệ,Công ty ABC - 123 Đường XYZ,text
```

## Các loại QR Code được hỗ trợ

### WiFi QR Code
Format: `WIFI:T:WPA;S:SSID;P:password;H:false;;`

### vCard (Danh bạ)
```
BEGIN:VCARD
VERSION:3.0
FN:Tên đầy đủ
TEL:Số điện thoại
EMAIL:Email
ORG:Công ty
URL:Website
END:VCARD
```

### Email
Format: `mailto:email@example.com?subject=Tiêu đề&body=Nội dung`

### SMS
Format: `sms:+84123456789?body=Tin nhắn`

## Mẹo sử dụng

1. **Kích thước QR Code**: 
   - 128px: Phù hợp cho web
   - 256px: Tối ưu cho in ấn
   - 512px: Chất lượng cao

2. **Màu sắc**:
   - Đảm bảo độ tương phản cao giữa QR code và nền
   - Tránh sử dụng màu quá sáng

3. **WiFi QR Code**:
   - Kiểm tra kỹ SSID và mật khẩu
   - Chọn đúng loại bảo mật

4. **Batch Processing**:
   - Sử dụng file CSV template để đảm bảo format đúng
   - Kiểm tra dữ liệu trước khi tạo hàng loạt

## Tương thích trình duyệt

- Chrome 60+
- Firefox 55+
- Safari 11+
- Edge 79+

## Lưu ý bảo mật

- Không tạo QR code chứa thông tin nhạy cảm
- Kiểm tra kỹ nội dung trước khi chia sẻ
- Thông tin được xử lý hoàn toàn trên client-side

## Hỗ trợ

Nếu gặp vấn đề khi sử dụng, vui lòng:
1. Kiểm tra kết nối internet
2. Đảm bảo trình duyệt được cập nhật
3. Cho phép quyền truy cập camera (với tính năng quét)
4. Xóa cache và thử lại
