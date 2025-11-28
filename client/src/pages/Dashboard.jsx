import { Edit, EditIcon, FilePenLineIcon, LoaderCircleIcon, PenIcon, PlusIcon, Trash2, Upload, UploadCloud, XIcon } from 'lucide-react'
import React, { useEffect, useState } from 'react'
import { dummyResumeData } from '../assets/assets'
import { useNavigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import api from '../config/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'

const Dashboard = () => {

  const navigate = useNavigate()

  const { user, token } = useSelector(state => state.auth)

  const colors = [
    '#9333ea', '#d97706', '#dc2626', '#0284c7', '#f59e0b', '#3b82f6', '#2563eb', '#4ade80', '#10b981', '#e11d48'
  ]

  const [allResumes, setAllResumes] = useState([])
  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState('');

  const loadAllResumes = async () => {
    // setAllResumes(dummyResumeData)
    try {
      const { data } = await api.get('/api/users/resumes', { headers: { Authorization: token } })
      setAllResumes(data.resume)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (e) => {
    try {
      e.preventDefault()
      const { data } = await api.post('/api/resumes/create', { title }, { headers: { Authorization: token } })
      setAllResumes([...allResumes, data.resume])
      setShowCreateResume(false)
      setTitle('')
      navigate(`/app/builder/${data.resume._id}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }
  const uploadResume = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const resumeText = await pdfToText(resume)

      const { data } = await api.post('/api/ai/upload-resume', { resumeText, title }, { headers: { Authorization: token } })
      setTitle('')
      setResume(null)
      setShowUploadResume(false)
      navigate(`/app/builder/${data.resumeId}`)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    setIsLoading(false)
  }
  const editTitle = async (e) => {
    try {
      e.preventDefault()
      const { data } = await api.put('/api/resumes/update', { resumeId: editResumeId, resumeData: { title } }, { headers: { Authorization: token } })
      setAllResumes(allResumes.map(resume => resume._id === editResumeId ? { ...resume, title } : resume))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
      // setEditResumeId(false)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
    // navigate('/app/builder/res1')
  }
  const deleteResume = (resumeId) => {
    setDeleteId(resumeId);
  };

  useEffect(() => {
    loadAllResumes()
  }, [])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-linear-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden' >{"Wellcome, " + user.name}</p>

        {/* options */}
        <div className='flex gap-4 mb-6'>
          <button
            onClick={() => setShowCreateResume(true)}
            className='relative flex-1 sm:flex-none py-4 px-3 md:py-6 md:px-8 group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95'
            style={{
              background: `linear-gradient(135deg, #22c55e, #16a34a)`,
              boxShadow: `0 4px 15px rgba(34, 197, 94, 0.3)`,
            }}
          >
            {/* Hover overlay */}
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`,
              }}
            />

            {/* Content */}
            <div className='relative z-10 flex items-center justify-center gap-2.5 md:gap-4'>
              <div className='p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform duration-300'>
                <PlusIcon className='size-6 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-white font-semibold text-base'>Create Resume</p>
                <p className='text-white/80 text-xs'>Start from scratch</p>
              </div>
            </div>
          </button>

          <button
            onClick={() => setShowUploadResume(true)}
            className='relative flex-1 sm:flex-none py-4 px-3 md:py-6 md:px-8 group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95'
            style={{
              background: `linear-gradient(135deg, #3b82f6, #1d4ed8)`,
              boxShadow: `0 4px 15px rgba(59, 130, 246, 0.3)`,
            }}
          >
            {/* Hover overlay */}
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`,
              }}
            />

            {/* Content */}
            <div className='relative z-10 flex items-center justify-center gap-2.5 md:gap-4'>
              <div className='p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform duration-300'>
                <UploadCloud className='size-6 text-white' />
              </div>
              <div className='text-left'>
                <p className='text-white font-semibold text-base'>Upload Resume</p>
                <p className='text-white/80 text-xs'>Import your PDF</p>
              </div>
            </div>
          </button>
        </div>

        <hr className='border-slate-300 my-6 sm:w-[305px] shadow-2xl' />

        {/* resume list heading */}
        <div className='mb-6'>
          <p className='text-2xl font-semibold text-slate-800'>My Resumes</p>
          <p className='text-slate-600 text-sm mt-1'>{allResumes.length} resume{allResumes.length !== 1 ? 's' : ''}</p>
        </div>


        {/* resumes */}
        <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'>
          {allResumes.map((resume, index) => {
            const baseColor = colors[index % colors.length];
            return (
              <button
                onClick={() => navigate(`/app/builder/${resume._id}`)}
                key={index}
                className='relative w-full p-6 py-6 lg:p-8 group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95 flex items-center justify-between'
                style={{
                  background: `linear-gradient(135deg, ${baseColor}, ${baseColor}dd)`,
                  boxShadow: `0 4px 15px ${baseColor}40`,
                }}
              >
                {/* Hover overlay */}
                <div
                  className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
                  style={{
                    background: `linear-gradient(135deg, rgba(255,255,255,0.2), transparent)`,
                  }}
                />

                {/* Content */}
                <div className='relative z-10 flex items-center gap-4  flex-1'>
                  <div className='p-3 mr-1 rounded-lg bg-white/20 group-hover:scale-110 transition-transform duration-300'>
                    <FilePenLineIcon className='size-6 text-white' />
                  </div>
                  <div className='text-left flex-1 min-w-0'>
                    <p className='text-white font-semibold text-base truncate'>{resume.title}</p>
                    <p className="text-white/80 text-xs">
                      Updated {
                        (() => {
                          const d = new Date(resume.updatedAt);
                          return `${d.getDate()}-${d.getMonth() + 1}-${d.getFullYear()}`;
                        })()
                      }
                    </p>

                  </div>
                </div>

                {/* Action buttons - Always visible on sm/md, hover on lg */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className='relative z-10 flex gap-2 ml-4 transition-opacity duration-300 sm:flex lg:opacity-0 lg:group-hover:opacity-100'
                >
                  <button
                    onClick={() => {
                      setEditResumeId(resume?._id);
                      setTitle(resume?.title)
                    }}
                    className='p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200'
                  >
                    <EditIcon size={16} className='text-white' />
                  </button>
                  <button
                    onClick={() => deleteResume(resume._id)}
                    className='p-3 rounded-lg bg-white/20 hover:bg-red-500/30 transition-all duration-200'
                  >
                    <Trash2 size={16} className='text-white' />
                  </button>
                </div>
              </button>
            )
          })}
        </div>

        {/* popups */}

        {showCreateResume && (
          <div
            onClick={() => setShowCreateResume(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <form
              onSubmit={createResume}
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
                  onClick={() => setShowCreateResume(false)}
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
                  onChange={(e) => setTitle(e.target.value)}
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

        {showUploadResume && (
          <div
            onClick={() => setShowUploadResume(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <form
              onSubmit={uploadResume}
              onClick={(e) => e.stopPropagation()}
              className="
        relative w-full max-w-md p-6 rounded-2xl
        bg-white/60          /* <= increased opacity */
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
                  onClick={() => setShowUploadResume(false)}
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
                  onChange={(e) => setTitle(e.target.value)}
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
                        onChange={(e) => setResume(e.target.files[0])}
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

        {editResumeId && (
          <div
            onClick={() => setEditResumeId(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-xl z-50 flex items-center justify-center p-4"
          >
            <form
              onSubmit={editTitle}
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
                  onClick={() => setEditResumeId(false)}
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
                  onChange={(e) => setTitle(e.target.value)}
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

        {deleteId && (
          <div
            onClick={() => setDeleteId("")}
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
                  onClick={() => setDeleteId("")}
                  className="flex-1 py-2.5 rounded-xl bg-slate-200/60 hover:bg-slate-300 text-slate-800 transition font-medium"
                >
                  Cancel
                </button>

                <button
                  onClick={async () => {
                    try {
                      const { data } = await api.delete(`/api/resumes/delete/${deleteId}`, {
                        headers: { Authorization: token }
                      });
                      setAllResumes(allResumes.filter(r => r._id !== deleteId));
                      toast.success(data.message);
                      setDeleteId("");
                    } catch (error) {
                      toast.error(error?.response?.data?.message || error.message);
                    }
                  }}
                  className="flex-1 py-2.5 rounded-xl 
            bg-red-600 text-white font-medium
            hover:bg-red-700 shadow-lg shadow-red-400/30 transition"
                >
                  Delete
                </button>
              </div>

              {/* Close Icon */}
              <XIcon
                onClick={() => setDeleteId("")}
                size={22}
                className="absolute top-4 right-4 text-slate-700 hover:text-black hover:rotate-90 transition cursor-pointer"
              />
            </div>
          </div>
        )}


      </div>
    </div>
  )
}

export default Dashboard