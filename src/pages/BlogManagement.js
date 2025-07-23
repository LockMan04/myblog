import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { toggleBlogVisibility, archiveBlog, softDeleteBlog } from '../firebase/blogService';
import EditBlog from '../components/EditBlog';
import { Slab } from 'react-loading-indicators';
import '../styles/BlogManagement.css';

const BlogManagement = () => {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingBlog, setEditingBlog] = useState(null);
  const isAdmin = role === 'admin';
  const [filter, setFilter] = useState('all'); // all, published, hidden, archived

  useEffect(() => {
    if (currentUser) {
      fetchUserBlogs();
    }
  }, [currentUser, filter]);

  const fetchUserBlogs = async () => {
    try {
      setLoading(true);
      const blogsRef = collection(db, 'blogs');
      let q;
      
      if (isAdmin) {
        // Admin có thể xem tất cả blogs
        q = query(
          blogsRef,
          orderBy('createdAt', 'desc')
        );
      } else {
        // User thường chỉ xem blogs của mình
        q = query(
          blogsRef,
          where('authorId', '==', currentUser.uid),
          orderBy('createdAt', 'desc')
        );
      }

      const querySnapshot = await getDocs(q);
      let blogsList = [];
      
      querySnapshot.forEach((doc) => {
        const blogData = { id: doc.id, ...doc.data() };
        
        // Filter based on status
        if (filter === 'all') {
          blogsList.push(blogData);
        } else if (filter === 'published' && blogData.published === true && !blogData.archived) {
          blogsList.push(blogData);
        } else if (filter === 'hidden' && blogData.published === false && !blogData.archived) {
          blogsList.push(blogData);
        } else if (filter === 'archived' && blogData.archived === true) {
          blogsList.push(blogData);
        }
      });

      setBlogs(blogsList);
    } catch (error) {
      console.error('Lỗi khi tải blogs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (blogId, newStatus) => {
    try {
      if (newStatus.hasOwnProperty('published')) {
        // Sử dụng toggle function
        const currentBlog = blogs.find(blog => blog.id === blogId);
        await toggleBlogVisibility(blogId, currentBlog.published);
        toast.success(
          currentBlog.published ? 'Đã ẩn bài viết' : 'Đã hiển thị bài viết',
          {
            description: currentBlog.published ? 'Bài viết đã được ẩn' : 'Bài viết đã được hiển thị',
            icon: currentBlog.published ? '👁️‍🗨️' : '👁️'
          }
        );
      } else if (newStatus.archived) {
        await archiveBlog(blogId);
        toast.success('Đã lưu trữ bài viết', {
          description: 'Bài viết đã được chuyển vào mục lưu trữ',
          icon: '📁'
        });
      }
      
      // Refresh data
      fetchBlogs();
    } catch (error) {
      console.error('Lỗi khi cập nhật status:', error);
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể cập nhật trạng thái bài viết. Vui lòng thử lại.'
      });
    }
  };

  const handleDelete = async (blogId) => {
    toast.error('Xác nhận xóa bài viết', {
      description: 'Bài viết sẽ bị xóa tạm thời và có thể khôi phục trong 14 ngày',
      icon: '🗑️',
      action: {
        label: 'Xác nhận xóa',
        onClick: async () => {
          try {
            await softDeleteBlog(blogId);
            toast.warning('Đã xóa bài viết', {
              description: 'Bài viết đã được xóa tạm thời. Sẽ bị xóa vĩnh viễn sau 14 ngày.',
              icon: '🗑️'
            });
            fetchBlogs(); // Refresh data
          } catch (error) {
            console.error('Lỗi khi xóa blog:', error);
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

  const getStatusText = (blog) => {
    if (blog.archived) return 'Đã lưu trữ';
    if (blog.published) return 'Đã xuất bản';
    return 'Ẩn';
  };

  const getStatusClass = (blog) => {
    if (blog.archived) return 'status-archived';
    if (blog.published) return 'status-published';
    return 'status-hidden';
  };

  if (!currentUser) {
    return (
      <div className="blog-management-container">
        <div className="auth-required">
          <h2>Bạn cần đăng nhập để quản lý blog</h2>
          <p>Vui lòng đăng nhập để xem và quản lý các bài viết của bạn.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="loading-overlay">
        <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} />
        <p>Đang tải danh sách blog...</p>
      </div>
    );
  }

  return (
    <div className="blog-management-container">
      <div className="blog-management-header">
        <h1>Quản lý Blog của tôi</h1>
        <button 
          className="btn-add-blog"
          onClick={() => navigate('/create-blog')}
        >
          <i className="fas fa-plus"></i>
          Viết bài mới
        </button>
      </div>

      <div className="blog-filters">
        <button 
          className={filter === 'all' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('all')}
        >
          Tất cả ({blogs.length})
        </button>
        <button 
          className={filter === 'published' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('published')}
        >
          Đã xuất bản
        </button>
        <button 
          className={filter === 'hidden' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('hidden')}
        >
          Ẩn
        </button>
        <button 
          className={filter === 'archived' ? 'filter-btn active' : 'filter-btn'}
          onClick={() => setFilter('archived')}
        >
          Lưu trữ
        </button>
      </div>

      <div className="blogs-list">
        {blogs.length === 0 ? (
          <div className="no-blogs">
            <i className="fas fa-blog fa-3x"></i>
            <h3>Chưa có bài viết nào</h3>
            <p>Hãy bắt đầu viết bài đầu tiên của bạn!</p>
            <button 
              className="btn-add-blog"
              onClick={() => navigate('/create-blog')}
            >
              Viết bài mới
            </button>
          </div>
        ) : (
          blogs.map(blog => (
            <div key={blog.id} className="blog-item">
              <div className="blog-image">
                <img src={blog.imageUrl} alt={blog.title} />
                <span className={`status-badge ${getStatusClass(blog)}`}>
                  {getStatusText(blog)}
                </span>
              </div>
              
              <div className="blog-content">
                <h3>{blog.title}</h3>
                <p className="blog-excerpt">{blog.excerpt}</p>
                <div className="blog-meta">
                  <span className="category">{blog.category}</span>
                  <span className="date">
                    {blog.createdAt?.toDate?.()?.toLocaleDateString('vi-VN') || 'Không rõ'}
                  </span>
                  {isAdmin && blog.authorId !== currentUser.uid && (
                    <span className="author-info">
                      👤 {blog.author || 'Ẩn danh'}
                    </span>
                  )}
                  <span className="stats">
                    <i className="fas fa-eye"></i> {blog.views || 0} | 
                    <i className="fas fa-heart"></i> {blog.likes || 0}
                  </span>
                </div>
              </div>

              <div className="blog-actions">
                <button 
                  className="btn-edit"
                  onClick={() => setEditingBlog(blog)}
                  title="Chỉnh sửa"
                >
                  <i className="fas fa-edit"></i>
                </button>

                {blog.published && !blog.archived && (
                  <button 
                    className="btn-hide"
                    onClick={() => handleStatusChange(blog.id, { published: false })}
                    title="Ẩn bài viết"
                  >
                    <i className="fas fa-eye-slash"></i>
                  </button>
                )}

                {!blog.published && !blog.archived && (
                  <button 
                    className="btn-publish"
                    onClick={() => handleStatusChange(blog.id, { published: true })}
                    title="Xuất bản"
                  >
                    <i className="fas fa-eye"></i>
                  </button>
                )}

                {!blog.archived && (
                  <button 
                    className="btn-archive"
                    onClick={() => handleStatusChange(blog.id, { archived: true, published: false })}
                    title="Lưu trữ"
                  >
                    <i className="fas fa-archive"></i>
                  </button>
                )}

                {blog.archived && (
                  <button 
                    className="btn-unarchive"
                    onClick={() => handleStatusChange(blog.id, { archived: false, published: true })}
                    title="Khôi phục"
                  >
                    <i className="fas fa-undo"></i>
                  </button>
                )}

                <button 
                  className="btn-delete"
                  onClick={() => handleDelete(blog.id)}
                  title="Xóa vĩnh viễn"
                >
                  <i className="fas fa-trash"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {editingBlog && (
        <EditBlog 
          blog={editingBlog}
          onClose={() => setEditingBlog(null)}
          onBlogUpdated={() => {
            setEditingBlog(null);
            fetchUserBlogs();
          }}
        />
      )}
    </div>
  );
};

export default BlogManagement;
