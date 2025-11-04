'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { motion, useInView } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] }
};

function FeatureCard({ icon, title, description, delay = 0, gradient }: { icon: string; title: string; description: string; delay?: number; gradient: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -10, scale: 1.02 }}
      className="group relative"
    >
      <motion.div 
        className={`absolute inset-0 bg-gradient-to-r ${gradient} rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-300 blur-xl`}
        whileHover={{ scale: 1.05 }}
      />
      <div className="relative bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-xl p-8 hover:shadow-2xl transition-all duration-300 border border-gray-700 group-hover:border-cyan-500/50 overflow-hidden">
        {/* Shine effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100"
          initial={{ x: "-100%", y: "-100%" }}
          whileHover={{ x: "100%", y: "100%" }}
          transition={{ duration: 0.6 }}
          style={{
            background: "linear-gradient(45deg, transparent, rgba(255,255,255,0.1), transparent)",
          }}
        />
        
        <motion.div 
          className="text-5xl mb-6 relative z-10"
          whileHover={{ scale: 1.2, rotate: 10 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          {icon}
        </motion.div>
        <h3 className={`text-2xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r ${gradient}`}>{title}</h3>
        <p className="text-gray-300 leading-relaxed">
          {description}
        </p>
      </div>
    </motion.div>
  );
}

function FloatingShape({ delay = 0, duration = 20 }: { delay?: number; duration?: number }) {
  return (
    <motion.div
      className="absolute w-64 h-64 rounded-full bg-gradient-to-r from-cyan-400/20 via-blue-500/20 to-purple-500/20 blur-3xl"
      animate={{
        x: [0, 100, 0],
        y: [0, -100, 0],
        scale: [1, 1.2, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration,
        repeat: Infinity,
        delay,
        ease: "easeInOut",
      }}
      style={{
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
      }}
    />
  );
}

export default function Home() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      router.push('/dashboard');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      
      {/* Hero Section */}
      <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 -mt-24 pt-24">
        {/* Animated Background Shapes */}
        <FloatingShape delay={0} duration={20} />
        <FloatingShape delay={2} duration={25} />
        <FloatingShape delay={4} duration={30} />
        
        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className="inline-block mb-6"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <span className="px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium backdrop-blur-sm">
                  🚀 AI-Powered Shift Management
                </span>
              </motion.div>

              <h1 className="text-6xl md:text-8xl font-black mb-8 leading-tight">
                <span className="block text-white mb-4">Welcome to</span>
                <motion.span
                  className="inline-block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600"
                  animate={{
                    backgroundPosition: ["0%", "100%", "0%"],
                  }}
                  transition={{ duration: 5, repeat: Infinity, ease: "linear" }}
                  style={{
                    backgroundImage: "linear-gradient(90deg, #22d3ee, #3b82f6, #8b5cf6, #22d3ee)",
                    backgroundSize: "200% auto",
                    WebkitTextStroke: "2px transparent",
                    paintOrder: "stroke fill",
                    filter: "drop-shadow(0 0 30px rgba(59, 130, 246, 0.5))",
                  }}
                >
                  SlotSwapper
                </motion.span>
              </h1>
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="text-xl md:text-2xl text-gray-100 mb-12 max-w-3xl mx-auto leading-relaxed"
            >
              The intelligent peer-to-peer shift scheduling platform.
              <br />
              <span className="text-cyan-300 font-semibold bg-cyan-500/10 px-3 py-1 rounded-lg">Swap shifts effortlessly</span> with real-time notifications and AI assistance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.5 }}
              className="flex flex-col sm:flex-row justify-center gap-4 mb-20"
            >
              <Link href="/auth/signup">
                <motion.button
                  whileHover={{ 
                    scale: 1.05, 
                    boxShadow: "0 20px 60px rgba(34, 211, 238, 0.6)",
                    y: -2
                  }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 text-white rounded-xl text-lg font-bold overflow-hidden shadow-2xl"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Get Started Free
                    <motion.span
                      animate={{ x: [0, 5, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      →
                    </motion.span>
                  </span>
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-purple-600 via-pink-600 to-red-500"
                    initial={{ x: "100%" }}
                    whileHover={{ x: 0 }}
                    transition={{ duration: 0.4, ease: "easeInOut" }}
                  />
                  
                  {/* Shimmer Effect */}
                  <motion.div
                    className="absolute inset-0 opacity-0 group-hover:opacity-100"
                    initial={{ x: "-100%" }}
                    animate={{ x: "100%" }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                    style={{
                      background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)",
                    }}
                  />
                </motion.button>
              </Link>

              <Link href="/auth/login">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md text-white rounded-xl text-lg font-bold border-2 border-white/30 hover:bg-white/20 hover:border-cyan-400/50 transition-all shadow-xl"
                >
                  Log In →
                </motion.button>
              </Link>
            </motion.div>

            {/* Stats Section */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {[
                { number: "10K+", label: "Active Users", color: "from-cyan-400 to-blue-500" },
                { number: "50K+", label: "Swaps Completed", color: "from-blue-500 to-purple-500" },
                { number: "99.9%", label: "Uptime", color: "from-purple-500 to-pink-500" },
                { number: "24/7", label: "AI Support", color: "from-pink-500 to-red-500" }
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, y: -5 }}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="text-center group cursor-default"
                >
                  <div className={`text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${stat.color} mb-2 group-hover:scale-110 transition-transform`}>
                    {stat.number}
                  </div>
                  <div className="text-sm text-gray-300 font-medium">{stat.label}</div>
                  <motion.div 
                    className={`h-1 w-0 group-hover:w-full mx-auto mt-2 bg-gradient-to-r ${stat.color} rounded-full transition-all duration-300`}
                  />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
        >
          <motion.div
            animate={{ y: [0, 10, 0] }}
            transition={{ duration: 1.5, repeat: Infinity }}
            className="w-6 h-10 border-2 border-cyan-400/50 rounded-full flex justify-center backdrop-blur-sm bg-white/5"
          >
            <motion.div
              animate={{ y: [0, 12, 0], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-1 h-3 bg-gradient-to-b from-cyan-400 to-blue-500 rounded-full mt-2 shadow-lg shadow-cyan-400/50"
            />
          </motion.div>
        </motion.div>
      </div>

      {/* Features Section */}
      <div className="relative py-32 bg-gradient-to-b from-gray-900 via-slate-900 to-gray-900">
        {/* Animated gradient orbs */}
        <div className="absolute top-20 left-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-20"
          >
            <motion.h2 
              className="text-5xl md:text-6xl font-black mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-white">Powerful </span>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">Features</span>
            </motion.h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Everything you need to manage your shifts efficiently
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon="📅"
              title="Smart Calendar"
              description="Intuitive calendar management with drag-and-drop functionality. Mark any shift as swappable with a single click and watch the magic happen."
              delay={0}
              gradient="from-cyan-400 to-blue-500"
            />
            <FeatureCard
              icon="🔄"
              title="Instant Swaps"
              description="Browse available shifts from colleagues and request swaps in real-time. Get instant notifications when someone accepts your request."
              delay={0.1}
              gradient="from-blue-500 to-purple-500"
            />
            <FeatureCard
              icon="🤖"
              title="AI Assistant"
              description="Let our AI analyze your schedule and suggest optimal swaps. Get intelligent recommendations based on your patterns and preferences."
              delay={0.2}
              gradient="from-purple-500 to-pink-500"
            />
            <FeatureCard
              icon="🔔"
              title="Real-time Notifications"
              description="Stay updated with WebSocket-powered notifications. Know instantly when someone requests your shift or accepts your swap."
              delay={0.3}
              gradient="from-pink-500 to-red-500"
            />
            <FeatureCard
              icon="🔒"
              title="Secure & Private"
              description="Bank-grade security with JWT authentication and encrypted data. Your schedule information is always safe and private."
              delay={0.4}
              gradient="from-red-500 to-orange-500"
            />
            <FeatureCard
              icon="📊"
              title="Analytics Dashboard"
              description="Track your swap history, analyze patterns, and make data-driven decisions. Understand your schedule better with visual insights."
              delay={0.5}
              gradient="from-orange-500 to-cyan-400"
            />
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="relative py-32 bg-gradient-to-br from-cyan-600 via-blue-700 to-purple-800 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        
        {/* Animated background elements */}
        <motion.div
          className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, 100, 0],
            y: [0, 50, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/30 rounded-full blur-3xl"
          animate={{
            x: [0, -100, 0],
            y: [0, -50, 0],
            scale: [1, 1.3, 1],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10"
        >
          <motion.h2 
            className="text-5xl md:text-6xl font-black text-white mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Ready to Transform Your Schedule?
          </motion.h2>
          <motion.p 
            className="text-xl text-cyan-100 mb-12 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            Join thousands of professionals who've already simplified their shift management
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <Link href="/auth/signup">
              <motion.button
                whileHover={{ 
                  scale: 1.05,
                  boxShadow: "0 20px 60px rgba(255, 255, 255, 0.3)"
                }}
                whileTap={{ scale: 0.95 }}
                className="group relative px-12 py-5 bg-white text-blue-600 rounded-xl text-xl font-bold shadow-2xl hover:shadow-3xl transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center justify-center gap-2">
                  Start Swapping Now
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    →
                  </motion.span>
                </span>
                
                {/* Gradient overlay on hover */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 opacity-0 group-hover:opacity-20"
                  whileHover={{ opacity: 0.2 }}
                />
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </>
  );
}
