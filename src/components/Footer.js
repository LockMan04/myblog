import React from 'react';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3>Về chúng tôi</h3>
                    <p>Nơi chia sẻ kinh nghiệm và kiến thức hữu ích cho cộng đồng.</p>
                </div>
                <div className="footer-section">
                    <h3>Danh mục</h3>
                    <ul>
                        <li><a href="/category/share">Chia sẻ</a></li>
                        <li><a href="/category/tools">Công cụ</a></li>
                        {/* <li><a href="/category/doi-song">Đời sống</a></li> */}
                    </ul>
                </div>
                <div className="footer-section">
                    <h3>Liên hệ</h3>
                    <p>Email: lathanhtoan01@gmail.com</p>
                    <p>Phone: +84 332 0** **9</p>
                </div>
            </div>
            <div className="footer-bottom">
                <p>&copy; {new Date().getFullYear()} Chia sẻ kinh nghiệm. Tất cả quyền được bảo lưu.</p>
            </div>
        </footer>
    );
};

export default Footer;