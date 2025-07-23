# Hướng dẫn deploy lên GitHub Pages

## Bước 1: Tạo repository trên GitHub
1. Truy cập https://github.com
2. Đăng nhập vào tài khoản GitHub của bạn
3. Click nút "New" hoặc "+" để tạo repository mới
4. Đặt tên repository: `myblog`
5. **Quan trọng**: Để repository ở chế độ Public (GitHub Pages miễn phí chỉ hoạt động với repo public)
6. KHÔNG check "Add a README file" vì chúng ta đã có sẵn
7. Click "Create repository"

## Bước 2: Cập nhật homepage trong package.json
Trong file `package.json`, thay đổi dòng:
```json
"homepage": "https://[YOUR_USERNAME].github.io/myblog",
```
Thành:
```json
"homepage": "https://[tên_github_của_bạn].github.io/myblog",
```

## Bước 3: Kết nối với GitHub repository
Chạy các lệnh sau trong terminal:

```bash
# Thêm remote origin
git remote add origin https://github.com/[tên_github_của_bạn]/myblog.git

# Đổi tên branch thành main (nếu cần)
git branch -M main

# Push code lên GitHub
git push -u origin main
```

## Bước 4: Deploy lên GitHub Pages
```bash
# Build và deploy
npm run deploy
```

## Bước 5: Cấu hình GitHub Pages
1. Vào repository trên GitHub
2. Click tab "Settings"
3. Scroll xuống phần "Pages" ở menu bên trái
4. Trong "Source", chọn "Deploy from a branch"
5. Chọn branch "gh-pages"
6. Folder để "/ (root)"
7. Click "Save"

## Bước 6: Truy cập website
Sau khoảng 5-10 phút, website sẽ có thể truy cập tại:
```
https://[tên_github_của_bạn].github.io/myblog
```

## Cập nhật code sau này
Khi muốn cập nhật website:
```bash
# Commit thay đổi
git add .
git commit -m "Mô tả thay đổi"
git push origin main

# Deploy phiên bản mới
npm run deploy
```

## Chú ý quan trọng
- Repository phải ở chế độ Public để sử dụng GitHub Pages miễn phí
- File Firebase config cần được cấu hình cho production
- Đảm bảo domain trong Firebase Console khớp với GitHub Pages URL
