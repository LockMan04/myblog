import React from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

const TestAuth = () => {
    const { currentUser } = useAuth();

    return (
        <>
            <Header />
            <main className="main-content" style={{ padding: '50px 20px', minHeight: '60vh' }}>
                <div style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center' }}>
                    <h1>Test Authentication</h1>
                    
                    {currentUser ? (
                        <div style={{ 
                            background: '#d4edda', 
                            border: '1px solid #c3e6cb', 
                            borderRadius: '8px', 
                            padding: '20px', 
                            margin: '20px 0' 
                        }}>
                            <h3>✅ Đã đăng nhập thành công!</h3>
                            <p><strong>Email:</strong> {currentUser.email}</p>
                            <p><strong>Tên:</strong> {currentUser.displayName || 'Chưa cập nhật'}</p>
                            <p><strong>UID:</strong> {currentUser.uid}</p>
                            <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
                                👆 Bạn có thể click vào avatar ở góc phải header để thấy menu với nút đăng xuất
                            </p>
                        </div>
                    ) : (
                        <div style={{ 
                            background: '#f8d7da', 
                            border: '1px solid #f5c6cb', 
                            borderRadius: '8px', 
                            padding: '20px', 
                            margin: '20px 0' 
                        }}>
                            <h3>❌ Chưa đăng nhập</h3>
                            <p>Bạn cần đăng nhập để thấy nút đăng xuất</p>
                            <div style={{ marginTop: '15px' }}>
                                <a href="/login" style={{ 
                                    background: '#007bff', 
                                    color: 'white', 
                                    padding: '10px 20px', 
                                    borderRadius: '5px', 
                                    textDecoration: 'none',
                                    marginRight: '10px'
                                }}>
                                    Đăng nhập
                                </a>
                                <a href="/register" style={{ 
                                    background: '#28a745', 
                                    color: 'white', 
                                    padding: '10px 20px', 
                                    borderRadius: '5px', 
                                    textDecoration: 'none'
                                }}>
                                    Đăng ký
                                </a>
                            </div>
                        </div>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
};

export default TestAuth;
