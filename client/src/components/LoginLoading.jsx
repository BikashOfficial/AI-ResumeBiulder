import { motion } from "framer-motion";
import { LogIn, User } from "lucide-react";

const LoginLoading = () => {
  const dots = [0, 1, 2];

  return (
    <div className="flex items-center justify-center min-h-screen bg-linear-to-br from-white via-gray-50 to-gray-100">
      <div className="relative flex flex-col items-center">
        

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
