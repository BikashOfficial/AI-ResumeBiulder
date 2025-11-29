import { LogOut } from 'lucide-react'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../app/features/authSlice'

const NavBar = () => {

  const { user } = useSelector(state => state.auth)
  const dispatch = useDispatch()

  const navigate = useNavigate()

  const [showLogout, setShowLogout] = useState(false);

  return (
    <div className='bg-white shadow-lg sticky top-0 z-50'>

      {showLogout && (
        <div
          onClick={() => setShowLogout(false)}
          className="fixed inset-0 bg-black/40 backdrop-blur-xl z-999 flex items-center justify-center p-4"
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
            {/* Shine Effect */}
            <div className="absolute inset-0 pointer-events-none before:absolute before:inset-0 before:bg-liner-to-r before:from-transparent before:via-white/40 before:to-transparent before:translate-x-[-120%] before:rotate-6 hover:before:animate-[shine_1.5s_ease-out]" />

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
              <h2 className="text-xl font-semibold text-slate-900">
                Logout?
              </h2>
              <p className="text-slate-600 text-sm mt-1">
                You will be redirected to homepage.
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLogout(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-200/60 hover:bg-slate-300 text-slate-800 transition font-medium"
              >
                Cancel
              </button>

              <button
                onClick={() => {
                  navigate('/');
                  dispatch(logout());
                  setShowLogout(false);
                }}
                className="
            flex-1 py-2.5 rounded-xl text-white font-medium
            bg-linear-to-r from-red-500 to-red-600
            hover:from-red-600 hover:to-red-700
            shadow-lg shadow-red-500/30 transition
          "
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <nav className='flex items-center justify-between max-w-7xl mx-auto px-4 py-3 md:py-4 transition-all'>

        {/* Logo */}
        <Link to='/' className='group transition-transform duration-300 hover:scale-105'>
          <img src="/logo.svg" alt="Logo" className='h-12 w-auto' />
        </Link>

        {/* Center greeting */}
        <div className='flex items-center gap-6'>
          <p className='max-sm:hidden text-black/70 text-lg font-medium'>
            Hi, <span className='text-black/80 font-medium'>{user?.name}</span>
          </p>

          {/* Logout button */}
          <button
            //onClick={logoutUser}
            onClick={() => setShowLogout(true)}
            className='relative flex items-center gap-2 px-5 md:px-7 py-2.5 rounded-full group overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-lg'
            style={{
              background: `linear-gradient(135deg, #ef4444, #dc2626)`,
              boxShadow: `0 4px 15px rgba(239, 68, 68, 0.3)`,
            }}>

            {/* Hover overlay */}
            <div
              className='absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              style={{
                background: `linear-gradient(135deg, rgba(255,255,255,0.1), transparent)`,
              }}
            />

            {/* Content */}
            <div className='relative z-10 flex items-center gap-2'>
              <LogOut size={20} className='text-white' />
              <span className='hidden md:block text-white font-semibold'>Logout</span>
            </div>
          </button>
        </div>

      </nav>
    </div>
  )
}

export default NavBar