import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(true);

  // Đăng ký với email và password
  function signup(email, password, displayName) {
    return createUserWithEmailAndPassword(auth, email, password)
      .then(async (result) => {
        await updateProfile(result.user, { displayName });
        // Lưu user vào Firestore với role 'user'
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          displayName: displayName,
          role: 'user'
        });
      });
  }

  // Đăng nhập với email và password
  function login(email, password) {
    // Validate input
    if (!email || !password) {
      return Promise.reject({ code: 'auth/missing-credentials', message: 'Email và mật khẩu không được để trống' });
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Promise.reject({ code: 'auth/invalid-email', message: 'Email không hợp lệ' });
    }
    
    return signInWithEmailAndPassword(auth, email, password);
  }

  // Đăng nhập với Google
  function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(auth, provider);
  }

  // Đăng xuất
  function logout() {
    return signOut(auth);
  }

  // Lắng nghe thay đổi trạng thái authentication
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      setLoading(false);
      if (user) {
        // Lấy role từ Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists()) {
            setRole(userDoc.data().role || 'user');
          } else {
            setRole('user');
          }
        } catch (err) {
          setRole('user');
        }
      } else {
        setRole('user');
      }
    });
    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    role,
    signup,
    login,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
