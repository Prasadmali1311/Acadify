import { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/config';

const AuthContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  async function signup(email, password, role = 'student', userInfo = {}) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user document in Firestore with all user info
    await setDoc(doc(db, 'users', user.uid), {
      email: user.email,
      firstName: userInfo.firstName || '',
      lastName: userInfo.lastName || '',
      mobileNumber: userInfo.mobileNumber || '',
      role: role,
      createdAt: new Date().toISOString()
    });

    return userCredential;
  }

  async function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  async function loginWithGoogle() {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Check if user document exists
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      // Create user document if it doesn't exist
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        firstName: user.displayName ? user.displayName.split(' ')[0] : '',
        lastName: user.displayName ? user.displayName.split(' ').slice(1).join(' ') : '',
        role: 'student', // Default role
        createdAt: new Date().toISOString()
      });
    }
    
    return user;
  }

  function logout() {
    return signOut(auth);
  }

  async function getUserRole(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role;
      }
      return null;
    } catch (error) {
      console.error('Error fetching user role:', error);
      return null;
    }
  }

  async function getUserProfile(uid) {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data();
      }
      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const role = await getUserRole(user.uid);
        const profile = await getUserProfile(user.uid);
        setUserRole(role);
        setCurrentUser({ ...user, role, profile });
      } else {
        setCurrentUser(null);
        setUserRole(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    signup,
    login,
    loginWithGoogle,
    logout,
    getUserRole,
    getUserProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
} 