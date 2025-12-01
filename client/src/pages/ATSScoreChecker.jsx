import { useState, useEffect } from "react";
import {
  TrendingUp,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import pdfToText from 'react-pdftotext'
import UploadJobDescription from "../components/ats/UploadJobDescription";
import ResultSection from "../components/ats/ResultSection";
import AnalysisResults from "../components/ats/AnalysisResults";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import api from "../config/api";
import toast from "react-hot-toast";

export default function ATSScoreChecker() {

  const navigate = useNavigate();
  const { token } = useSelector(state => state.auth);

  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [score, setScore] = useState(null);
  const [displayScore, setDisplayScore] = useState(0);
  const [analysis, setAnalysis] = useState(null);

  // Number animation effect - optimized
  useEffect(() => {
    if (score === null) return;

    let animationFrame;
    let currentValue = 0;
    const increment = score / 30; // Faster animation with fewer frames

    const animate = () => {
      if (currentValue < score) {
        currentValue += increment;
        setDisplayScore(Math.min(Math.floor(currentValue), score));
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayScore(score);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [score]);

  const handleFileUpload = (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setScore(null);
      setDisplayScore(0);
      setAnalysis(null);
    }
  };

  const analyzeResume = async () => {
    if (!file) {
      toast.error("Please upload a resume PDF");
      return;
    }

    setIsAnalyzing(true);
    setDisplayScore(0);

    try {
      // Extract text from PDF
      const resumeText = await pdfToText(file);

      // Call ATS API endpoint
      const { data } = await api.post(
        '/api/ai/ats',
        { resumeText, jobDesc: jobDescription },
        { headers: { Authorization: token } }
      );

      // Set the results from the API
      setScore(data.atsScore);
      setAnalysis({
        summary: data.summary || "",
        improvements: data.improvements || [],
        keywordsFound: data.keywordsFound || [],
        missingKeywords: data.missingKeywords || []
      });

      toast.success("ATS Analysis Complete!");
    } catch (error) {
      console.error("ATS Analysis Error:", error);
      toast.error(error?.response?.data?.message || "Failed to analyze resume");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "#22c55e";
    if (score >= 60) return "#eab308";
    return "#ef4444";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    return "Needs Work";
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-purple-50 to-pink-50 py-8 sm:py-12 px-4 sm:px-6 relative overflow-hidden">
      {/* Animated background blobs - optimized */}
      <div className="absolute top-0 left-0 w-72 sm:w-96 h-72 sm:h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" style={{ willChange: 'transform' }}></div>
      <div className="absolute top-0 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" style={{ willChange: 'transform' }}></div>
      <div className="absolute bottom-0 left-1/2 w-72 sm:w-96 h-72 sm:h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" style={{ willChange: 'transform' }}></div>

      <div className="max-w-4xl mx-auto relative z-10">

        {/* HEADER */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="flex gap-16">
            <div onClick={() => navigate(-1)} className=" cursor-pointer inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <ArrowLeft className="text-slate-700 size-5 "/>
            </div>
            <div className=" inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full bg-white/40 backdrop-blur-md border border-white/60 mb-4 shadow-lg hover:shadow-xl transition-shadow duration-300">
              <Sparkles className="size-4 text-purple-600 animate-pulse" />
              <span className="text-xs sm:text-sm font-bold text-purple-700 tracking-wider">ATS SCORE CHECKER</span>
            </div>
          </div>

          <p className="text-slate-600 text-sm sm:text-base md:text-lg px-2">
            Upload your resume &amp; paste job description to get a tailored matching analysis.
          </p>
        </div>

        {/* MAIN CARD SECTION */}
        <div className= "bg-black/5 backdrop-blur-xl rounded-3xl sm:rounded-2xl border border-white shadow-2xl p-6 sm:p-8 mb-8 space-y-6 transition-all duration-300 hover:shadow-3xl">

          {/* UPLOAD + JOB DESCRIPTION */}
          {!score && (
            <UploadJobDescription
              file={file}
              jobDescription={jobDescription}
              isAnalyzing={isAnalyzing}
              onFileUpload={(uploadedFile) => {
                if (uploadedFile && uploadedFile.type === "application/pdf") {
                  setFile(uploadedFile);
                  setScore(null);
                  setDisplayScore(0);
                  setAnalysis(null);
                } else if (uploadedFile === null) {
                  setFile(null);
                }
              }}
              onJobDescriptionChange={(value) => setJobDescription(value)}
              onAnalyze={analyzeResume}
            />
          )}

          {/* RESULT SECTION */}
          {score && (
            <div className="flex flex-col items-center py-6 sm:py-10 space-y-8">
              {/* Score Display */}
              <ResultSection
                displayScore={displayScore}
                getScoreColor={getScoreColor}
                getScoreLabel={getScoreLabel}
              />

              {/* Analysis Results */}
              <AnalysisResults analysis={analysis} />

              {/* Reset Button */}
              <button
                onClick={() => {
                  setFile(null);
                  setScore(null);
                  setDisplayScore(0);
                  setAnalysis(null);
                  setJobDescription("");
                }}
                className="mt-6 sm:mt-10 rounded-full py-3 sm:py-4 px-6 sm:px-8 text-purple-700 bg-linear-to-r from-purple-100/60 to-pink-100/60 font-bold text-base sm:text-lg shadow-lg hover:shadow-xl hover:from-purple-100 hover:to-pink-100 transition-all backdrop-blur-sm border-2 border-white hover:border-white/70"
              >
                Check Another Resume
              </button>
            </div>
          )}

        </div>
      </div>

      <style jsx>{`
        @keyframes blob {
          0%, 100% {
            transform: translate3d(0, 0, 0) scale(1);
          }
          33% {
            transform: translate3d(30px, -50px, 0) scale(1.1);
          }
          66% {
            transform: translate3d(-20px, 20px, 0) scale(0.9);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animate-fade-in {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}