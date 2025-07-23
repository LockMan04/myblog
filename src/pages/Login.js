import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Slab } from 'react-loading-indicators';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login, loginWithGoogle } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!email || !password) {
            setError('Vui lòng điền đầy đủ thông tin');
            return;
        }

        try {
            setError('');
            setLoading(true);
            await login(email, password);
            navigate('/'); // Chuyển về trang chủ sau khi đăng nhập thành công
        } catch (error) {
            console.error('Login error:', error);
            
            // Xử lý các loại lỗi khác nhau
            let errorMessage = 'Đăng nhập thất bại. Vui lòng thử lại';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'Không tìm thấy tài khoản với email này';
                    break;
                case 'auth/wrong-password':
                    errorMessage = 'Mật khẩu không đúng';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Email không hợp lệ';
                    break;
                case 'auth/user-disabled':
                    errorMessage = 'Tài khoản này đã bị vô hiệu hóa';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Quá nhiều lần thử đăng nhập. Vui lòng thử lại sau ít phút';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại';
                    break;
                case 'auth/invalid-credential':
                    errorMessage = 'Thông tin đăng nhập không hợp lệ';
                    break;
                case 'auth/missing-credentials':
                    errorMessage = 'Vui lòng điền đầy đủ email và mật khẩu';
                    break;
                default:
                    // Log chi tiết lỗi để debug
                    console.error('Detailed error:', {
                        code: error.code,
                        message: error.message,
                        stack: error.stack
                    });
                    errorMessage = `Lỗi đăng nhập: ${error.message || 'Không xác định'}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        try {
            setError('');
            setLoading(true);
            await loginWithGoogle();
            navigate('/');
        } catch (error) {
            console.error('Google sign in error:', error);
            
            let errorMessage = 'Đăng nhập với Google thất bại';
            
            switch (error.code) {
                case 'auth/popup-closed-by-user':
                    errorMessage = 'Đăng nhập bị hủy bởi người dùng';
                    break;
                case 'auth/popup-blocked':
                    errorMessage = 'Popup đã bị chặn. Vui lòng cho phép popup và thử lại';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại';
                    break;
                default:
                    console.error('Google auth error details:', error);
                    errorMessage = `Lỗi đăng nhập Google: ${error.message || 'Không xác định'}`;
            }
            
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {loading && (
                <div className="loading-overlay">
                    <div className="loading-content">
                        <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
                        <p>Đang đăng nhập...</p>
                    </div>
                </div>
            )}
            <div className="auth-page">
                <div className="auth-container">
                    <div className="auth-card">
                        <div className="auth-header">
                            <h2>Đăng nhập</h2>
                            <p>Chào mừng bạn quay trở lại!</p>
                        </div>

                    {error && <div className="error-message">{error}</div>}

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-group">
                            <label htmlFor="email">Email</label>
                            <input
                                id="email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Nhập email của bạn"
                                disabled={loading}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="password">Mật khẩu</label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Nhập mật khẩu"
                                disabled={loading}
                            />
                        </div>

                        <button 
                            type="submit" 
                            className="auth-submit-btn"
                            disabled={loading}
                        >
                            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                        </button>
                    </form>

                    <div className="divider">
                        <span>Hoặc</span>
                    </div>

                    <button 
                        onClick={handleGoogleSignIn}
                        className="google-signin-btn"
                        disabled={loading}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24">
                            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                        </svg>
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập với Google'}
                    </button>

                    <div className="auth-switch">
                        <p>Chưa có tài khoản? <Link to="/register">Đăng ký ngay</Link></p>
                    </div>
                </div>
            </div>
        </div>
        </>
    );
};

export default Login;
