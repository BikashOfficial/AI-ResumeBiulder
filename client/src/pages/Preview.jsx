import React, { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import LoadingScreen from '../components/LoadingScreen'
import ResumePreview from '../components/ResumePreview'
import { ArrowLeft, Download, Home } from 'lucide-react'
import ResumeNotFound from '../components/ResumeNotFound'
import api from '../config/api'
import toast from 'react-hot-toast'

const Preview = ({ }) => {

  const navigate = useNavigate()

  const { resumeId } = useParams()

  const [isLoading, setIsLoading] = useState(true)

  const [resumeData, setResumeData] = useState(null)

  const loadResume = async () => {
    // setResumeData(dummyResumeData.find(resume => resume._id === resumeId || null))
    // setIsLoading(false)
    try {
      const { data } = await api.get(`/api/resumes/public/${resumeId}`)
      setResumeData(data.resume)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    }finally{
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setTimeout(() => {
      loadResume()
    }, 3000)

  }, [resumeData])

  const downloadResume = () => {
    window.print();
  }

  return resumeData ? (
    <div className='bg-slate-100'>
      <div className='max-w-3xl mx-auto py-10'>

        <div className='px-4 -mt-5 flex items-center justify-between'>

          <div className='-mt-6'>
            <Link to='/'>
              <img src="/logo.svg" alt="" className='h-11 w-auto m/pb-6' />
            </Link>
          </div>

          <button
            onClick={downloadResume}
            class="flex items-center mb-5 gap-1 bg-linear-to-br from-green-100 to-green-200 ring-green-300 text-green-600 ring hover:ring-green-400 transition-all rounded-lg shadow-md px-3.5 md:px-4 py-1.5 md:py-2 text-sm"
          >
            <Download className='size-5  md:size-4 ' />
            <p>Download</p>
          </button>


        </div>

        <ResumePreview data={resumeData} accentColor={resumeData.accent_color} template={resumeData.template} classes='py-4 bg-white' />
      </div>

    </div>
  ) : (
    <div>
      {
        isLoading ? <LoadingScreen /> :
          <div className=' '>

            <ResumeNotFound />

          </div>
      }
    </div>
  )
}

export default Preview