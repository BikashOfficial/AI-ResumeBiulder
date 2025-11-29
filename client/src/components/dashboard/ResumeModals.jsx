import { LoaderCircleIcon, UploadCloud, XIcon } from 'lucide-react'
import React from 'react'

const ResumeModals = ({
  showCreateResume,
  showUploadResume,
  editResumeId,
  deleteId,
  title,
  resume,
  isLoading,
  onSetShowCreateResume,
  onSetShowUploadResume,
  onSetEditResumeId,
  onSetDeleteId,
  onSetTitle,
  onSetResume,
  onCreateResume,
  onUploadResume,
  onEditTitle,
  onDeleteResume,
}) => {
  return (
    <>
      {/* Create Resume Modal */}
      {showCreateResume && (
        <div
          onClick={() => onSetShowCreateResume(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={onCreateResume}
            onClick={(e) => e.stopPropagation()}
            className="
        relative w-full max-w-md p-6 rounded-2xl
        bg-white/60
        border border-white/40
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl overflow-hidden
        animate-in fade-in zoom-in duration-300
      "
          >
            {/* Shine Sweep */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-120%] before:rotate-6 hover:before:animate-[shine_1.5s_ease-out]" />

            <style>
              {`
            @keyframes shine {
              0% { transform: translateX(-120%) rotate(6deg); }
              100% { transform: translateX(200%) rotate(6deg); }
            }
        `}
            </style>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Create Resume
              </h2>

              <XIcon
                onClick={() => onSetShowCreateResume(false)}
                size={22}
                className="text-slate-700 hover:text-black hover:rotate-90 transition cursor-pointer"
              />
            </div>

            {/* Title */}
            <label className="text-sm font-medium text-slate-800">
              Resume Title
              <input
                required
                type="text"
                onChange={(e) => onSetTitle(e.target.value)}
                value={title}
                placeholder="e.g. My Resume"
                className="
            w-full mt-1 px-4 py-2.5 rounded-lg
            bg-white/70 text-black
            placeholder:text-slate-500
            border border-white/40
            focus:ring-2 focus:ring-purple-400/70
            outline-none transition
          "
              />
            </label>

            {/* Button */}
            <button
              className="
          w-full mt-6 py-2.5 rounded-xl text-white font-medium
          bg-linear-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700 
          shadow-lg shadow-purple-500/30 
          flex items-center justify-center gap-2 transition
        "
            >
              Create Resume
            </button>

          </form>
        </div>
      )}

      {/* Upload Resume Modal */}
      {showUploadResume && (
        <div
          onClick={() => onSetShowUploadResume(false)}
          className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={onUploadResume}
            onClick={(e) => e.stopPropagation()}
            className="
        relative w-full max-w-md p-6 rounded-2xl
        bg-white/60
        border border-white/40
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl overflow-hidden
        animate-in fade-in zoom-in duration-300
      "
          >
            {/* Shine Sweep */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-120%] before:rotate-6 hover:before:animate-[shine_1.5s_ease-out]" />

            <style>
              {`
          @keyframes shine {
            0% { transform: translateX(-120%) rotate(6deg); }
            100% { transform: translateX(200%) rotate(6deg); }
          }
          @keyframes pulseDot {
            0%, 100% { opacity: .2; }
            50% { opacity: 1; }
          }
          @keyframes uploadBar {
            0% { width: 0%; }
            100% { width: 100%; }
          }
        `}
            </style>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Upload Resume
              </h2>

              <XIcon
                onClick={() => onSetShowUploadResume(false)}
                size={22}
                className="text-slate-700 hover:text-black hover:rotate-90 transition cursor-pointer"
              />
            </div>

            {/* Title */}
            <label className="text-sm font-medium text-slate-800">
              Resume Title
              <input
                required
                type="text"
                onChange={(e) => onSetTitle(e.target.value)}
                value={title}
                placeholder="e.g. Fullstack Resume"
                className="
            w-full mt-1 px-4 py-2.5 rounded-lg
            bg-white/70 text-black
            placeholder:text-slate-500
            border border-white/40
            focus:ring-2 focus:ring-purple-400/70
            outline-none transition
          "
              />
            </label>

            {/* Upload Area */}
            <label htmlFor="resume-inp">
              <p className="text-sm font-medium text-slate-800 mt-4">Select File</p>

              <div
                className="
            mt-2 p-10 rounded-xl border-2 border-dashed
            bg-white/50 text-slate-700 flex flex-col items-center
            justify-center gap-3 cursor-pointer transition
            hover:border-purple-400 hover:text-purple-600
          "
              >
                {!resume ? (
                  <>
                    {isLoading ? (
                      <LoaderCircleIcon className="size-7 animate-spin text-purple-500" />
                    ) : (
                      <UploadCloud className="size-7 text-slate-600" />
                    )}

                    <p>{isLoading ? "Uploading..." : "Click to upload PDF"}</p>

                    <input
                      id="resume-inp"
                      hidden
                      type="file"
                      accept=".pdf"
                      onChange={(e) => onSetResume(e.target.files[0])}
                    />
                  </>
                ) : (
                  <p className="font-medium">{resume.name}</p>
                )}
              </div>
            </label>

            {/* Upload Progress */}
            {isLoading && (
              <div className="mt-5 w-full">
                <div className="h-2 bg-white/40 rounded-full overflow-hidden">
                  <div className="h-full bg-linear-to-r from-purple-500 to-blue-500 animate-[uploadBar_2s_infinite]" />
                </div>

                <div className="flex items-center gap-1 mt-2 text-slate-700 text-sm">
                  Uploading
                  <span className="animate-[pulseDot_1s_infinite]">•</span>
                  <span className="animate-[pulseDot_1s_infinite_0.2s]">•</span>
                  <span className="animate-[pulseDot_1s_infinite_0.4s]">•</span>
                </div>
              </div>
            )}

            {/* Button */}
            <button
              disabled={isLoading}
              className="
          w-full mt-6 py-2.5 rounded-xl text-white font-medium
          bg-linear-to-r from-purple-600 to-blue-600
          hover:from-purple-700 hover:to-blue-700 
          shadow-lg shadow-purple-500/30 
          disabled:opacity-60 flex items-center 
          justify-center gap-2 transition
        "
            >
              {isLoading && <LoaderCircleIcon className="size-5 animate-spin" />}
              {isLoading ? "Uploading..." : "Upload Resume"}
            </button>

          </form>
        </div>
      )}

      {/* Edit Resume Modal */}
      {editResumeId && (
        <div
          onClick={() => onSetEditResumeId('')}
          className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <form
            onSubmit={onEditTitle}
            onClick={(e) => e.stopPropagation()}
            className="
        relative w-full max-w-md p-6 rounded-2xl
        bg-white/60
        border border-white/40
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl overflow-hidden
        animate-in fade-in zoom-in duration-300
      "
          >
            {/* Shine Sweep */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-120%] before:rotate-6 hover:before:animate-[shine_1.5s_ease-out]" />

            <style>
              {`
          @keyframes shine {
            0% { transform: translateX(-120%) rotate(6deg); }
            100% { transform: translateX(200%) rotate(6deg); }
          }
        `}
            </style>

            {/* Header */}
            <div className="relative flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-slate-900">
                Edit Resume Title
              </h2>

              <XIcon
                onClick={() => onSetEditResumeId('')}
                size={22}
                className="text-slate-700 hover:text-black hover:rotate-90 transition cursor-pointer"
              />
            </div>

            {/* Input */}
            <label className="text-sm font-medium text-slate-800">
              Resume Title
              <input
                required
                type="text"
                onChange={(e) => onSetTitle(e.target.value)}
                value={title}
                placeholder="e.g. My Resume"
                className="
            w-full mt-1 px-4 py-2.5 rounded-lg
            bg-white/60 text-black
            placeholder:text-slate-500
            border border-white/40
            focus:ring-2
            outline-none transition
          "
              />
            </label>

            {/* Button */}
            <button
              className="
          w-full mt-6 py-2.5 rounded-xl text-white font-medium
          bg-linear-to-r from-green-600 to-green-600
          hover:from-green-700 hover:to-green-700
          shadow-lg
          flex items-center justify-center gap-2 transition
        "
            >
              Update
            </button>

          </form>
        </div>
      )}

      {/* Delete Resume Modal */}
      {deleteId && (
        <div
          onClick={() => onSetDeleteId("")}
          className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="
        relative w-full max-w-sm p-6 rounded-2xl
        bg-white/60 border border-white/40
        shadow-[0_8px_40px_rgba(0,0,0,0.35)]
        backdrop-blur-2xl overflow-hidden
        animate-in fade-in zoom-in duration-300
      "
          >
            {/* Shine Sweep */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-linear-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-120%] before:rotate-6 hover:before:animate-[shine_1.5s_ease-out]" />

            <style>
              {`
        @keyframes shine {
          0% { transform: translateX(-120%) rotate(6deg); }
          100% { transform: translateX(200%) rotate(6deg); }
        }
      `}
            </style>

            {/* Header */}
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-slate-900">Delete Resume?</h2>
              <p className="text-slate-600 mt-1 text-sm">
                This action cannot be undone.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => onSetDeleteId("")}
                className="flex-1 py-2.5 rounded-xl bg-slate-200/60 hover:bg-slate-300 text-slate-800 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => onDeleteResume(deleteId)}
                className="flex-1 py-2.5 rounded-xl 
            bg-red-600 text-white font-medium
            hover:bg-red-700 shadow-lg shadow-red-400/30 transition"
              >
                Delete
              </button>
            </div>

            {/* Close Icon */}
            <XIcon
              onClick={() => onSetDeleteId("")}
              size={22}
              className="absolute top-4 right-4 text-slate-700 hover:text-black hover:rotate-90 transition cursor-pointer"
            />
          </div>
        </div>
      )}
    </>
  )
}

export default ResumeModals
