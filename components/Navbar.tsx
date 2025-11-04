'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  // Smooth transformations based on scroll - horizontal shrinking
  const maxWidth = useTransform(scrollY, [0, 100], ["100%", "96%"]);
  const borderRadius = useTransform(scrollY, [0, 100], [16, 20]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <div className="fixed w-full top-0 left-0 z-50 flex justify-center pointer-events-none">
      <motion.nav
        style={{ 
          maxWidth,
          borderRadius,
        }}
        initial={{ y: 0, opacity: 1 }}
        className={`w-full transition-all duration-500 pointer-events-auto mt-4 mx-2 sm:mx-4 ${
          isScrolled 
            ? 'bg-gray-900/95 backdrop-blur-xl shadow-2xl border border-cyan-500/20' 
            : 'bg-gray-900/80 backdrop-blur-md shadow-lg border border-white/10'
        }`}
      >
        <div className={`flex justify-between items-center transition-all duration-500 ${
          isScrolled ? 'px-4 py-3' : 'px-6 sm:px-8 py-4'
        }`}
        >
          <div className="flex items-center">
            <Link href={user ? '/dashboard' : '/'}>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-3"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className={`bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl shadow-lg shadow-cyan-500/50 transition-all duration-500 ${
                    isScrolled ? 'w-7 h-7' : 'w-8 h-8'
                  }`}
                />
                <span 
                  className={`font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent transition-all duration-500 ${
                    isScrolled ? 'text-xl' : 'text-2xl'
                  }`}
                >
                  SlotSwapper
                </span>
              </motion.div>
            </Link>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {user ? (
              <>
                <NavLink href="/dashboard" isScrolled={isScrolled}>Dashboard</NavLink>
                <NavLink href="/marketplace" isScrolled={isScrolled}>Marketplace</NavLink>
                <NavLink href="/requests" isScrolled={isScrolled}>Requests</NavLink>
                <NavLink href="/chat" isScrolled={isScrolled}>AI Chat</NavLink>
                
                <div className="hidden md:flex items-center space-x-3 ml-4 pl-4 border-l border-cyan-500/30">
                  <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center space-x-2"
                  >
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className="w-9 h-9 rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-cyan-500/30"
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </motion.div>
                    <span className="text-sm font-medium text-gray-200">{user.name}</span>
                  </motion.div>
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleLogout}
                    className="bg-gradient-to-r from-red-500 to-pink-600 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-lg hover:shadow-xl hover:shadow-red-500/30 transition-all"
                  >
                    Logout
                  </motion.button>
                </div>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <motion.button
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="text-gray-200 hover:text-cyan-400 px-5 py-2 rounded-xl text-sm font-medium transition-colors"
                  >
                    Log In
                  </motion.button>
                </Link>
                <Link href="/auth/signup">
                  <motion.button
                    whileHover={{ 
                      scale: 1.05, 
                      y: -2,
                      boxShadow: "0 10px 30px rgba(34, 211, 238, 0.4)" 
                    }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-bold shadow-lg transition-all"
                  >
                    Sign Up
                  </motion.button>
                </Link>
              </>
            )}
          </div>
        </div>
      </motion.nav>
    </div>
  );
}

function NavLink({ href, children, isScrolled }: { href: string; children: React.ReactNode; isScrolled: boolean }) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        className="relative group px-3 py-2"
      >
        <span className={`text-sm font-medium transition-colors ${
          isScrolled ? 'text-gray-200 group-hover:text-cyan-400' : 'text-gray-100 group-hover:text-cyan-300'
        }`}>
          {children}
        </span>
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full"
          initial={{ scaleX: 0 }}
          whileHover={{ scaleX: 1 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        />
      </motion.div>
    </Link>
  );
}
