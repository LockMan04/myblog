import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { getBlogById } from '../firebase/blogService';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { ArrowLeft, Pencil, Eye, EyeOff, Archive, Trash2, Calendar, User, Tag } from 'lucide-react';
import { Slab } from 'react-loading-indicators';
import '../styles/BlogDetail.css';

const BlogDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { currentUser, role } = useAuth();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Trích xuất ID từ slug (format: title-slug-id)
  const extractIdFromSlug = (slug) => {
    const parts = slug.split('-');
    return parts[parts.length - 1];
  };

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError('');
      
      const blogId = extractIdFromSlug(slug);
      console.log('Fetching blog with ID:', blogId);
      
      const blogData = await getBlogById(blogId);
      
      if (!blogData) {
        setError('Bài viết không tồn tại hoặc đã bị xóa.');
        return;
      }
      
      setBlog(blogData);
    } catch (error) {
      console.error('Lỗi khi lấy blog:', error);
      setError('Không thể tải bài viết. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (slug) {
      fetchBlog();
    }
  }, [slug]);

  // Kiểm tra quyền chỉnh sửa
  const isAuthor = currentUser && blog && currentUser.uid === blog.authorId;
  const isAdmin = role === 'admin';
  const canEdit = isAuthor || isAdmin;

  if (loading) {
    return (
      <>
        <Header />
        <div className="blog-detail-loading">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
              <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Đang tải bài viết...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (error || !blog) {
    return (
      <>
        <Header />
        <div className="blog-detail-error">
          <div className="container">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            <div className="error-content">
              <h1>Oops! Có lỗi xảy ra</h1>
              <p>{error}</p>
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/')}
              >
                Về trang chủ
              </button>
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
      <main className="blog-detail">
        <div className="container">
          {/* Navigation */}
          <div className="blog-nav">
            <button 
              className="back-btn"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft size={16} />
              Quay lại
            </button>
            
            {canEdit && (
              <div className="blog-actions">
                <button 
                  className="btn btn-edit"
                  onClick={() => navigate(`/edit-blog/${blog.id}`)}
                >
                  <Pencil size={16} />
                  Chỉnh sửa
                </button>
                {/* Các action khác có thể thêm ở đây */}
              </div>
            )}
          </div>

          {/* Blog Header */}
          <header className="blog-header">
            {blog.imageUrl && (
              <div className="blog-featured-image">
                <img 
                  src={blog.imageUrl} 
                  alt={blog.title}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
              </div>
            )}
            
            <div className="blog-meta">
              <span className="blog-category">
                <Tag size={16} />
                {blog.category}
              </span>
              <span className="blog-date">
                <Calendar size={16} />
                {blog.date}
              </span>
              <span className="blog-author">
                <User size={16} />
                {blog.author}
              </span>
            </div>
            
            <h1 className="blog-title">{blog.title}</h1>
            
            {blog.excerpt && (
              <p className="blog-excerpt">{blog.excerpt}</p>
            )}
          </header>

          {/* Blog Content */}
          <article className="blog-content">
            <div 
              className="blog-body"
              dangerouslySetInnerHTML={{ __html: blog.content }}
            />
          </article>

          {/* Blog Footer */}
          <footer className="blog-footer">
            <div className="blog-tags">
              {blog.tags && blog.tags.map((tag, index) => (
                <span key={index} className="tag">#{tag}</span>
              ))}
            </div>
            
            {canEdit && (
              <div className="admin-actions">
                <p className="admin-note">
                  {isAdmin && !isAuthor && (
                    <span className="admin-badge">👑 Bạn đang xem với quyền Admin</span>
                  )}
                </p>
              </div>
            )}
          </footer>
        </div>
      </main>
      <Footer />
    </>
  );
};

export default BlogDetail;
