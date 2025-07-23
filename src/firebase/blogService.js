import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  updateDoc,
  increment,
  deleteDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './config';

// Lấy tất cả blogs published và không archived
export const getAllBlogs = async () => {
  try {
    console.log('Đang lấy blogs từ Firestore...');
    
    // Đơn giản hóa query để tránh cần index phức tạp
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('published', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      
      // Filter trong code thay vì trong query để tránh cần index
      if (data.published && !data.archived && !data.deleted) {
        blogs.push({
          id: doc.id,
          ...data,
          // Chuyển đổi timestamp thành string
          date: data.createdAt?.toDate ? 
            data.createdAt.toDate().toLocaleDateString('vi-VN') : 
            new Date().toLocaleDateString('vi-VN')
        });
      }
    });
    
    console.log('Lấy được', blogs.length, 'blogs từ Firestore');
    return blogs;
  } catch (error) {
    console.error('Lỗi khi lấy danh sách blogs: ', error);
    console.error('Chi tiết lỗi:', error.message);
    throw error;
  }
};

// Lấy blogs với giới hạn số lượng
export const getBlogsWithLimit = async (limitNumber = 10) => {
  try {
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('published', '==', true),
      orderBy('createdAt', 'desc'),
      limit(limitNumber)
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        ...data,
        date: data.createdAt?.toDate ? 
          data.createdAt.toDate().toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN')
      });
    });
    
    return blogs;
  } catch (error) {
    console.error('Lỗi khi lấy blogs với giới hạn: ', error);
    throw error;
  }
};

// Lấy blogs theo category
export const getBlogsByCategory = async (category) => {
  try {
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('published', '==', true),
      where('category', '==', category),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        ...data,
        date: data.createdAt?.toDate ? 
          data.createdAt.toDate().toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN')
      });
    });
    
    return blogs;
  } catch (error) {
    console.error('Lỗi khi lấy blogs theo category: ', error);
    throw error;
  }
};

// Lấy một blog theo ID
export const getBlogById = async (blogId) => {
  try {
    const blogDoc = doc(db, 'blogs', blogId);
    const blogSnapshot = await getDoc(blogDoc);
    
    if (blogSnapshot.exists()) {
      const data = blogSnapshot.data();
      return {
        id: blogSnapshot.id,
        ...data,
        date: data.createdAt?.toDate ? 
          data.createdAt.toDate().toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN')
      };
    } else {
      throw new Error('Blog không tồn tại');
    }
  } catch (error) {
    console.error('Lỗi khi lấy blog theo ID: ', error);
    throw error;
  }
};

// Tăng số lượt xem
export const incrementBlogViews = async (blogId) => {
  try {
    const blogDoc = doc(db, 'blogs', blogId);
    await updateDoc(blogDoc, {
      views: increment(1)
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt xem: ', error);
  }
};

// Tăng số lượt thích
export const incrementBlogLikes = async (blogId) => {
  try {
    const blogDoc = doc(db, 'blogs', blogId);
    await updateDoc(blogDoc, {
      likes: increment(1)
    });
  } catch (error) {
    console.error('Lỗi khi tăng lượt thích: ', error);
    throw error;
  }
};

// Lấy blogs của một author
export const getBlogsByAuthor = async (authorId) => {
  try {
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('authorId', '==', authorId),
      orderBy('createdAt', 'desc')
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      blogs.push({
        id: doc.id,
        ...data,
        date: data.createdAt?.toDate ? 
          data.createdAt.toDate().toLocaleDateString('vi-VN') : 
          new Date().toLocaleDateString('vi-VN')
      });
    });
    
    return blogs;
  } catch (error) {
    console.error('Lỗi khi lấy blogs của author: ', error);
    throw error;
  }
};

// Ẩn/Hiển thị bài viết
export const toggleBlogVisibility = async (blogId, published) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      published: !published,
      updatedAt: serverTimestamp()
    });
    console.log(`Blog ${published ? 'đã ẩn' : 'đã hiển thị'}`);
  } catch (error) {
    console.error('Lỗi khi thay đổi trạng thái hiển thị: ', error);
    throw error;
  }
};

// Lưu trữ bài viết
export const archiveBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      archived: true,
      archivedAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    console.log('Blog đã được lưu trữ');
  } catch (error) {
    console.error('Lỗi khi lưu trữ blog: ', error);
    throw error;
  }
};

// Khôi phục từ lưu trữ
export const unarchiveBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      archived: false,
      archivedAt: null,
      updatedAt: serverTimestamp()
    });
    console.log('Blog đã được khôi phục từ lưu trữ');
  } catch (error) {
    console.error('Lỗi khi khôi phục blog: ', error);
    throw error;
  }
};

