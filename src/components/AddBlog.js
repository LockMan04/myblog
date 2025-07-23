import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { db } from '../firebase/config';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { Slab } from 'react-loading-indicators';

const AddBlog = ({ isOpen, onClose, onBlogAdded }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('Công nghệ');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { currentUser } = useAuth();

  const categories = [
    'Công nghệ',
    'Kinh doanh', 
    'Đời sống',
    'Tài chính',
    'Du lịch',
    'Ẩm thực',
    'Sức khỏe',
    'Giáo dục',
    'Khác'
  ];

  // Cấu hình Quill editor
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'color': [] }, { 'background': [] }],
      ['link', 'image'],
      ['clean']
    ],
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'color', 'background', 'link', 'image'
  ];

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

      // Tạo blog post object
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
        published: true
      };

      console.log('Đang thêm blog:', blogPost);

      // Thêm vào Firestore
      const docRef = await addDoc(collection(db, 'blogs'), blogPost);
      
      console.log('Blog đã được thêm với ID: ', docRef.id);
      
      // Reset form
      setTitle('');
      setContent('');
      setCategory('Công nghệ');
      setImageUrl('');
      
      // Callback để cập nhật danh sách blog
      if (onBlogAdded) {
        onBlogAdded();
      }
      
      // Đóng modal
      onClose();
      
    } catch (error) {
      console.error('Lỗi khi thêm blog: ', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      // Xử lý lỗi cụ thể
      if (error.code === 'permission-denied') {
        setError('Không có quyền thêm blog. Vui lòng đăng nhập lại.');
      } else if (error.code === 'unauthenticated') {
        setError('Bạn cần đăng nhập để thêm blog.');
      } else {
        setError(`Có lỗi xảy ra khi đăng blog: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      setTitle('');
      setContent('');
      setCategory('Công nghệ');
      setImageUrl('');
      setError('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {loading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
            <p>Đang đăng blog...</p>
          </div>
        </div>
      )}
      
      <div className="blog-modal-overlay" onClick={handleClose}>
        <div className="blog-modal" onClick={(e) => e.stopPropagation()}>
          <div className="blog-modal-header">
            <h2>Viết blog mới</h2>
            <button onClick={handleClose} className="close-btn" disabled={loading}>×</button>
          </div>
          
          <div className="blog-modal-body">
            {error && <div className="error-message">{error}</div>}
            
            <form onSubmit={handleSubmit} className="blog-form">
              <div className="form-group">
                <label htmlFor="title">Tiêu đề *</label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề blog..."
                  disabled={loading}
                  maxLength={200}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="category">Danh mục</label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    disabled={loading}
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="imageUrl">URL hình ảnh</label>
                  <input
                    id="imageUrl"
                    type="url"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Nội dung *</label>
                <div className="quill-wrapper">
                  <ReactQuill
                    theme="snow"
                    value={content}
                    onChange={setContent}
                    modules={modules}
                    formats={formats}
                    placeholder="Viết nội dung blog của bạn..."
                    readOnly={loading}
                  />
                </div>
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  onClick={handleClose}
                  className="btn-cancel"
                  disabled={loading}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="btn-submit"
                  disabled={loading || !title.trim() || !content.trim()}
                >
                  {loading ? 'Đang đăng...' : 'Đăng blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddBlog;
