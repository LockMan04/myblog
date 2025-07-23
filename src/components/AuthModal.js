import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Slab } from 'react-loading-indicators';

const AuthModal = ({ isOpen, onClose, initialMode = 'login' }) => {
  const [mode, setMode] = useState(initialMode); // 'login' hoặc 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, signup, loginWithGoogle } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Reset error trước khi bắt đầu
    setError('');
    
    // Validate basic fields
    if (!email?.trim() || !password) {
      return setError('Vui lòng điền đầy đủ email và mật khẩu');
    }

    const trimmedEmail = email.trim();
    
    // Validate email format
    if (!trimmedEmail.includes('@') || trimmedEmail.length < 5) {
      return setError('Email không hợp lệ');
    }

    if (password.length < 6) {
      return setError('Mật khẩu phải có ít nhất 6 ký tự');
    }
    
    // Validate signup specific fields
    if (mode === 'signup') {
      if (!displayName?.trim() || displayName.trim().length < 2) {
        return setError('Tên hiển thị phải có ít nhất 2 ký tự');
      }
      
      if (password !== confirmPassword) {
        return setError('Mật khẩu xác nhận không khớp');
      }
    }

    try {
      setLoading(true);
      
      if (mode === 'login') {
        await login(trimmedEmail, password);
      } else {
        await signup(trimmedEmail, password, displayName.trim());
      }
      
      // Thành công - đóng modal và reset form
      onClose();
      resetForm();
    } catch (error) {
      console.error('Auth error:', error);
      let errorMessage = 'Đã xảy ra lỗi';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'Không tìm thấy tài khoản với email này';
          break;
        case 'auth/invalid-credential':
          errorMessage = mode === 'login' 
            ? 'Email hoặc mật khẩu không đúng. Vui lòng kiểm tra lại thông tin đăng nhập.' 
            : 'Thông tin đăng nhập không hợp lệ';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Mật khẩu không đúng';
          break;
        case 'auth/email-already-in-use':
          errorMessage = 'Email này đã được sử dụng cho tài khoản khác';
          break;
        case 'auth/weak-password':
          errorMessage = 'Mật khẩu quá yếu. Vui lòng sử dụng mật khẩu có ít nhất 6 ký tự';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Định dạng email không hợp lệ';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Quá nhiều lần thử đăng nhập thất bại. Vui lòng thử lại sau 15 phút';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Tài khoản này đã bị vô hiệu hóa bởi quản trị viên';
          break;
        case 'auth/missing-credentials':
          errorMessage = 'Vui lòng điền đầy đủ thông tin đăng nhập';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Phương thức đăng nhập này chưa được kích hoạt';
          break;
        default:
          console.error('Detailed auth error:', {
            code: error.code,
            message: error.message,
            stack: error.stack,
            customData: error.customData,
            serverResponse: error.serverResponse
          });
          
          // Hiển thị thông báo thân thiện với người dùng
          if (process.env.NODE_ENV === 'development') {
            errorMessage = `[DEV] Firebase Error: ${error.code} - ${error.message}`;
          } else {
            errorMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại hoặc liên hệ hỗ trợ';
          }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    // Reset error và bắt đầu loading
    setError('');
    
    try {
      setLoading(true);
      
      // Thực hiện đăng nhập Google
      const result = await loginWithGoogle();
      
      console.log('Google sign-in successful:', result.user.email);
      
      // Thành công - đóng modal và reset form
      onClose();
      resetForm();
      
    } catch (error) {
      console.error('Google sign-in error:', error);
      
      let errorMessage = 'Đăng nhập với Google thất bại';
      
      // Xử lý các loại lỗi Google cụ thể
      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Bạn đã đóng cửa sổ đăng nhập Google';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Trình duyệt đã chặn popup. Vui lòng cho phép popup và thử lại';
          break;
        case 'auth/cancelled-popup-request':
          errorMessage = 'Yêu cầu đăng nhập bị hủy';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Lỗi kết nối mạng. Vui lòng kiểm tra internet';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Đăng nhập Google chưa được kích hoạt';
          break;
        case 'auth/invalid-api-key':
          errorMessage = 'Lỗi cấu hình Firebase API key';
          break;
        case 'auth/app-deleted':
          errorMessage = 'Ứng dụng Firebase không tồn tại';
          break;
        default:
          // Log chi tiết cho dev
          console.error('Google auth detailed error:', {
            code: error.code,
            message: error.message,
            stack: error.stack
          });
          
          if (process.env.NODE_ENV === 'development') {
            errorMessage = `[DEV] Google Auth Error: ${error.code} - ${error.message}`;
          } else {
            errorMessage = 'Không thể đăng nhập với Google. Vui lòng thử lại hoặc sử dụng email/mật khẩu';
          }
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setDisplayName('');
    setError('');
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
    setError('');
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
            <p>Đang xử lý...</p>
          </div>
        </div>
      )}
      <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal" onClick={e => e.stopPropagation()}>
        <div className="auth-modal-header">
          <h2>{mode === 'login' ? 'Đăng nhập' : 'Đăng ký'}</h2>
          <button onClick={onClose} className="close-btn">×</button>
        </div>
        
        <div className="auth-modal-body">
          {error && (
            <div className="error-message">
              {error}
              {(error.includes('Email hoặc mật khẩu không đúng') || error.includes('auth/invalid-credential')) && (
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: '0.8' }}>
                  💡 <strong>Gợi ý:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Kiểm tra chính tả email và mật khẩu</li>
                    <li>Đảm bảo không có dấu cách thừa</li>
                    <li>Thử sử dụng "Đăng nhập với Google" bên dưới</li>
                  </ul>
                </div>
              )}
              {error.includes('popup') && (
                <div style={{ marginTop: '10px', fontSize: '14px', opacity: '0.8' }}>
                  🔧 <strong>Khắc phục:</strong>
                  <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                    <li>Cho phép popup trong trình duyệt</li>
                    <li>Tắt trình chặn popup</li>
                    <li>Thử lại hoặc sử dụng email/mật khẩu</li>
                  </ul>
                </div>
              )}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div className="form-group">
                <label>Tên hiển thị</label>
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Nhập tên của bạn"
                  disabled={loading}
                />
              </div>
            )}
            
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Nhập email của bạn"
                disabled={loading}
              />
            </div>
            
            <div className="form-group">
              <label>Mật khẩu</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu"
                disabled={loading}
              />
            </div>
            
            {mode === 'signup' && (
              <div className="form-group">
                <label>Xác nhận mật khẩu</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Nhập lại mật khẩu"
                  disabled={loading}
                />
              </div>
            )}
            
            <button 
              type="submit" 
              className="auth-btn primary"
              disabled={loading}
            >
              {loading ? 'Đang xử lý...' : (mode === 'login' ? 'Đăng nhập' : 'Đăng ký')}
            </button>
          </form>
          
          <div className="divider">
            <span>Hoặc</span>
          </div>
          
          <button 
            onClick={handleGoogleSignIn}
            className="google-btn"
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            {loading ? 'Đang xử lý...' : 'Đăng nhập với Google'}
          </button>
          
          <div className="auth-switch">
            <p>
              {mode === 'login' ? 'Chưa có tài khoản?' : 'Đã có tài khoản?'}
              <button 
                type="button" 
                onClick={switchMode} 
                className="link-btn"
                disabled={loading}
              >
                {mode === 'login' ? 'Đăng ký' : 'Đăng nhập'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default AuthModal;
