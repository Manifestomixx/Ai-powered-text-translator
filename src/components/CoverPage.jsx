"use client";
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { IoLogoIonitron } from "react-icons/io";
import { motion } from "framer-motion";



const CoverPage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const timer = setTimeout(() => {
          navigate("/");
        }, 3000);
    
        return () => clearTimeout(timer);
      }, [navigate]);
  
  return (
    <>
          <div className="bg-white p-6 flex flex-col justify-center items-center w-full h-dvh z-10 fixed">
            <motion.div
            animate={{
              scale: [1, 1.1, 1], 
              color: ["#A09F9F", "#60a5fa", "#A09F9F"],
            }}
            transition={{
              duration: 1.7,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            <IoLogoIonitron className="text-[7rem] mb-2" />
          </motion.div>
            <h3 className="text-sm font-semibold text-gray-300">LINGUA TRANSLATOR 1.0</h3>
          </div>
    </>
  );
};

export default CoverPage;
