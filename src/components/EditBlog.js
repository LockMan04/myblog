import React, { useState } from 'react';
import ReactQuill from 'react-quill';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/AuthContext';
import { Slab } from 'react-loading-indicators';
import 'react-quill/dist/quill.snow.css';

const EditBlog = ({ blog, onClose, onBlogUpdated }) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState(blog.title || '');
  const [content, setContent] = useState(blog.content || '');
  const [category, setCategory] = useState(blog.category || 'Công nghệ');
  const [imageUrl, setImageUrl] = useState(blog.imageUrl || '');
  const [published, setPublished] = useState(blog.published || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!title.trim() || !content.trim()) {
      setError('Vui lòng điền đầy đủ tiêu đề và nội dung');
      return;
    }

    if (!currentUser || currentUser.uid !== blog.authorId) {
      setError('Bạn không có quyền chỉnh sửa bài viết này');
      return;
    }

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

      // Cập nhật blog post
      const blogRef = doc(db, 'blogs', blog.id);
      const updatedBlog = {
        title: title.trim(),
        content: content,
        excerpt: excerpt,
        category: category,
        imageUrl: imageUrl.trim() || blog.imageUrl,
        published: published,
        updatedAt: serverTimestamp()
      };

      await updateDoc(blogRef, updatedBlog);
      
      console.log('Blog đã được cập nhật');
      
      // Callback để cập nhật danh sách blog
      if (onBlogUpdated) {
        onBlogUpdated();
      }
      
    } catch (error) {
      console.error('Lỗi khi cập nhật blog: ', error);
      
      if (error.code === 'permission-denied') {
        setError('Không có quyền chỉnh sửa blog này.');
      } else if (error.code === 'unauthenticated') {
        setError('Bạn cần đăng nhập để chỉnh sửa blog.');
      } else {
        setError(`Có lỗi xảy ra khi cập nhật blog: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content edit-blog-modal">
        {loading && (
          <div className="loading-overlay">
            <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} />
            <p>Đang cập nhật blog...</p>
          </div>
        )}

        <div className="modal-header">
          <h2>Chỉnh sửa bài viết</h2>
          <button className="close-btn" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="edit-blog-form">
          {error && <div className="error-message">{error}</div>}
          
          <div className="form-group">
            <label htmlFor="title">Tiêu đề bài viết *</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề bài viết..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="category">Danh mục</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
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
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="content">Nội dung bài viết *</label>
            <ReactQuill
              theme="snow"
              value={content}
              onChange={setContent}
              modules={quillModules}
              placeholder="Viết nội dung bài viết của bạn..."
              style={{ height: '300px', marginBottom: '50px' }}
            />
          </div>

          <div className="form-group">
            <div className="checkbox-group">
              <input
                type="checkbox"
                id="published"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
              />
              <label htmlFor="published">Xuất bản ngay</label>
            </div>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={loading}>
              {loading ? 'Đang cập nhật...' : 'Cập nhật bài viết'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditBlog;
