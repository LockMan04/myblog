import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { EllipsisVertical, Pencil, Eye , EyeOff, Archive, Trash2, RotateCcw } from 'lucide-react';
import { Dropdown, DropdownItem, DropdownSeparator } from './Dropdown';
import { toggleBlogVisibility, archiveBlog, softDeleteBlog, restoreBlog } from '../firebase/blogService';

const BlogPost = ({ title, content, category, date, author, excerpt, imageUrl, id, authorId, published, archived, deleted, onUpdate }) => {
    const { currentUser, role } = useAuth();
    const navigate = useNavigate();
    const defaultImage = "https://placehold.co/400x400";
    
    // Kiểm tra xem user hiện tại có phải là tác giả hoặc admin không
    const isAuthor = currentUser && currentUser.uid === authorId;
    const isAdmin = role === 'admin';
    const canEdit = isAuthor || isAdmin;
    
    // Tạo excerpt từ content nếu không có excerpt
    const getExcerpt = () => {
        if (excerpt) return excerpt;
        
        // Nếu content có HTML tags (từ Quill), loại bỏ chúng
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = content;
        const plainText = tempDiv.textContent || tempDiv.innerText || '';
        
        return plainText.length > 150 
            ? plainText.substring(0, 150) + '...' 
            : plainText;
    };
    
    // Tạo slug từ title và id
    const createSlug = () => {
        const slug = title.toLowerCase()
            .replace(/[^\w\s-]/g, '') // Loại bỏ ký tự đặc biệt
            .replace(/\s+/g, '-')      // Thay khoảng trắng bằng -
            .trim();
        return id ? `${slug}-${id}` : slug;
    };
    
    const postSlug = createSlug();

    // Handlers cho các actions
    const handleToggleVisibility = async () => {
        try {
            await toggleBlogVisibility(id, published);
            toast.success(
                published ? 'Đã ẩn bài viết' : 'Đã hiển thị bài viết',
                {
                    description: published ? 'Bài viết đã được ẩn khỏi trang chủ' : 'Bài viết đã được hiển thị trên trang chủ',
                    icon: published ? '👁️‍🗨️' : '👁️'
                }
            );
            if (onUpdate) onUpdate(); // Callback để refresh danh sách
        } catch (error) {
            console.error('Lỗi khi thay đổi trạng thái hiển thị:', error);
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể thay đổi trạng thái hiển thị. Vui lòng thử lại.'
            });
        }
    };

    const handleArchive = async () => {
        toast.warning('Xác nhận lưu trữ bài viết', {
            description: 'Bài viết sẽ được chuyển vào mục lưu trữ và ẩn khỏi trang chủ',
            icon: '📁',
            action: {
                label: 'Xác nhận',
                onClick: async () => {
                    try {
                        await archiveBlog(id);
                        toast.success('Đã lưu trữ bài viết', {
                            description: 'Bài viết đã được chuyển vào mục lưu trữ. Bạn có thể khôi phục bất cứ lúc nào.',
                            icon: '📁'
                        });
                        if (onUpdate) onUpdate();
                    } catch (error) {
                        console.error('Lỗi khi lưu trữ:', error);
                        toast.error('Có lỗi xảy ra', {
                            description: 'Không thể lưu trữ bài viết. Vui lòng thử lại.'
                        });
                    }
                }
            },
            cancel: {
                label: 'Hủy',
                onClick: () => {}
            }
        });
    };

    const handleSoftDelete = async () => {
        toast.error('Xác nhận xóa bài viết', {
            description: 'Bài viết sẽ bị xóa tạm thời và có thể khôi phục trong 14 ngày',
            icon: '🗑️',
            action: {
                label: 'Xác nhận xóa',
                onClick: async () => {
                    try {
                        await softDeleteBlog(id);
                        toast.warning('Đã xóa bài viết', {
                            description: 'Bài viết đã được xóa tạm thời. Bài viết sẽ bị xóa vĩnh viễn sau 14 ngày.',
                            icon: '🗑️'
                        });
                        if (onUpdate) onUpdate();
                    } catch (error) {
                        console.error('Lỗi khi xóa:', error);
                        toast.error('Có lỗi xảy ra', {
                            description: 'Không thể xóa bài viết. Vui lòng thử lại.'
                        });
                    }
                }
            },
            cancel: {
                label: 'Hủy',
                onClick: () => {}
            }
        });
    };

    const handleRestore = async () => {
        try {
            await restoreBlog(id);
            toast.success('Đã khôi phục bài viết', {
                description: 'Bài viết đã được khôi phục thành công.',
                icon: '↩️'
            });
            if (onUpdate) onUpdate();
        } catch (error) {
            console.error('Lỗi khi khôi phục:', error);
            toast.error('Có lỗi xảy ra', {
                description: 'Không thể khôi phục bài viết. Vui lòng thử lại.'
            });
        }
    };
    
    return (
        <article className="blog-post">
            <div className="post-image">
                <img 
                    src={imageUrl || defaultImage} 
                    alt={title}
                    onError={(e) => {
                        e.target.src = defaultImage;
                    }}
                />
                <div className="image-overlay">
                    <span className="category">{category}</span>
                    {canEdit && (
                        <div className="post-menu-wrapper">
                            <Dropdown
                                align="end"
                                sideOffset={5}
                                className="post-menu-dropdown"
                                trigger={
                                    <button 
                                        className="post-menu-btn"
                                        aria-label="Tùy chọn bài viết"
                                    >
                                        <EllipsisVertical className='w-4 h-4' />
                                    </button>
                                }
                            >
                                <DropdownItem 
                                    className="menu-item"
                                    onSelect={() => navigate(`/edit-blog/${id}`)}
                                >
                                    <Pencil style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                    Chỉnh sửa
                                </DropdownItem>
                                
                                {isAdmin && !isAuthor && (
                                    <>
                                        <DropdownSeparator className="menu-divider" />
                                        <div style={{ padding: '8px 12px', fontSize: '12px', color: '#666', background: '#f8f9fa' }}>
                                            👑 Quyền Admin
                                        </div>
                                    </>
                                )}
                                
                                <DropdownSeparator className="menu-divider" />
                                
                                {deleted ? (
                                    <DropdownItem 
                                        className="menu-item"
                                        onSelect={handleRestore}
                                    >
                                        <RotateCcw style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                        Khôi phục
                                    </DropdownItem>
                                ) : (
                                    <>
                                        {published ? (
                                            <DropdownItem 
                                                className="menu-item"
                                                onSelect={handleToggleVisibility}
                                            >
                                                <EyeOff style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                                Ẩn bài viết
                                            </DropdownItem>
                                        ) : (
                                            <DropdownItem 
                                                className="menu-item"
                                                onSelect={handleToggleVisibility}
                                            >
                                                <Eye style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                                Hiển thị
                                            </DropdownItem>
                                        )}
                                        
                                        <DropdownItem 
                                            className="menu-item"
                                            onSelect={handleArchive}
                                        >
                                            <Archive style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                            Lưu trữ
                                        </DropdownItem>
                                        
                                        <DropdownSeparator className="menu-divider" />
                                        
                                        <DropdownItem 
                                            className="menu-item danger"
                                            onSelect={handleSoftDelete}
                                        >
                                            <Trash2 style={{ width: '22px', height: '22px' }} strokeWidth={2} />
                                            Xóa bài viết
                                        </DropdownItem>
                                    </>
                                )}
                            </Dropdown>
                        </div>
                    )}
                </div>
            </div>
            <div className="post-content">
                <div className="post-meta">
                    <span className="date">{date}</span>
                    <span className="author">bởi {author}</span>
                </div>
                <h2 className="post-title">
                    <button 
                        className="post-title-link"
                        onClick={() => navigate(`/post/${postSlug}`)}
                    >
                        {title}
                    </button>
                </h2>
                <div className="post-excerpt">
                    <p>{getExcerpt()}</p>
                </div>
                <button 
                    className="read-more"
                    onClick={() => navigate(`/post/${postSlug}`)}
                >
                    Đọc tiếp 
                </button>
            </div>
        </article>
    );
};

export default BlogPost;