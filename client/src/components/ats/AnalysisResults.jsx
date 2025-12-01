// import { CheckCircle, AlertCircle, Sparkles } from "lucide-react";

// export default function AnalysisResults({ analysis }) {
//   if (!analysis) return null;

//   return (
//     <div className="w-full max-w-2xl space-y-6 sm:space-y-8 animate-fade-in">

//       {/* Missing Keywords */}
//       <div className="flex gap-3 sm:gap-4 bg-white/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:bg-white/35 transition-all">
//         <AlertCircle className="text-red-400 size-6 sm:size-7 mt-0.5 shrink-0" />
//         <div className="flex-1 min-w-0">
//           <div className="text-base sm:text-lg font-bold text-red-500 mb-2 sm:mb-3">Missing Keywords</div>
//           <ul className="flex flex-wrap gap-2">
//             {analysis.improvements.map((item, idx) => (
//               <li key={idx} className="text-slate-700 text-sm sm:text-base flex items-start gap-2">
//                 <span className="text-orange-500 font-bold shrink-0">•</span>
//                 <span>{item}</span>
//               </li>
//             ))}
//           </ul>
//         </div>
//       </div>

//       {/* Keywords */}
//       <div className="flex items-center gap-3 sm:gap-4 bg-white/25 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border border-white/50 hover:bg-white/35 transition-all">
//         <Sparkles className="text-purple-600 size-6 sm:size-7 shrink-0" />
//         <div className="flex-1 min-w-0 text-sm sm:text-base font-semibold text-slate-700">
//           Keyword Match:
//           <span className="ml-2 font-black text-purple-600">{analysis.keywords.found}</span>
//           found,
//           <span className="ml-2 font-black text-rose-500">{analysis.keywords.missing}</span>
//           missing
//         </div>
//       </div>
//     </div>
//   );
// }
import { CheckCircle, AlertCircle, Sparkles, TrendingUp } from "lucide-react";

export default function AnalysisResults({ analysis }) {
  if (!analysis) return null;

  return (
    <div className="w-full max-w-2xl space-y-6 sm:space-y-8 animate-fade-in">






      {/* Keywords Found */}
      <div className="flex gap-3 sm:gap-4 bg-white/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-white hover:bg-white/50 transition-all">
        <CheckCircle className="text-green-600 size-6 sm:size-7 mt-0.5 shrink-0" />
        <div className="flex-1">
          <div className="text-base sm:text-lg font-bold text-green-600 mb-2 sm:mb-3">
            Keywords Found
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.keywordsFound.map((keyword, idx) => (
              <span
                key={idx}
                className=" px-3 py-1 text-green-600 text-xs sm:text-sm rounded-full border border-green-300 
             bg-linear-to-br from-white/20 via-white/60 to-white/20 backdrop-blur-sm shadow-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Missing Keywords */}
      <div className="flex gap-3 sm:gap-4 bg-white/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-white hover:bg-white/35 transition-all">
        <AlertCircle className="text-red-400 size-6 sm:size-7 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold text-red-500 mb-2 sm:mb-3">
            Missing Keywords
          </div>
          <div className="flex flex-wrap gap-2">
            {analysis.missingKeywords.map((keyword, idx) => (
              <span
                key={idx}
                className="px-3 py-1 text-red-600 text-xs sm:text-sm rounded-full border border-red-300 
             bg-linear-to-br from-white/20 via-white/60 to-white/20 backdrop-blur-sm shadow-sm"
              >
                {keyword}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Improvements */}
      <div className="flex gap-3 sm:gap-4 bg-white/50 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-white hover:bg-white/35 transition-all">
        <AlertCircle className="text-orange-400 size-6 sm:size-7 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold text-orange-500 mb-2 sm:mb-3">
            Improvements Required
          </div>
          <ul className="space-y-2 sm:space-y-2">
            {analysis.improvements.map((item, idx) => (
              <li key={idx} className="text-slate-700 text-sm sm:text-base flex items-start gap-2">
                <span className="text-orange-500 font-bold shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Summary */}
      <div className="flex gap-3 sm:gap-4 bg-white/40 backdrop-blur-lg rounded-2xl p-4 sm:p-6 border-2 border-white hover:bg-white/50 transition-all">
        <Sparkles className="text-purple-600 size-6 sm:size-7 mt-0.5 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="text-base sm:text-lg font-bold text-purple-600 mb-2 sm:mb-3">
            Summary
          </div>
          <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
            {analysis.summary}
          </p>
        </div>
      </div>

    </div>
  );
}
