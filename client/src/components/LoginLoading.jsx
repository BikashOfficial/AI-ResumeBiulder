import { motion } from "framer-motion";
import { LogIn, User } from "lucide-react";

const LoginLoading = () => {
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
          <div className="p-2 bg-blue-100 rounded-xl shadow-sm">
            <LogIn className="w-6 h-6 text-blue-600" />
          </div>
          <p className="text-gray-700 font-medium">Logging you in...</p>
        </motion.div>

        {/* Login Placeholder Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.97 }}
          animate={{
            opacity: 1,
            y: 0,
            scale: 1,
            boxShadow: "0 8px 20px rgba(0,0,0,0.06)"
          }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-64 h-72 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col items-center"
        >
          {/* Avatar Skeleton */}
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-6">
            <User className="w-8 h-8 text-gray-400" />
          </div>

          {/* Form Field Placeholder */}
          <div className="w-full space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-100 rounded w-full"></div>
            <div className="h-4 bg-gray-100 rounded w-4/5"></div>
          </div>

          {/* Button Placeholder */}
          <div className="mt-6 w-full h-10 bg-gray-200 rounded-lg"></div>
        </motion.div>

        {/* Loading Dots */}
        <div className="flex justify-center gap-2 mt-10">
          {dots.map((i) => (
            <motion.span
              key={i}
              className="w-3 h-3 bg-blue-400 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.4)]"
              initial={{ y: -8, opacity: 0.4 }}
              animate={{
                y: [-8, 4, -8],
                opacity: [0.4, 1, 0.4],
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
          className="text-sm text-blue-600 mt-4 font-medium"
        >
          Authenticating your account...
        </motion.p>
      </div>
    </div>
  );
};

export default LoginLoading;
