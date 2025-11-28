import { motion } from "framer-motion";
import { FileText } from "lucide-react";

export default function LoadingScreen() {
  const pages = [0, 1, 2];
  const dots = [0, 1, 2];

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100">
      <div className="relative flex flex-col items-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="p-2 bg-emerald-100 rounded-xl shadow-sm">
            <FileText className="w-6 h-6 text-emerald-600" />
          </div>
          <p className="text-gray-700 font-medium">
            Preparing your resume preview...
          </p>
        </motion.div>

        {/* Resume Pages */}
        <div className="relative w-64 h-80">
          {pages.map((i) => (
            <motion.div
              key={i}
              initial={{ y: 40, opacity: 0, scale: 0.95 }}
              animate={{
                y: i * 5,
                opacity: 1,
                scale: 1,
                boxShadow: "0 6px 16px rgba(0,0,0,0.06)",
              }}
              transition={{
                delay: i * 0.2,
                duration: 0.6,
                ease: "easeOut",
              }}
              className="absolute inset-0 bg-white rounded-2xl border border-gray-200 origin-bottom"
              style={{ top: i * 10, zIndex: pages.length - i }}
            >
              <div className="p-6 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                <div className="h-3 bg-gray-100 rounded w-3/4"></div>
                <div className="mt-4 h-3 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-gray-100 rounded w-5/6"></div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* One-by-one dropping dots */}
        <div className="flex justify-center gap-2 mt-10">
          {dots.map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.4)]"
              initial={{ y: -8, opacity: 0.4 }}
              animate={{
                y: [ -8, 4, -8 ],
                opacity: [ 0.4, 1, 0.4 ],
              }}
              transition={{
                duration: 1,
                ease: "easeInOut",
                delay: i * 0.25,
                repeat: Infinity,
                repeatDelay: 0.3,
              }}
            />
          ))}
        </div>

        {/* Status Text */}
        <motion.p
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-sm text-emerald-600 mt-4 font-medium"
        >
          Loading resume details...
        </motion.p>
      </div>
    </div>
  );
}
