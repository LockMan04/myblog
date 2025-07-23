import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';

const NotFound = () => {
    return (
        <div className="App">
            <Header />
            <div className="not-found-page">
                <div className="not-found-container">
                    <div className="error-animation">
                        <div className="error-code">404</div>
                        <div className="floating-icons">
                            <span className="icon">🔍</span>
                            <span className="icon">📄</span>
                            <span className="icon">❓</span>
                        </div>
                    </div>
                    
                    <div className="error-content">
                        <h1>Oops! Trang không tìm thấy</h1>
                        <p>
                            Trang bạn đang tìm kiếm có thể đã bị xóa, đổi tên hoặc không tồn tại.
                            Hãy kiểm tra lại URL hoặc quay về trang chủ.
                        </p>
                        
                        <div className="error-actions">
                            <Link to="/myblog" className="btn-primary">
                                🏠 Về trang chủ
                            </Link>
                            <button 
                                onClick={() => window.history.back()} 
                                className="btn-secondary"
                            >
                                ← Quay lại
                            </button>
                        </div>
                        
                        <div className="suggestions">
                            <h3>Có thể bạn đang tìm:</h3>
                            <ul>
                                <li><Link to="/myblog">Trang chủ</Link></li>
                                <li><a href="/myblog#posts">Bài viết mới nhất</a></li>
                                <li><a href="/contact">Liên hệ</a></li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
};

export default NotFound;