// Xóa tạm thời (đánh dấu để xóa sau 2 tuần)
export const softDeleteBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    const deleteAfter = new Date();
    deleteAfter.setDate(deleteAfter.getDate() + 14); // 2 tuần
    
    await updateDoc(blogRef, {
      deleted: true,
      deletedAt: serverTimestamp(),
      deleteAfter: deleteAfter,
      updatedAt: serverTimestamp()
    });
    console.log('Blog đã được xóa tạm thời, sẽ xóa vĩnh viễn sau 14 ngày');
  } catch (error) {
    console.error('Lỗi khi xóa tạm thời blog: ', error);
    throw error;
  }
};

// Khôi phục bài viết đã xóa
export const restoreBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await updateDoc(blogRef, {
      deleted: false,
      deletedAt: null,
      deleteAfter: null,
      updatedAt: serverTimestamp()
    });
    console.log('Blog đã được khôi phục');
  } catch (error) {
    console.error('Lỗi khi khôi phục blog: ', error);
    throw error;
  }
};

// Xóa vĩnh viễn
export const permanentDeleteBlog = async (blogId) => {
  try {
    const blogRef = doc(db, 'blogs', blogId);
    await deleteDoc(blogRef);
    console.log('Blog đã được xóa vĩnh viễn');
  } catch (error) {
    console.error('Lỗi khi xóa vĩnh viễn blog: ', error);
    throw error;
  }
};

// Lấy blogs đã xóa tạm thời (cho admin)
export const getDeletedBlogs = async () => {
  try {
    console.log('🗑️ Đang lấy blogs đã xóa...');
    
    // Query đơn giản chỉ với deleted để tránh cần index
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('deleted', '==', true)
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    console.log('📊 Tổng số docs có deleted=true:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Doc:', doc.id, 'deleted:', data.deleted);
      
      // Double check để đảm bảo chỉ lấy bài viết deleted
      if (data.deleted) {
        blogs.push({
          id: doc.id,
          ...data,
          date: data.createdAt?.toDate ? 
            data.createdAt.toDate().toLocaleDateString('vi-VN') : 
            new Date().toLocaleDateString('vi-VN'),
          deletedDate: data.deletedAt?.toDate ? 
            data.deletedAt.toDate().toLocaleDateString('vi-VN') : 
            new Date().toLocaleDateString('vi-VN'),
          deleteAfterDate: data.deleteAfter ? 
            new Date(data.deleteAfter.seconds * 1000).toLocaleDateString('vi-VN') : 
            null
        });
      }
    });
    
    // Sắp xếp theo deletedAt trong code thay vì trong query
    blogs.sort((a, b) => {
      const dateA = a.deletedAt?.toDate ? a.deletedAt.toDate() : new Date(0);
      const dateB = b.deletedAt?.toDate ? b.deletedAt.toDate() : new Date(0);
      return dateB - dateA; // Desc order
    });
    
    console.log('✅ Trả về', blogs.length, 'blogs đã xóa');
    return blogs;
  } catch (error) {
    console.error('❌ Lỗi khi lấy blogs đã xóa: ', error);
    throw error;
  }
};

// Lấy blogs đã lưu trữ
export const getArchivedBlogs = async () => {
  try {
    console.log('🔍 Đang lấy blogs đã lưu trữ...');
    
    // Query đơn giản chỉ với archived để tránh cần index
    const blogsQuery = query(
      collection(db, 'blogs'),
      where('archived', '==', true)
    );
    
    const querySnapshot = await getDocs(blogsQuery);
    const blogs = [];
    
    console.log('📊 Tổng số docs có archived=true:', querySnapshot.size);
    
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📄 Doc:', doc.id, 'archived:', data.archived, 'deleted:', data.deleted);
      
      // Filter trong code: chỉ lấy bài viết archived và không bị deleted
      if (data.archived && !data.deleted) {
        blogs.push({
          id: doc.id,
          ...data,
          date: data.createdAt?.toDate ? 
            data.createdAt.toDate().toLocaleDateString('vi-VN') : 
            new Date().toLocaleDateString('vi-VN'),
          archivedDate: data.archivedAt?.toDate ? 
            data.archivedAt.toDate().toLocaleDateString('vi-VN') : 
            new Date().toLocaleDateString('vi-VN')
        });
      }
    });
    
    // Sắp xếp theo createdAt trong code thay vì trong query
    blogs.sort((a, b) => {
      const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(0);
      const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(0);
      return dateB - dateA; // Desc order
    });
    
    console.log('✅ Trả về', blogs.length, 'blogs đã lưu trữ');
    return blogs;
  } catch (error) {
    console.error('❌ Lỗi khi lấy blogs đã lưu trữ: ', error);
    throw error;
  }
};
