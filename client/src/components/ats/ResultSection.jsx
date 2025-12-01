import { TrendingUp } from "lucide-react";

export default function ResultSection({ displayScore, getScoreColor, getScoreLabel }) {
  return (
    <div
      className="bg-linear-to-br from-white/20 via-white/60 to-white/20 rounded-3xl shadow-2xl px-6 sm:px-8 py-8 sm:py-12 border-2 border-white backdrop-blur-xl flex flex-col items-center transition-shadow duration-300"
      style={{ minWidth: "min(280px, 90vw)", willChange: 'contents' }}
    >
      <div className="mb-2 sm:mb-3">
        <TrendingUp className="size-5 sm:size-6 inline text-purple-500" />
        <span className="ml-2 text-xs sm:text-sm font-bold text-purple-600 uppercase tracking-widest">Your ATS Score</span>
      </div>

      {/* Animated Score Number - optimized */}
      <div className="flex items-end gap-2 sm:gap-3">
        <span
          className="font-black text-5xl sm:text-6xl md:text-7xl tabular-nums"
          style={{
            color: getScoreColor(displayScore),
            textShadow: `0 10px 30px ${getScoreColor(displayScore)}40`,
            willChange: 'color, text-shadow'
          }}>
          {displayScore}
        </span>
        <span className="font-bold text-lg sm:text-2xl text-slate-700">{getScoreLabel(displayScore)}</span>
      </div>

      {/* Score Scale */}
      <div className="w-full flex justify-between mt-4 sm:mt-6 text-xs sm:text-sm text-slate-400 mb-2">
        <span>0</span>
        <span>50</span>
        <span>100</span>
      </div>

      {/* Animated Progress Bar - optimized */}
      <div className="relative w-full h-4 sm:h-5 bg-linear-to-r from-slate-100 to-slate-200 rounded-full overflow-hidden border border-white/40">
        <div
          className="absolute h-full rounded-full transition-all duration-700 ease-out shadow-lg"
          style={{
            width: `${Math.min(displayScore, 100)}%`,
            background: `linear-gradient(90deg, ${getScoreColor(displayScore)}, #22d3ee)`,
            willChange: 'width'
          }}
        ></div>
      </div>
    </div>
  );
}