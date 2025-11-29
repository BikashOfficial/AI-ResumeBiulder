import { EditIcon, FilePenLineIcon, Trash2 } from 'lucide-react'
import React from 'react'
import { useNavigate } from 'react-router-dom'

const ResumeGrid = ({ allResumes, colors, onEditClick, onDeleteClick }) => {
  const navigate = useNavigate()

  return (
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
                onClick={() => onEditClick(resume?._id, resume?.title)}
                className='p-3 rounded-lg bg-white/20 hover:bg-white/30 transition-all duration-200'
              >
                <EditIcon size={16} className='text-white' />
              </button>
              <button
                onClick={() => onDeleteClick(resume._id)}
                className='p-3 rounded-lg bg-white/20 hover:bg-red-500/30 transition-all duration-200'
              >
                <Trash2 size={16} className='text-white' />
              </button>
            </div>
          </button>
        )
      })}
    </div>
  )
}

export default ResumeGrid
