// import React from 'react'
// import { Outlet } from 'react-router-dom'
// import NavBar from '../components/NavBar'
// import { useSelector } from 'react-redux'
// import Login from './Login'
// import LoginLoading from '../components/loginLoading'

// const Layout = () => {


//   const { user, loading } = useSelector(state => state.auth)

//   if (loading) {
//     return <LoginLoading />
//   }

//   return (
//     <div>
//       {user ? (
//         <div className='min-h-screen bg-gray-50'>
//           <NavBar />
//           <Outlet />

//         </div>
//       ) : <Login />}
//     </div>
//   )
// }

// export default Layout

import React from 'react'
import { Outlet } from 'react-router-dom'
import NavBar from '../components/NavBar'
import { useSelector } from 'react-redux'
import Login from './Login'
import LoginLoading from '../components/LoginLoading'

const Layout = () => {

  const { user, loading } = useSelector(state => state.auth)

  if (loading) {
    return <LoginLoading />
  }

  return (
    <div>
      {user ? (
        <div className='min-h-screen bg-linear-to-br from-slate-50 via-blue-50 to-slate-100 '>

          {/* Navbar */}
          <NavBar />
          <Outlet />
          
        </div>
      ) : <Login />}
    </div>
  )
}

export default Layout