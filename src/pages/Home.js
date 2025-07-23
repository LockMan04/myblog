import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import BlogPost from '../components/BlogPost';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';
import { getAllBlogs } from '../firebase/blogService';
import { Slab } from 'react-loading-indicators';
import { SquarePen } from 'lucide-react';

// Sample data for testing
const samplePosts = [
  {
    id: '1',
    title: 'Bài viết đầu tiên của tôi',
    content: '<p>Đây là nội dung của bài viết đầu tiên. Tôi rất hào hứng khi chia sẻ với mọi người những kinh nghiệm và kiến thức mà tôi đã tích lũy được.</p><p>Trong bài viết này, tôi sẽ chia sẻ về...</p>',
    excerpt: 'Đây là bài viết đầu tiên trên blog của tôi, nơi tôi chia sẻ những kinh nghiệm và kiến thức...',
    category: 'Công nghệ',
    date: '2025-01-15',
    author: 'Admin User',
    authorId: 'admin123',
    imageUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800',
    published: true,
    archived: false
  },
  {
    id: '2',
    title: 'Hướng dẫn sử dụng React Hooks',
    content: '<h2>Giới thiệu về React Hooks</h2><p>React Hooks là một tính năng mới được giới thiệu trong React 16.8...</p>',
    excerpt: 'Tìm hiểu về React Hooks và cách sử dụng chúng để tạo ra các component hiệu quả hơn.',
    category: 'React',
    date: '2025-01-10',
    author: 'Developer',
    authorId: 'dev456',
    imageUrl: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800',
    published: true,
    archived: false
  }
];

const Home = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Lấy blogs từ Firebase
  const fetchBlogs = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('Bắt đầu lấy blogs...');
      
      const fetchedBlogs = await getAllBlogs();
      
      if (!fetchedBlogs || fetchedBlogs.length === 0) {
        console.warn('Không có blogs nào được tìm thấy trong Firebase.');
        setError('Không có bài viết nào được tìm thấy. Vui lòng thử lại sau.');
      } else {
        console.log('Thành công lấy', fetchedBlogs.length, 'blogs từ Firebase');
        setBlogs(fetchedBlogs);
      }
    } catch (error) {
      console.error('Lỗi khi lấy blogs:', error);
      console.error('Chi tiết lỗi:', error.message);

      // Xử lý lỗi cụ thể
      if (error.code === 'permission-denied') {
        setError('Không có quyền truy cập Firestore. Đang hiển thị dữ liệu mẫu.');
      } else if (error.code === 'unavailable') {
        setError('Firebase hiện không khả dụng. Đang hiển thị dữ liệu mẫu.');
      } else {
        setError('Không thể tải blogs từ Firebase. Đang hiển thị dữ liệu mẫu.');
      }
      
      // Luôn hiển thị sample posts khi có lỗi
      setBlogs(samplePosts);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  return (
    <>
      <Header />
      <main className="main-content">
        <section className="hero">
          <h1>Chào mừng đến với LockMan Blog</h1>
          <p>Nơi bạn tìm thấy những kiến thức bổ ích và kinh nghiệm thực tế từ cộng đồng</p>
        </section>
        
        <section className="blog-posts">
          <h2>Bài viết mới nhất</h2>
          
          {error && (
            <div className="error-message" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}
          
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '200px' }}>
              <div style={{ textAlign: 'center' }}>
                <Slab color={["#25df25", "#2582df", "#df25df", "#df8225"]} size="medium" />
                <p style={{ marginTop: '20px', color: 'var(--text-secondary)' }}>Đang tải blogs...</p>
              </div>
            </div>
          ) : (
            <div className="posts-grid">
              {blogs.map((post, index) => (
                <BlogPost 
                  key={post.id || index}
                  id={post.id}
                  title={post.title}
                  content={post.content}
                  excerpt={post.excerpt}
                  category={post.category}
                  date={post.date}
                  author={post.author}
                  authorId={post.authorId}
                  imageUrl={post.imageUrl}
                  published={post.published}
                  archived={post.archived}
                  deleted={post.deleted}
                  onUpdate={fetchBlogs}
                />
              ))}
            </div>
          )}
        </section>
      </main>
      
      {/* Floating Create Blog Button - chỉ hiển thị khi đã đăng nhập */}
      {currentUser && (
        <button 
          className="floating-create-btn"
          onClick={() => navigate('/create-blog')}
          title="Tạo bài viết mới"
        >
          <SquarePen className="w-5 h-5" />
        </button>
      )}
      
      {/* <Footer /> */}
    </>
  );
};

export default Home;
