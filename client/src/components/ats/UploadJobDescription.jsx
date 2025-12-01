import { UploadCloud, FileText, TrendingUp, Loader2 } from "lucide-react";

export default function UploadJobDescription({
  file,
  jobDescription,
  isAnalyzing,
  onFileUpload,
  onJobDescriptionChange,
  onAnalyze
}) {
  return (
    <>
      {/* JOB DESCRIPTION INPUT */}
      <div>
        <label className="block text-slate-800 font-semibold mb-2 text-base sm:text-lg">
          Job Description <span className="text-slate-500 text-sm font-normal">(Optional)</span>
        </label>
        <textarea
          placeholder="Paste the job description here..."
          className="transition-all w-full min-h-28 sm:min-h-32 p-4 sm:p-5 rounded-2xl border border-white focus:ring-2 focus:ring-purple-400 outline-none text-slate-700 resize-none shadow-inner bg-white/60 backdrop-blur-sm focus:bg-white/80 text-sm sm:text-base"
          value={jobDescription}
          onChange={(e) => onJobDescriptionChange(e.target.value)}
          disabled={isAnalyzing}
        ></textarea>
      </div>

      {/* RESUME UPLOAD */}
      <label htmlFor="resume-upload" className="block ">
        <div
          className={`rounded-2xl p-6 sm:p-10 transition-all duration-300 cursor-pointer flex flex-col items-center gap-3 sm:gap-4
            border-2  shadow-lg hover:shadow-xl
            ${file
              ? "border-green-400 border-dashed bg-green-50/40 backdrop-blur-sm"
              : "border-white hover:border-blue-400 hover:bg-blue-50/20 backdrop-blur-sm"}`}>
          {file ? (
            <>
              <FileText className="size-10 sm:size-12 text-green-600" />
              <p className="text-base sm:text-lg font-semibold text-center px-2">{file.name}</p>
              <button
                type="button"
                className="text-xs sm:text-sm underline text-slate-600 hover:text-red-600 transition-colors"
                tabIndex={-1}
                onClick={e => {
                  e.preventDefault();
                  onFileUpload(null);
                }}>
                Change File
              </button>
            </>
          ) : (
            <>
              <UploadCloud className="size-12 sm:size-14 text-blue-500 animate-bounce" />
              <span className="text-base sm:text-lg font-semibold text-center">
                Upload Resume <span className="text-xs sm:text-sm text-slate-500">(PDF)</span>
              </span>
              <span className="text-xs text-slate-500">or drag and drop</span>
            </>
          )}
        </div>
        <input
          id="resume-upload"
          type="file"
          accept=".pdf"
          onChange={(e) => onFileUpload(e.target.files[0])}
          className="hidden"
        />
      </label>

      {/* ANALYZE BUTTON */}
      {file && (
        <button
          onClick={onAnalyze}
          disabled={isAnalyzing}
          className={`w-full mt-3 py-4 sm:py-5 rounded-2xl font-semibold bg-linear-to-r from-blue-500 via-purple-500 to-pink-500 text-white hover:shadow-xl transition-all tracking-wide flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm sm:text-base backdrop-blur-sm border border-white/30 hover:border-white/50`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="animate-spin size-5 sm:size-6" />
              Analyzing...
            </>
          ) : (
            <>
              <TrendingUp className="size-5 sm:size-6" />
              Analyze ATS Score
            </>
          )}
        </button>
      )}
    </>
  );
}
