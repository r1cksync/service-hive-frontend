'use client';

import { motion } from 'framer-motion';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="relative">
        {/* Outer rotating circle */}
        <motion.div
          animate={{
            rotate: 360,
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "linear"
          }}
          className="w-24 h-24 border-4 border-blue-500/30 border-t-blue-500 rounded-full"
        />
        
        {/* Inner pulsing circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-md" />
        </motion.div>
        
        {/* Center logo */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            animate={{
              rotate: [0, 180, 360],
            }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-8 h-8 bg-white rounded-lg"
          />
        </div>
      </div>
      
      <motion.p
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute mt-32 text-white text-lg font-medium"
      >
        Loading...
      </motion.p>
    </div>
  );
}
