import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PenLine, RotateCcwKey, Bell, LogOut } from 'lucide-react';

const UserProfile = () => {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    if (!currentUser) {
        navigate('/');
        return null;
    }

    return (
        <div className="app">
            <Header />
            <main className="main-content">
                <div className="user-profile-container">
                    <div className="user-profile-header">
                        <div className="user-avatar-large">
                            {currentUser.photoURL ? (
                                <img src={currentUser.photoURL} alt="Avatar" />
                            ) : (
                                <div className="avatar-placeholder-large">
                                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                </div>
                            )}
                        </div>
                        <div className="user-info">
                            <h1 className="user-name">
                                {currentUser.displayName || 'Người dùng'}
                            </h1>
                            <p className="user-email">{currentUser.email}</p>
                            <p className="user-join-date">
                                Tham gia: {new Date(currentUser.metadata.creationTime).toLocaleDateString('vi-VN')}
                            </p>
                        </div>
                    </div>

                    <div className="user-profile-content">
                        <div className="profile-section">
                            <h2>Thông tin cá nhân</h2>
                            <div className="profile-grid">
                                <div className="profile-item">
                                    <label>Tên hiển thị:</label>
                                    <span>{currentUser.displayName || 'Chưa cập nhật'}</span>
                                </div>
                                <div className="profile-item">
                                    <label>Email:</label>
                                    <span>{currentUser.email}</span>
                                </div>
                                <div className="profile-item">
                                    <label>Trạng thái email:</label>
                                    <span className={currentUser.emailVerified ? 'verified' : 'unverified'}>
                                        {currentUser.emailVerified ? 'Đã xác thực' : 'Chưa xác thực'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h2>Hoạt động</h2>
                            <div className="activity-stats">
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">Bài viết</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">Bình luận</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-number">0</span>
                                    <span className="stat-label">Lượt thích</span>
                                </div>
                            </div>
                        </div>

                        <div className="profile-section">
                            <h2>Cài đặt</h2>
                            <div className="settings-actions">
                                <button className="settings-btn">
                                    <PenLine className="icon" />
                                    Chỉnh sửa hồ sơ
                                </button>
                                <button className="settings-btn">
                                    <RotateCcwKey className="icon" />
                                    Đổi mật khẩu
                                </button>
                                <button className="settings-btn">
                                    <Bell className="icon" />
                                    Thông báo
                                </button>
                                <button className="settings-btn danger" onClick={handleLogout}>
                                    <LogOut className="icon" />
                                    Đăng xuất
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default UserProfile;
