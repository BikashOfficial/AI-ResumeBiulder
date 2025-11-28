import React, { useState } from 'react'
import { FolderIcon, LoaderCircleIcon, Plus, Sparkles, Trash2 } from 'lucide-react'
import { useSelector } from 'react-redux'
import api from '../../config/api'

const ProjectForm = ({ data, onChange }) => {

  const { token } = useSelector(state => state.auth)

  const [isGeneratingIdx, setIsGeneratingIdx] = useState(-1)

  const addProject = () => {
    const newProject = {
      name: "",
      type: "",
      description: ""
    }
    onChange([...data, newProject])
  }
  const removeProject = (idx) => {
    const updated = data.filter((_, i) => i !== idx);
    onChange(updated)
  }
  const updateProject = (idx, field, val) => {
    const updated = [...data]
    updated[idx] = { ...updated[idx], [field]: val }
    onChange(updated)
  }

  const generateDescription = async (idx) => {
    if (!data[idx].description || data[idx].description.trim() === '') {
      console.error('Please write a job description first before enhancing')
      return
    }
    setIsGeneratingIdx(idx)
    const project = data[idx]
    const prompt = `just enhance this project description don't add the project name in top - "${project.description}" the name of project is ${project.name}`

    try {
      const { data } = await api.post('/api/ai/enhance-project-desc', { userContent: prompt }, { headers: { Authorization: token } })
      const enhancedText = (data.enhancedContent).trim()
      updateProject(idx, "description", enhancedText)
    } catch (error) {
      toast.error(error?.response?.data?.message || error.message)
    } finally {
      setIsGeneratingIdx(-1)
    }
  }

  return (
    <div className='space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900"> Projects </h3>
          <p class="text-sm text-gray-500">Add your projects</p>
        </div>
        <button onClick={addProject} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50'>
          <Plus className='size-4' /> Add Projects
        </button>
      </div>

      {data.length === 0 ? (
        <div className='text-center py-8 text-gray-500'>
          <FolderIcon className='size-12 mx-auto mb-3 text-gray-300' />
          <p>No projects added yet.</p>
          <p className='text-sm' >Click "Add Projects" to get started.</p>
        </div>
      ) : (
        <div className=' space-y-4'>
          {
            data.map((pro, idx) => (
              <div key={idx} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                <div className='flex justify-between items-start'>
                  <h4>Project #{idx + 1}</h4>
                  <button
                    onClick={() => removeProject(idx)}
                    className='text-red-500 hover:text-red-700 transition-colors'
                  >
                    <Trash2 className=' size-4' />
                  </button>
                </div>

                <div className='grid  gap-3'>
                  <input
                    className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                    placeholder='Project Name'
                    value={pro.name || ""}
                    onChange={(e) => updateProject(idx, "name", e.target.value)}
                    type="text"
                  />
                  <input
                    className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                    placeholder="Project Type"
                    value={pro.type || ""}
                    onChange={(e) => updateProject(idx, "type", e.target.value)}
                    type="text"
                  />


                </div>

                <div className=' space-y-2'>
                  <div className='flex items-center justify-between'>
                    <label className='text-sm font-medium text-gray-700'>
                      Project Description
                    </label>
                    <button
                      disabled={isGeneratingIdx === idx}
                      onClick={() => generateDescription(idx)}
                      className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                      {isGeneratingIdx === idx ? (<LoaderCircleIcon className='animate-spin size-4' />) : (
                        <Sparkles className='size-4' />
                      )}
                      {isGeneratingIdx === idx ? "Enhancing..." : "AI Enhance"}
                    </button>
                  </div>
                  <textarea
                    onChange={(e) => updateProject(idx, "description", e.target.value)}
                    value={pro.description || ""}
                    rows={4}
                    className='w-full text-sm px-3 py-2 rounded-lg resize-none placeholder:text-gray-500'
                    placeholder='Describe your project...'
                  ></textarea>
                </div>


              </div>
            ))
          }
        </div>
      )}
    </div>
  )
}

export default ProjectForm