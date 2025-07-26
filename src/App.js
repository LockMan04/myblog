import React, { createContext, useContext, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthProvider } from './contexts/AuthContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import TestAuth from './pages/TestAuth';
import UserProfile from './pages/UserProfile';
import BlogManagement from './pages/BlogManagement';
import CreateBlog from './pages/CreateBlog';
import BlogDetail from './pages/BlogDetail';
import ArchivePage from './pages/ArchivePage';
import QRCode from './pages/QRCode';
import NotFound from './pages/NotFound';
import './styles/App.css';

// Context để quản lý blur state
const BlurContext = createContext();

export const useBlur = () => {
  const context = useContext(BlurContext);
  if (!context) {
    throw new Error('useBlur must be used within a BlurProvider');
  }
  return context;
};

function App() {
  const [isBlurred, setIsBlurred] = useState(false);

  return (
    <AuthProvider>
      <BlurContext.Provider value={{ isBlurred, setIsBlurred }}>
        <Router>
          <div className={`App ${isBlurred ? 'modal-blur' : ''}`}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/myblog" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/test-auth" element={<TestAuth />} />
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/manage-blogs" element={<BlogManagement />} />
              <Route path="/create-blog" element={<CreateBlog />} />
              <Route path="/post/:slug" element={<BlogDetail />} />
              <Route path="/edit-blog/:id" element={<CreateBlog />} />
              <Route path="/archive" element={<ArchivePage />} />
              <Route path="/qr-code" element={<QRCode />} />
              {/* Catch all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            
            {/* Sonner Toaster */}
            <Toaster 
              position="bottom-right"
              richColors
              closeButton
              duration={4000}
              toastOptions={{
                style: {
                  fontSize: '14px',
                },
              }}
            />
          </div>
        </Router>
      </BlurContext.Provider>
    </AuthProvider>
  );
}

export default App;