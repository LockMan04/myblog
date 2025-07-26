import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useBlur } from '../App';
import AuthModal from './AuthModal';
import { Search, X, Menu } from 'lucide-react';

const Header = () => {
    const [activeDropdown, setActiveDropdown] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [hoverTimeout, setHoverTimeout] = useState(null);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [authMode, setAuthMode] = useState('login');
    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchOpen, setIsSearchOpen] = useState(false);

    const { currentUser, logout } = useAuth();
    const { setIsBlurred } = useBlur();
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await logout();
            navigate('/');
        } catch (error) {
            console.error('Lỗi khi đăng xuất:', error);
        }
    };

    useEffect(() => {
        setIsBlurred(isAuthModalOpen);
    }, [isAuthModalOpen, setIsBlurred]);

    const categories = {
        // 'Kinh doanh': ['Marketing', 'Sales', 'Startup', 'E-commerce', 'Quản lý'],
        // 'Đời sống': ['Sức khỏe', 'Du lịch', 'Ẩm thực', 'Lifestyle', 'Gia đình'],
        'Công cụ': ['Link rút gọn', 'Tạo mã QR', 'Chuyển đổi định dạng', 'Công cụ tìm kiếm'],
        'Chia sẻ': ['Hong 😏', 'Hong 😏', 'Hong 😏', 'Hong 😏'],
        'Khác':  ['Hong 😏', 'Hong 😏', 'Hong 😏', 'Hong 😏'],
    };

    const handleMouseEnter = (category) => {
        // Chỉ dùng hover cho desktop thực sự (không phải touch device)
        if (window.innerWidth > 1024 && !('ontouchstart' in window)) {
            if (hoverTimeout) {
                clearTimeout(hoverTimeout);
                setHoverTimeout(null);
            }
            setActiveDropdown(category);
        }
    };

    const handleMouseLeave = () => {
        // Chỉ dùng hover cho desktop thực sự
        if (window.innerWidth > 1024 && !('ontouchstart' in window)) {
            const timeout = setTimeout(() => {
                setActiveDropdown(null);
            }, 300);
            setHoverTimeout(timeout);
        }
    };

    const handleDropdownClick = (category) => {
        // Toggle dropdown cho tất cả devices khi click
        setActiveDropdown(activeDropdown === category ? null : category);
    };

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setActiveDropdown(null); // Reset dropdown khi toggle menu
    };

    const openAuthModal = (mode) => {
        setAuthMode(mode);
        setIsAuthModalOpen(true);
    };

    const closeAuthModal = () => {
        setIsAuthModalOpen(false);
    };

    const handleSearch = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            // Xử lý search ở đây
            console.log('Tìm kiếm:', searchQuery);
            setIsSearchOpen(false);
        }
    };
    
    // Function để xử lý link đặc biệt cho một số subcategory
    const getSubcategoryLink = (category, subcategory) => {
        // Xử lý các link đặc biệt
        if (subcategory === 'Tạo mã QR') {
            return '/qr-code';
        }
        // Default link pattern
        return `/category/${category.toLowerCase()}/${subcategory.toLowerCase()}`;
    };

    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            // Focus vào input khi mở search
            setTimeout(() => {
                const searchInput = document.querySelector('.search-input');
                if (searchInput) searchInput.focus();
            }, 100);
        }
    };

    return (
        <header className="header">
            <div className="header-content">
                <h1 className="site-title">
                    <Link to="/">LockMan</Link>
                </h1>
                
                <div className={`nav-search-wrapper ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
                    {isMobileMenuOpen && (
                        <button className="mobile-menu-close" onClick={toggleMobileMenu} aria-label="Close menu">
                            <X className="w-6 h-6" />
                        </button>
                    )}
                    <nav className="main-nav">
                    <ul className="nav-list">
                        <li><Link to="/">Trang chủ</Link></li>
                        
                        {/* Mobile Search */}
                        <li className="mobile-search-item">
                            <form className="mobile-search-form" onSubmit={handleSearch}>
                                <input
                                    type="text"
                                    className="mobile-search-input"
                                    placeholder="Tìm kiếm bài viết..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                                <button type="submit" className="mobile-search-btn">
                                    <Search className='w-3 h-3' />
                                </button>
                            </form>
                        </li>
                        
                        {Object.keys(categories).map(category => (
                            <li 
                                key={category}
                                className="dropdown"
                                onMouseEnter={() => handleMouseEnter(category)}
                                onMouseLeave={handleMouseLeave}
                            >
                                <a 
                                    href="#" 
                                    className="dropdown-toggle"
                                    onClick={(e) => {
                                        e.preventDefault(); // Luôn prevent để không chuyển trang
                                        handleDropdownClick(category);
                                    }}
                                >
                                    {category}
                                </a>
                                {activeDropdown === category && (
                                    <ul className="dropdown-menu">
                                        {categories[category].map(subcategory => (
                                            <li key={subcategory}>
                                                <Link to={getSubcategoryLink(category, subcategory)}>
                                                    {subcategory}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </li>
                        ))}
                        <li><Link to="/archive">Lưu trữ</Link></li>
                        <li><a href="/contact">Liên hệ</a></li>
                        
                        {/* Mobile auth section */}
                        {currentUser ? (
                            <li className="mobile-auth-item">
                                <div className="mobile-user-section">
                                    <Link to="/profile" className="mobile-profile-link">
                                        <div className="mobile-user-avatar">
                                            {currentUser.photoURL ? (
                                                <img src={currentUser.photoURL} alt="Avatar" />
                                            ) : (
                                                <div className="avatar-placeholder">
                                                    {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                                </div>
                                            )}
                                        </div>
                                        <span className="mobile-user-name">
                                            {currentUser.displayName || currentUser.email}
                                        </span>
                                    </Link>
                                    <button 
                                        className="mobile-logout-btn"
                                        onClick={() => {
                                            setIsMobileMenuOpen(false);
                                            handleLogout();
                                        }}
                                    >
                                        Đăng xuất
                                    </button>
                                </div>
                            </li>
                        ) : (
                            <li className="mobile-auth-item">
                                <button 
                                    className="mobile-auth-button"
                                    onClick={() => {
                                        setIsMobileMenuOpen(false);
                                        openAuthModal('login');
                                    }}
                                >
                                    Đăng nhập
                                </button>
                            </li>
                        )}
                    </ul>
                </nav>
                
                    {/* Search Section - Desktop only icon */}
                    <div className="search-section">
                        <button 
                            className="search-toggle-btn"
                            onClick={toggleSearch}
                            aria-label="Tìm kiếm"
                        >
                            <Search className='w-3 h-3'/>
                        </button>
                    </div>
                </div>
                
                <button className="mobile-menu-toggle" onClick={toggleMobileMenu} aria-label="Toggle menu">
                    <Menu className="w-6 h-6" />
                </button>
                
                <div className="auth-section">
                    {currentUser ? (
                        <div className="user-actions">
                            <Link to="/profile" className="profile-link">
                                <div className="user-avatar">
                                    {currentUser.photoURL ? (
                                        <img src={currentUser.photoURL} alt="Avatar" />
                                    ) : (
                                        <div className="avatar-placeholder">
                                            {currentUser.displayName ? currentUser.displayName.charAt(0).toUpperCase() : 'U'}
                                        </div>
                                    )}
                                </div>
                                <span className="user-name">
                                    {currentUser.displayName || 'Profile'}
                                </span>
                            </Link>
                            <button 
                                className="logout-btn"
                                onClick={handleLogout}
                            >
                                Đăng xuất
                            </button>
                        </div>
                    ) : (
                        <button 
                            className="auth-btn-header login-only"
                            onClick={() => openAuthModal('login')}
                        >
                            Đăng nhập
                        </button>
                    )}
                </div>
            </div>
            
            <AuthModal 
                isOpen={isAuthModalOpen}
                onClose={closeAuthModal}
                initialMode={authMode}
            />
            
            {/* Search Modal */}
            {isSearchOpen && (
                <div className="search-modal-overlay" onClick={() => setIsSearchOpen(false)}>
                    <div className="search-modal" onClick={(e) => e.stopPropagation()}>
                        <form className="search-modal-form" onSubmit={handleSearch}>
                            <input
                                type="text"
                                className="search-modal-input"
                                placeholder="Tìm kiếm bài viết, tác giả, chủ đề..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                autoFocus
                            />
                            <button type="submit" className="search-modal-submit">
                                <Search className='w-3 h-3' />
                                Tìm kiếm
                            </button>
                        </form>
                        <button 
                            className="search-modal-close"
                            onClick={() => setIsSearchOpen(false)}
                        >
                            <X className='w-3 h-3' />
                        </button>
                    </div>
                </div>
            )}
        </header>
    );
};

export default Header;