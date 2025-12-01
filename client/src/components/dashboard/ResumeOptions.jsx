import { Gauge, PlusIcon, UploadCloud } from 'lucide-react'
import React from 'react'
import { Link } from 'react-router-dom'

const ResumeOptions = ({ onCreateClick, onUploadClick }) => {
  return (
    // <div className='flex  gap-4 mb-6'>
    <div className="grid grid-cols-2 md:grid-cols-none md:flex gap-4 mb-6">
      <button
        onClick={onCreateClick}
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
        onClick={onUploadClick}
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


      <Link
        to={'/app/ats'}
        className="relative flex-1 sm:flex-none py-4 px-3 md:py-6 md:px-8 group overflow-hidden rounded-xl transition-all duration-300 hover:shadow-lg active:scale-95"
        style={{
          background: `linear-gradient(135deg, #7c3aed, #7c3aed)`, // Purple → Deep Purple
          boxShadow: `0 4px 15px rgba(124, 58, 237, 0.35)`,        // Purple glow
        }}
      >
        {/* Hover overlay */}
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `linear-gradient(135deg, rgba(255,255,255,0.25), transparent)`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex items-center justify-center gap-2.5 md:gap-4">
          <div className="p-2 rounded-lg bg-white/20 group-hover:scale-110 transition-transform duration-300">
            <Gauge className="size-6 text-white" />
          </div>
          <div className="text-left">
            <p className="text-white font-semibold text-base">Check ATS</p>
            <p className="text-white/80 text-xs">Analyze your resume</p>

          </div>
        </div>
      </Link>

    </div>
  )
}

export default ResumeOptions
