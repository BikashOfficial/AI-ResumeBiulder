import React, { useEffect } from 'react'
import { Route, Routes,Navigate } from 'react-router-dom'
import Home from './pages/Home'
import Layout from './pages/Layout'
import Dashboard from './pages/Dashboard'
import ResumeBuilder from './pages/ResumeBuilder'
import Preview from './pages/Preview'
import { useDispatch, useSelector } from 'react-redux'
import api from './config/api.js'
import { login, setLoading } from './app/features/authSlice.js'
import { Toaster } from 'react-hot-toast'
import ATSScoreChecker from './pages/ATSScoreChecker.jsx'
import Login from './pages/Login.jsx'
import LoginLoading from './components/LoginLoading.jsx'
// import {Routes, Route, } from "react-router-dom";

const App = () => {

  const dispatch = useDispatch()
  const { user, loading } = useSelector(state => state.auth)

  const getUserData = async () => {
    try {
      const { data } = await api.get('/api/me')
      if (data?.user) {
        dispatch(login({ user: data.user }))
      }
    } catch (error) {
      console.log(error.message)
    } finally {
      dispatch(setLoading(false))
    }
  }

  useEffect(() => {
    getUserData()
  }, [])

  return (
    <>
      <Toaster />

      <Routes>

        {/* Home page */}
        <Route
          path="/"
          element={
            loading ? (
              <LoginLoading />
            ) : user ? (
              <Navigate to="/app" replace />
            ) : (
              <Home />
            )
          }
        />

        {/* App */}
        <Route
          path="/app"
          element={
            loading ? (
              <LoginLoading />
            ) : user ? (
              <Layout />
            ) : (
              <Login />
            )
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="builder/:resumeId" element={<ResumeBuilder />} />
          <Route path="ats" element={<ATSScoreChecker />} />
        </Route>

        {/* Resume preview */}
        <Route path="/view/:resumeId" element={<Preview />} />

      </Routes>
    </>
  )
}

export default App