import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDispatch, useSelector } from 'react-redux'
import api from '../config/api'
import toast from 'react-hot-toast'
import pdfToText from 'react-pdftotext'
import ResumeOptions from '../components/dashboard/ResumeOptions'
import ResumeGrid from '../components/dashboard/ResumeGrid'
import ResumeModals from '../components/dashboard/ResumeModals'
import {
  setAllResumes,
  addResume,
  updateResumeInList,
  removeResumeFromList,
} from '../app/features/resumeSlice'

const Dashboard = () => {

  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { user } = useSelector(state => state.auth)
  const { allResumes } = useSelector(state => state.resume)

  const colors = [
    '#9333ea', '#d97706', '#dc2626', '#0284c7', '#f59e0b', '#3b82f6', '#2563eb', '#4ade80', '#10b981', '#e11d48'
  ]

  const [showCreateResume, setShowCreateResume] = useState(false)
  const [showUploadResume, setShowUploadResume] = useState(false)
  const [title, setTitle] = useState('')
  const [resume, setResume] = useState(null)
  const [editResumeId, setEditResumeId] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [deleteId, setDeleteId] = useState('')

  const loadAllResumes = async () => {
    try {
      const { data } = await api.get('/api/users/resumes')
      dispatch(setAllResumes(Array.isArray(data?.resume) ? data.resume : []))
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const createResume = async (e) => {
    try {
      e.preventDefault()
      const { data } = await api.post('/api/resumes/create', { title })
      dispatch(addResume(data.resume))
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

      const { data } = await api.post('/api/ai/upload-resume', { resumeText, title })
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
      const { data } = await api.put('/api/resumes/update', { resumeId: editResumeId, resumeData: { title } })
      dispatch(updateResumeInList({ id: editResumeId, title }))
      setTitle('')
      setEditResumeId('')
      toast.success(data.message)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  const deleteResumeHandler = async (deleteId) => {
    try {
      const { data } = await api.delete(`/api/resumes/delete/${deleteId}`)
      dispatch(removeResumeFromList(deleteId))
      toast.success(data.message)
      setDeleteId("")
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }
  }

  useEffect(() => {
    if (user) {
      loadAllResumes()
    }
  }, [user])

  return (
    <div>
      <div className='max-w-7xl mx-auto px-4 py-8'>
        <p className='text-2xl font-medium mb-6 bg-linear-to-r from-slate-600 to-slate-700 bg-clip-text text-transparent sm:hidden'>
          {"Wellcome, " + user.name}
        </p>

        {/* Options Section */}
        <ResumeOptions
          onCreateClick={() => setShowCreateResume(true)}
          onUploadClick={() => setShowUploadResume(true)}
        />

        <hr className='border-slate-300 my-6 sm:w-[305px] shadow-2xl' />

        {/* Resume List Heading */}
        <div className='mb-6'>
          <p className='text-2xl font-semibold text-slate-800'>My Resumes</p>
          <p className='text-slate-600 text-sm mt-1'>
            {allResumes.length} resume{allResumes.length !== 1 ? 's' : ''}
          </p>
        </div>

        {/* Resumes Grid */}
        <ResumeGrid
          allResumes={allResumes}
          colors={colors}
          onEditClick={(id, resumeTitle) => {
            setEditResumeId(id)
            setTitle(resumeTitle)
          }}
          onDeleteClick={(id) => setDeleteId(id)}
        />

        {/* Modals */}
        <ResumeModals
          showCreateResume={showCreateResume}
          showUploadResume={showUploadResume}
          editResumeId={editResumeId}
          deleteId={deleteId}
          title={title}
          resume={resume}
          isLoading={isLoading}
          onSetShowCreateResume={setShowCreateResume}
          onSetShowUploadResume={setShowUploadResume}
          onSetEditResumeId={setEditResumeId}
          onSetDeleteId={setDeleteId}
          onSetTitle={setTitle}
          onSetResume={setResume}
          onCreateResume={createResume}
          onUploadResume={uploadResume}
          onEditTitle={editTitle}
          onDeleteResume={deleteResumeHandler}
        />
      </div>
    </div>
  )
}

export default Dashboard