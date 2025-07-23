import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import { toast } from 'sonner';
import { addDoc, collection, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { getBlogById } from '../firebase/blogService';
import { useAuth } from '../contexts/AuthContext';
import { Slab } from 'react-loading-indicators';
import Header from '../components/Header';
import Footer from '../components/Footer';
import 'react-quill/dist/quill.snow.css';
import '../styles/CreateBlog.css';

const CreateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID for editing
  const { currentUser, role } = useAuth();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Công nghệ');
  const [imageUrl, setImageUrl] = useState('');
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingBlog, setLoadingBlog] = useState(false);
  const [error, setError] = useState('');
  const [originalBlog, setOriginalBlog] = useState(null);

  const isEditMode = !!id;
  const isAdmin = role === 'admin';

  const categories = [
    'Công nghệ', 'Lifestyle', 'Du lịch', 'Ẩm thực', 
    'Thể thao', 'Giải trí', 'Giáo dục', 'Sức khỏe'
  ];

  const quillModules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'align': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  // Load blog data for editing
  useEffect(() => {
    if (isEditMode) {
      loadBlogForEdit();
    }
  }, [id, isEditMode]);

  const loadBlogForEdit = async () => {
    try {
      setLoadingBlog(true);
      setError('');
      
      const blogData = await getBlogById(id);
      
      if (!blogData) {
        setError('Bài viết không tồn tại.');
        return;
      }

      // Check permissions
      const isAuthor = currentUser && currentUser.uid === blogData.authorId;
      if (!isAuthor && !isAdmin) {
        setError('Bạn không có quyền chỉnh sửa bài viết này.');
        return;
      }

      setOriginalBlog(blogData);
      setTitle(blogData.title);
      setContent(blogData.content);
      setCategory(blogData.category);
      setImageUrl(blogData.imageUrl || '');
      setPublished(blogData.published);
      
    } catch (error) {
      console.error('Lỗi khi tải bài viết:', error);
      setError('Không thể tải bài viết. Vui lòng thử lại.');
    } finally {
      setLoadingBlog(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!currentUser) {
      setError('Bạn cần đăng nhập để viết blog');
      return;
    }

    console.log('Current user:', currentUser.uid, currentUser.email);

    try {
      setLoading(true);
      setError('');

      // Tạo excerpt từ content (loại bỏ HTML tags)
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      const plainText = tempDiv.textContent || tempDiv.innerText || '';
      const excerpt = plainText.length > 150 
        ? plainText.substring(0, 150) + '...' 
        : plainText;

      if (isEditMode) {
        // Update existing blog
        const blogRef = doc(db, 'blogs', id);
        const updateData = {
          title: title.trim(),
          content: content,
          excerpt: excerpt,
          category: category,
          imageUrl: imageUrl.trim() || `https://placehold.co/400x300/3498db/ffffff?text=${encodeURIComponent(category)}`,
          updatedAt: serverTimestamp(),
          published: published
        };

        console.log('Đang cập nhật blog:', updateData);
        await updateDoc(blogRef, updateData);
        console.log('Blog đã được cập nhật');
        
      } else {
        // Create new blog
        const blogPost = {
          title: title.trim(),
          content: content,
          excerpt: excerpt,
          category: category,
          author: currentUser.displayName || currentUser.email || 'Ẩn danh',
          authorId: currentUser.uid,
          imageUrl: imageUrl.trim() || `https://placehold.co/400x300/3498db/ffffff?text=${encodeURIComponent(category)}`,
          date: serverTimestamp(),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
          likes: 0,
          views: 0,
          published: published,
          archived: false
        };

        console.log('Đang thêm blog:', blogPost);
        const docRef = await addDoc(collection(db, 'blogs'), blogPost);
        console.log('Blog đã được thêm với ID: ', docRef.id);
      }
      
      // Chuyển về trang quản lý blog
      navigate('/manage-blogs');
      
    } catch (error) {
      console.error('Lỗi khi lưu blog: ', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Xử lý lỗi cụ thể
      if (error.code === 'permission-denied') {
        setError('Không có quyền lưu blog. Vui lòng đăng nhập lại.');
      } else if (error.code === 'unauthenticated') {
        setError('Bạn cần đăng nhập để lưu blog.');
      } else {
        setError(`Có lỗi xảy ra khi lưu blog: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (title.trim() || content.trim()) {
      toast.info('Hủy tạo bài viết', {
        description: 'Nội dung chưa lưu sẽ bị mất',
        action: {
          label: 'Xác nhận',
          onClick: () => navigate(-1)
        }
      });
    } else {
      navigate(-1);
    }
  };

  if (!currentUser) {
    return (
      <div className="create-blog-page">
        <Header />
        <div className="create-blog-container">
          <div className="auth-required">
            <h2>Bạn cần đăng nhập để viết blog</h2>
            <p>Vui lòng đăng nhập để tạo bài viết mới.</p>
            <button onClick={() => navigate('/login')} className="btn-login">
              Đăng nhập
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (loadingBlog) {
    return (
      <div className="create-blog-page">
        <Header />
        <div className="create-blog-container">
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
            <div style={{ textAlign: 'center' }}>
              <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
              <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Đang tải bài viết...</p>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="create-blog-page">
      <Header />
      
      {loading && (
        <div className="loading-overlay">
          <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} />
          <p>{isEditMode ? 'Đang cập nhật bài viết...' : 'Đang tạo bài viết...'}</p>
        </div>
      )}

      <div className="create-blog-container">
        <div className="create-blog-header">
          <h1>{isEditMode ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1>
          {isEditMode && originalBlog && isAdmin && currentUser.uid !== originalBlog.authorId && (
            <div className="admin-notice">
              <span className="admin-badge">👑 Đang chỉnh sửa với quyền Admin</span>
              <span className="original-author">Tác giả gốc: {originalBlog.author}</span>
            </div>
          )}
          <div className="header-actions">
            <button onClick={handleCancel} className="btn-cancel">
              <i className="fas fa-times"></i>
              Hủy
            </button>
            <button onClick={handleSubmit} className="btn-save" disabled={loading}>
              <i className="fas fa-save"></i>
              {loading ? (isEditMode ? 'Đang cập nhật...' : 'Đang lưu...') : (isEditMode ? 'Cập nhật' : 'Đăng bài')}
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="create-blog-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-section">
            <div className="form-group">
              <label htmlFor="title">Tiêu đề bài viết *</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                required
                className="title-input"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="category">Danh mục</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="category-select"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="imageUrl">URL ảnh đại diện</label>
                <input
                  type="url"
                  id="imageUrl"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="image-input"
                />
              </div>
            </div>

            <div className="form-group content-group">
              <label htmlFor="content">Nội dung bài viết *</label>
              <ReactQuill
                theme="snow"
                value={content}
                onChange={setContent}
                modules={quillModules}
                placeholder="Chia sẻ câu chuyện, kiến thức, trải nghiệm của bạn..."
                className="content-editor"
              />
            </div>

            <div className="form-group">
              <div className="publish-options">
                <div className="checkbox-group">
                  <input
                    type="checkbox"
                    id="published"
                    checked={published}
                    onChange={(e) => setPublished(e.target.checked)}
                  />
                  <label htmlFor="published">Xuất bản ngay</label>
                </div>
                <p className="publish-note">
                  {published ? 'Bài viết sẽ được hiển thị công khai ngay lập tức' : 'Bài viết sẽ được lưu như bản nháp'}
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
      
      <Footer />
    </div>
  );
};

export default CreateBlog;
