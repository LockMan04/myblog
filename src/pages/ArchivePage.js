import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'sonner';
import { getArchivedBlogs, getDeletedBlogs, unarchiveBlog, restoreBlog, permanentDeleteBlog } from '../firebase/blogService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Slab } from 'react-loading-indicators';
import { Archive, Trash2, RotateCcw, AlertTriangle, Calendar, User, Eye } from 'lucide-react';
import '../styles/ArchivePage.css';

const ArchivePage = () => {
  const { currentUser, role } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('archived');
  const [archivedBlogs, setArchivedBlogs] = useState([]);
  const [deletedBlogs, setDeletedBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const isAdmin = role === 'admin';

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    fetchData();
  }, [currentUser, navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError('');

      const [archived, deleted] = await Promise.all([
        getArchivedBlogs(),
        isAdmin ? getDeletedBlogs() : Promise.resolve([])
      ]);

      // Filter theo author nếu không phải admin
      if (!isAdmin) {
        setArchivedBlogs(archived.filter(blog => blog.authorId === currentUser.uid));
      } else {
        setArchivedBlogs(archived);
        setDeletedBlogs(deleted);
      }
    } catch (error) {
      console.error('Lỗi khi lấy dữ liệu:', error);
      setError('Không thể tải dữ liệu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const handleUnarchive = async (blogId) => {
    try {
      await unarchiveBlog(blogId);
      toast.success('Đã khôi phục từ lưu trữ', {
        description: 'Bài viết đã được khôi phục và hiển thị trở lại trên trang chủ',
        icon: '↩️'
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi khôi phục từ lưu trữ:', error);
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể khôi phục bài viết từ lưu trữ. Vui lòng thử lại.'
      });
    }
  };

  const handleRestore = async (blogId) => {
    try {
      await restoreBlog(blogId);
      toast.success('Đã khôi phục bài viết', {
        description: 'Bài viết đã được khôi phục thành công',
        icon: '↩️'
      });
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi khôi phục bài viết:', error);
      toast.error('Có lỗi xảy ra', {
        description: 'Không thể khôi phục bài viết. Vui lòng thử lại.'
      });
    }
  };

  const handlePermanentDelete = async (blogId) => {
    toast.error('Xác nhận xóa vĩnh viễn', {
      description: 'Hành động này không thể hoàn tác. Bài viết sẽ bị xóa hoàn toàn khỏi hệ thống.',
      icon: '⚠️',
      action: {
        label: 'Xóa vĩnh viễn',
        onClick: async () => {
          try {
            await permanentDeleteBlog(blogId);
            toast.warning('Đã xóa vĩnh viễn', {
              description: 'Bài viết đã được xóa vĩnh viễn khỏi hệ thống',
              icon: '🗑️'
            });
            fetchData(); // Refresh data
          } catch (error) {
            console.error('Lỗi khi xóa vĩnh viễn:', error);
            toast.error('Có lỗi xảy ra', {
              description: 'Không thể xóa vĩnh viễn bài viết. Vui lòng thử lại.'
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

  const BlogCard = ({ blog, type }) => (
    <div className={`blog-card ${type}`}>
      <div className="blog-card-header">
        <h3 className="blog-title">{blog.title}</h3>
        <div className="blog-meta">
          <span className="category">{blog.category}</span>
          <span className="author">
            <User size={14} />
            {blog.author}
          </span>
          <span className="date">
            <Calendar size={14} />
            {type === 'archived' ? `Lưu trữ: ${blog.archivedDate}` : `Xóa: ${blog.deletedDate}`}
          </span>
        </div>
      </div>

      <div className="blog-excerpt">
        <p>{blog.excerpt || 'Không có mô tả'}</p>
      </div>

      <div className="blog-actions">
        <button 
          className="btn btn-view"
          onClick={() => navigate(`/post/${blog.title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}-${blog.id}`)}
        >
          <Eye size={16} />
          Xem chi tiết
        </button>

        {type === 'archived' ? (
          <button 
            className="btn btn-restore"
            onClick={() => handleUnarchive(blog.id)}
          >
            <RotateCcw size={16} />
            Khôi phục
          </button>
        ) : (
          <>
            <button 
              className="btn btn-restore"
              onClick={() => handleRestore(blog.id)}
            >
              <RotateCcw size={16} />
              Khôi phục
            </button>
            <button 
              className="btn btn-delete"
              onClick={() => handlePermanentDelete(blog.id)}
            >
              <Trash2 size={16} />
              Xóa vĩnh viễn
            </button>
          </>
        )}
      </div>

      {type === 'deleted' && blog.deleteAfterDate && (
        <div className="delete-warning">
          <AlertTriangle size={16} />
          <span>Sẽ xóa vĩnh viễn vào: {blog.deleteAfterDate}</span>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <>
        <Header />
        <div className="archive-page">
          <div className="container">
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
              <div style={{ textAlign: 'center' }}>
                <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
                <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Đang tải dữ liệu...</p>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="archive-page">
        <div className="container">
          <div className="archive-header">
            <h1>Lưu trữ & Khôi phục</h1>
            <p>Quản lý các bài viết đã lưu trữ và xóa tạm thời</p>
          </div>

          <div className="archive-tabs">
            <button 
              className={`tab-button ${activeTab === 'archived' ? 'active' : ''}`}
              onClick={() => setActiveTab('archived')}
            >
              <Archive size={18} />
              Đã lưu trữ ({archivedBlogs.length})
            </button>
            {isAdmin && (
              <button 
                className={`tab-button ${activeTab === 'deleted' ? 'active' : ''}`}
                onClick={() => setActiveTab('deleted')}
              >
                <Trash2 size={18} />
                Đã xóa ({deletedBlogs.length})
              </button>
            )}
          </div>

          <div className="archive-content">
            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {activeTab === 'archived' && (
              <div className="archived-section">
                {archivedBlogs.length === 0 ? (
                  <div className="empty-state">
                    <Archive size={48} />
                    <h3>Không có bài viết nào trong lưu trữ</h3>
                    <p>Các bài viết được lưu trữ sẽ hiển thị ở đây</p>
                  </div>
                ) : (
                  <div className="blogs-grid">
                    {archivedBlogs.map(blog => (
                      <BlogCard key={blog.id} blog={blog} type="archived" />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'deleted' && isAdmin && (
              <div className="deleted-section">
                {deletedBlogs.length === 0 ? (
                  <div className="empty-state">
                    <Trash2 size={48} />
                    <h3>Không có bài viết nào đã xóa</h3>
                    <p>Các bài viết đã xóa tạm thời sẽ hiển thị ở đây</p>
                  </div>
                ) : (
                  <div className="blogs-grid">
                    {deletedBlogs.map(blog => (
                      <BlogCard key={blog.id} blog={blog} type="deleted" />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default ArchivePage;
