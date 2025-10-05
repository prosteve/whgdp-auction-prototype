import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  User
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../config/firebase';

export interface UserData {
  uid: string;
  email: string;
  displayName: string;
  userType: 'individual' | 'corporate' | 'government';
  phoneNumber?: string;
  companyName?: string;
  location?: {
    country: string;
    city: string;
  };
  createdAt: Date;
}

export const authService = {
  async register(email: string, password: string, userData: Partial<UserData>) {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Create user profile in Firestore
    const userDoc: UserData = {
      uid: user.uid,
      email: user.email!,
      displayName: userData.displayName || '',
      userType: userData.userType || 'individual',
      phoneNumber: userData.phoneNumber,
      companyName: userData.companyName,
      location: userData.location,
      createdAt: new Date()
    };
    
    await setDoc(doc(db, 'users', user.uid), userDoc);
    return user;
  },

  async login(email: string, password: string) {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  },

  async logout() {
    await signOut(auth);
  },

  async getUserProfile(uid: string): Promise<UserData | null> {
    const userDoc = await getDoc(doc(db, 'users', uid));
    return userDoc.exists() ? userDoc.data() as UserData : null;
  }
};
