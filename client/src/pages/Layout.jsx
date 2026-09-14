
import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'

const Layout = () => {

  

  return (
    <div>
      
        <div className='min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 '>

          {/* Navbar */} 
          <NavBar />
          <Outlet />
          
        </div>
      
    </div>
  )
}

export default Layout