import { motion } from "framer-motion";
import { Link2Off, Home } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

export default function InvalidResumeLink() {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="bg-white border border-amber-100 shadow-lg rounded-2xl px-8 py-6 text-center max-w-sm w-full relative overflow-hidden"
      >
        {/* Soft amber glow overlay */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-linear-to-r from-amber-200/30 via-orange-100/10 to-transparent pointer-events-none"
          animate={{
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Warning icon */}
        <motion.div
          initial={{ y: -8, opacity: 0 }}
          animate={{
            y: [0, -3, 0],
            opacity: 1,
          }}
          transition={{
            duration: 1.6,
            ease: "easeInOut",
            repeat: Infinity,
          }}
          className="flex justify-center relative z-10"
        >
          <div className="p-3 bg-amber-100 rounded-2xl shadow-inner">
            <Link2Off className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h2
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, ease: "easeOut" }}
          className="text-lg font-semibold text-gray-800 mt-4"
        >
          Invalid Resume Link
        </motion.h2>

        {/* Subtext */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-sm text-gray-500 mt-2 leading-relaxed"
        >
          The resume link you’ve provided seems invalid or has expired.
          Please verify the link and try again later.
        </motion.p>

        {/* Warning pulse bar */}
        <div className="relative w-full mt-6 h-2 bg-amber-100 rounded-full overflow-hidden">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-amber-400 via-orange-500 to-amber-400"
            animate={{
              opacity: [0.6, 1, 0.6],
              scaleX: [0.9, 1, 0.9],
            }}
            transition={{
              duration: 1.6,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            style={{ originX: 0.5 }}
          />
          <motion.div
            className="absolute top-0 left-0 h-full w-1/3 bg-linear-to-r from-transparent via-white/60 to-transparent"
            animate={{ x: ["-100%", "150%"] }}
            transition={{
              duration: 2.8,
              ease: "easeInOut",
              repeat: Infinity,
            }}
          />
        </div>

        {/* Go Home Button */}






        {/* Pulsing border */}
        <motion.div
          className="absolute inset-0 rounded-2xl border border-green-300/40"
          animate={{
            opacity: [0.3, 0.7, 0.3],
          }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </motion.div>


      <button
        onClick={() => (window.location.href = "/")}
        className="mt-6 flex items-center justify-center gap-2 px-6 py-2.5 
                 text-white font-medium rounded-xl shadow-md 
                 bg-linear-to-r from-green-400 via-green-500 to-green-400
                 hover:from-green-500 hover:to-green-400
                 hover:shadow-lg transition-all duration-300 ease-in-out"
      >
        <Home className="w-5 h-5" />
        Go Home
      </button>
    </div>
  );
}
