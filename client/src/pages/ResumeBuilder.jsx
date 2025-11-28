import React, { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { dummyResumeData } from '../assets/assets'
import { ArrowLeft, Briefcase, ChevronLeft, ChevronRight, Download, EyeClosed, EyeIcon, FileText, FolderIcon, GraduationCap, Save, Share2Icon, Sparkles, User } from 'lucide-react'
import PersonalInformation from '../components/forms/PersonalInformation'
import ResumePreview from '../components/ResumePreview'
import TemplateSelector from '../components/TemplateSelector'
import ColorPicker from '../components/ColorPicker'
import ProfessionalSummaryForm from '../components/forms/ProfessionalSummaryForm'
import ExperienceForm from '../components/forms/ExperienceForm'
import EducationForm from '../components/forms/EducationForm'
import ProjectForm from '../components/forms/ProjectForm'
import SkillsForm from '../components/forms/SkillsForm'
import { useSelector } from 'react-redux'
import api from '../config/api'
import toast from 'react-hot-toast'

const ResumeBuilder = () => {

  const { resumeId } = useParams()
  const { token } = useSelector(state => state.auth)

  const [resumeData, setResumeData] = useState({
    _id: '',
    title: "",
    personal_info: {},
    professional_summary: "",
    experience: [],
    education: [],
    project: [],
    skills: [],
    template: "classic",
    accent_color: "#3B82F6",
    public: false
  })

  const loadExistingResume = async () => {
    try {
      const { data } = await api.get(`/api/resumes/get/${resumeId}`, { headers: { Authorization: token } })
      if (data.resume) {
        setResumeData(data.resume)
        document.title = data.resume.title
      }
    } catch (error) {
      console.log(error.message)
    }
  }

  const [activeSectionIndex, setActiveSectionIndex] = useState(0)
  const [removeBg, setRemoveBg] = useState(false)

  const sections = [
    { id: "persolnal_info", name: "Persolnal Info", icon: User },
    { id: "summary", name: "Summary", icon: FileText },
    { id: "experience", name: "Experience", icon: Briefcase },
    { id: "education", name: "Education", icon: GraduationCap },
    { id: "project", name: "Project", icon: FolderIcon },
    { id: "skills", name: "Skills", icon: Sparkles },
  ]

  const activeSection = sections[activeSectionIndex]

  useEffect(() => {
    loadExistingResume()
  }, [])

  const changeResumeVisibility = async () => {

    try {
      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify({ public: !resumeData.public }))

      const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
      setResumeData({ ...resumeData, public: !resumeData.public })
      const toastMessage = resumeData.public === true ? 'private' : 'public'
      toast.success(`Resume is now ${toastMessage}`)
    } catch (error) {
      console.log(error.message)
    }
  }

  const saveResume = async () => {
    try {
      let updatedResumeData = structuredClone(resumeData)

      //remove image from updated data
      if (typeof resumeData.personal_info.image === 'object') {
        delete updatedResumeData.personal_info.image
      }

      const formData = new FormData()
      formData.append('resumeId', resumeId)
      formData.append('resumeData', JSON.stringify(updatedResumeData))
      removeBg && formData.append('removeBg', 'yes')
      typeof resumeData.personal_info.image === 'object' && formData.append('image', resumeData.personal_info.image)

      const { data } = await api.put('/api/resumes/update', formData, { headers: { Authorization: token } })
      setResumeData(data.resume)
      toast.success(data.message)
    } catch (error) {
      console.log("Erroe while saving : ", error.message)
    }
  }

  const handleShare = () => {
    const frontendUrl = window.location.href.split('/app/')[0]
    const resumeUrl = frontendUrl + '/view/' + resumeId

    if (navigator.share) {
      navigator.share({ url: resumeUrl, text: "My Resume", })
    } else {
      alert('Share not supported on this browser')
    }
  }

  const downloadResume = () => {
    window.print();
  }

  return (
    <div>

      {/* options */}
      <div className="max-w-7xl mx-auto px-4 py-4 md:py-6 flex items-center justify-between gap-4">

        {/* Back button */}
        <Link
          to="/app"
          className="inline-flex gap-2 items-center px-4 py-2.5 rounded-lg bg-white/50 backdrop-blur-sm 
               border border-white/30 text-slate-600 hover:text-slate-800 hover:bg-white/70 
               transition-all duration-300 hover:shadow-md active:scale-95 group"
        >
          <ArrowLeft className="size-5 md:size-4 group-hover:-translate-x-1 transition-transform" />
          <p className="hidden md:block font-medium">Back</p>
        </Link>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 md:gap-3 flex-wrap justify-end">

          {/* Save */}
          <button
            onClick={() => toast.promise(saveResume, { loading: "Saving..." })}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg group 
                 overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #4b5563, #1f2937)",
              boxShadow: "0 4px 15px rgba(99, 102, 241, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div className="relative z-10 flex items-center gap-2">
              <Save className="size-5 md:size-4 text-white" />
              <p className="hidden md:block text-white font-semibold text-sm">Save</p>
            </div>
          </button>

          {/* Share */}
          {resumeData.public && (
            <button
              onClick={handleShare}
              className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg group 
                   overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-lg"
              style={{
                background: "linear-gradient(135deg, #60a5fa, #2563eb)",
                boxShadow: "0 4px 15px rgba(59, 130, 246, 0.3)",
              }}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
                }}
              />
              <div className="relative z-10 flex items-center gap-2">
                <Share2Icon className="size-5 md:size-4 text-white" />
                <p className="hidden md:block text-white font-semibold text-sm">Share</p>
              </div>
            </button>
          )}

          {/* Visibility Toggle */}
          <button
            onClick={changeResumeVisibility}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg group 
                 overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-lg"
            style={{
              background: resumeData.public
                ? "linear-gradient(135deg, #a855f7, #7c3aed)"
                : "linear-gradient(135deg, #64748b, #475569)",
              boxShadow: resumeData.public
                ? "0 4px 15px rgba(168, 85, 247, 0.3)"
                : "0 4px 15px rgba(100, 116, 139, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div className="relative z-10 flex items-center gap-2">
              {resumeData.public ? (
                <>
                  <EyeIcon className="size-5 md:size-4 text-white" />
                  <p className="hidden md:block text-white font-semibold text-sm">Public</p>
                </>
              ) : (
                <>
                  <EyeClosed className="size-5 md:size-4 text-white" />
                  <p className="hidden md:block text-white font-semibold text-sm">Private</p>
                </>
              )}
            </div>
          </button>

          {/* Download */}
          <button
            onClick={downloadResume}
            className="relative flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-lg group 
                 overflow-hidden transition-all duration-300 active:scale-95 hover:shadow-lg"
            style={{
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              boxShadow: "0 4px 15px rgba(34, 197, 94, 0.3)",
            }}
          >
            <div
              className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{
                background: "linear-gradient(135deg, rgba(255,255,255,0.2), transparent)",
              }}
            />
            <div className="relative z-10 flex items-center gap-2">
              <Download className="size-5 md:size-4 text-white" />
              <p className="hidden md:block text-white font-semibold text-sm">Download</p>
            </div>
          </button>

        </div>
      </div>

      <div className='max-w-7xl mx-auto px-2 md:px-4 pb-8'>
        <div className='grid lg:grid-cols-12 gap-8'>
          {/* left panel */}
          <div className='relative lg:col-span-5 md:col-span-3 rounded-lg overflow-hidden'>
            <div className='bg-white rounded-lg shadow-sm border border-gray-200 p-6 pt-1'>
              {/* progessbar using active section index */}
              <hr className='absolute top-0 left-0 right-0 border-2 border-gray-200' />
              <hr className='absolute top-0 left-0 right-0 h-1 bg-linear-to-r from-green-500 to-green-600 border-none transition-all duration-2000'
                style={{ width: `${activeSectionIndex * 100 / (sections.length - 1)}%` }}
              />

              {/* section navigation */}
              <div className='flex justify-between items-center mb-6 border-b border-gray-300 py-1.5 md:py-2'>

                <div className='flex items-center gap-2'>
                  <TemplateSelector selectedTemplate={resumeData.template} onChange={(template) => setResumeData(prev => ({ ...prev, template }))} />
                  <ColorPicker selectedColor={resumeData.accent_color} onChange={(color) => setResumeData(prev => ({ ...prev, accent_color: color }))} />
                </div>

                <div className='flex items-center gap-2'>
                  {activeSectionIndex > 0 && (
                    <button
                      onClick={() => setActiveSectionIndex((prevIdx) => Math.max(prevIdx - 1, 0))}
                      className='flex items-center gap-1 p-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 lg:bg-white bg-gray-100/70 transition-all'
                      disabled={activeSectionIndex === 0}
                    >
                      <ChevronLeft className='size-6' />Previous
                    </button>
                  )}

                  <button
                    onClick={() => setActiveSectionIndex((prevIdx) => Math.min(prevIdx + 1, sections.length - 1))}
                    className={`flex items-center gap-1 p-1.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-gray-50 transition-all lg:bg-white bg-gray-100/70 ${activeSectionIndex === sections.length - 1 && 'opacity-50'}`}
                    disabled={activeSectionIndex === sections.length - 1}
                  >
                    Next<ChevronRight className='size-6' />
                  </button>
                </div>
              </div>

              {/* form content */}
              <div className=' space-y-6'>
                {activeSection.id === 'persolnal_info' && (

                  <PersonalInformation
                    data={resumeData.personal_info}
                    removeBg={removeBg}
                    setRemoveBg={setRemoveBg}
                    onChange={(data) => setResumeData(prev => ({ ...prev, personal_info: data }))}
                  />

                )}
                {activeSection.id === 'summary' && (

                  <ProfessionalSummaryForm
                    data={resumeData.professional_summary}
                    setResumeData={setResumeData}
                    onChange={(data) => setResumeData(prev => ({ ...prev, professional_summary: data }))}
                  />

                )}
                {activeSection.id === 'experience' && (

                  <ExperienceForm
                    data={resumeData.experience}
                    onChange={(data) => setResumeData(prev => ({ ...prev, experience: data }))}
                  />

                )}
                {activeSection.id === 'education' && (

                  <EducationForm
                    data={resumeData.education}
                    onChange={(data) => setResumeData(prev => ({ ...prev, education: data }))}
                  />

                )}
                {activeSection.id === 'project' && (

                  <ProjectForm
                    data={resumeData.project}
                    onChange={(data) => setResumeData(prev => ({ ...prev, project: data }))}
                  />

                )}
                {activeSection.id === 'skills' && (

                  <SkillsForm
                    data={resumeData.skills}
                    onChange={(data) => setResumeData(prev => ({ ...prev, skills: data }))}
                  />

                )}
              </div>
            </div>
          </div>

          {/* right panel */}
          <div className='lg:col-span-7 max-lg:mt-6 sm:h-12'>
            <ResumePreview
              data={resumeData}
              template={resumeData.template}
              accentColor={resumeData.accent_color}
            />
          </div>
          <div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder