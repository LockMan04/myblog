# 🎨 HƯỚNG DẪN THAY ĐỔI MÀU SẮC WEBSITE

## 📁 File màu: `src/styles/colors.css`

Tôi đã tạo file `colors.css` để bạn có thể dễ dàng thay đổi màu sắc toàn bộ website mà không cần sửa từng dòng CSS.

## 🔧 Cách sử dụng:

### 1. **Thay đổi màu chính (Primary Color):**
```css
:root {
  --primary-color: #3498db;          /* Thay đổi màu này */
  --primary-hover: #2980b9;          /* Màu khi hover */
}
```

### 2. **Thay đổi toàn bộ theme:**

#### 🌟 Theme xanh lá:
```css
--primary-color: #27ae60;
--primary-hover: #229954;
--gradient-primary: linear-gradient(135deg, #56ab2f 0%, #a8e6cf 100%);
```

#### 🌟 Theme tím:
```css
--primary-color: #9b59b6;
--primary-hover: #8e44ad;
--gradient-primary: linear-gradient(135deg, #8360c3 0%, #2ebf91 100%);
```

#### 🌟 Theme cam:
```css
--primary-color: #e67e22;
--primary-hover: #d35400;
--gradient-primary: linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%);
```

#### 🌟 Theme hồng:
```css
--primary-color: #e91e63;
--primary-hover: #c2185b;
--gradient-primary: linear-gradient(135deg, #ff6a88 0%, #ff9a9e 100%);
```

### 3. **Dark Mode:**
```css
--bg-primary: #2c3e50;
--bg-secondary: #34495e;
--text-primary: #ecf0f1;
--text-secondary: #bdc3c7;
```

## 📝 Các màu có thể thay đổi:

- **Màu chính**: `--primary-color`, `--primary-hover`
- **Màu nền**: `--bg-primary`, `--bg-secondary`
- **Màu chữ**: `--text-primary`, `--text-secondary`
- **Gradient**: `--gradient-hero`, `--gradient-auth`
- **Màu trạng thái**: `--success-color`, `--error-color`

## 🎨 Tool hỗ trợ:

1. **Tạo gradient**: https://cssgradient.io/
2. **Chọn màu**: https://coolors.co/
3. **Palette generator**: https://paletton.com/

## ⚡ Sau khi thay đổi:

1. **Save** file `colors.css`
2. **Refresh** browser (Ctrl + F5)
3. Màu sắc sẽ thay đổi ngay lập tức!

## 💡 Tips:

- Thay đổi từng màu một để xem hiệu quả
- Lưu backup trước khi thay đổi lớn
- Test trên cả desktop và mobile
- Đảm bảo contrast tốt cho accessibility

---
*Happy Customizing! 🚀*
