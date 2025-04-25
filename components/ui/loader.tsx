import React from "react";
import { motion } from "framer-motion";

const Loader: React.FC = () => {
  return (
    <div className="flex items-center justify-center h-screen bg-white">
      <motion.div
        className="relative w-24 h-24"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, ease: "linear", duration: 2 }}
      >
        <div className="absolute inset-0 rounded-full border-4 border-black opacity-20" />
        <motion.div
          className="absolute w-full h-full border-4 border-t-transparent border-black rounded-full"
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 left-1/2 w-3 h-3 bg-black rounded-full"
          style={{ translateX: "-50%", translateY: "-50%" }}
          animate={{
            scale: [1, 1.3, 1],
            opacity: [1, 0.6, 1],
          }}
          transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>
    </div>
  );
};

export default Loader;
