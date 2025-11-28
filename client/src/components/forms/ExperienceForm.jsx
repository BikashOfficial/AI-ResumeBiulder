import { BriefcaseBusiness, LoaderCircleIcon, Plus, Sparkles, Trash2 } from 'lucide-react'
import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import api from '../../config/api'

const ExperienceForm = ({ data, onChange }) => {

    const { token } = useSelector(state => state.auth)

    const [isGeneratingIdx, setIsGeneratingIdx] = useState(-1)

    const addExperience = () => {
        const newExperience = {
            company: "",
            position: "",
            start_date: "",
            end_date: "",
            description: "",
            is_current: false
        }
        onChange([...data, newExperience])
    }
    const removeExperience = (idx) => {
        const updated = data.filter((_, i) => i !== idx);
        onChange(updated)
    }
    const updateExperience = (idx, field, val) => {
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
        const experience = data[idx]
        const prompt = `just enhance this job description don't add the role in top - "${experience.description}" for the position of ${experience.position} at ${experience.company}`

        try {
            const { data } = await api.post('/api/ai/enhance-job-desc', { userContent: prompt }, { headers: { Authorization: token } })
            const enhancedText = (data.enhancedContent).trim()
            updateExperience(idx, "description",enhancedText)
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
                    <h3 className="flex items-center gap-2 text-lg font-semibold text-gray-900"> Professional Experience </h3>
                    <p className="text-sm text-gray-500">Add your job experience</p>
                </div>
                <button onClick={addExperience} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50'>
                    <Plus className='size-4' /> Add Experience
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <BriefcaseBusiness className='size-12 mx-auto mb-3 text-gray-300' />
                    <p>No work experience added yet.</p>
                    <p className='text-sm' >Click "Add Experience" to get started.</p>
                </div>
            ) : (
                <div className=' space-y-4'>
                    {
                        data.map((exp, idx) => (
                            <div key={idx} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                                <div className='flex justify-between items-start'>
                                    <h4>Experience #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeExperience(idx)}
                                        className='text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <Trash2 className=' size-4' />
                                    </button>
                                </div>

                                <div className='grid md:grid-cols-2 gap-3'>
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg'
                                        placeholder='Company name'
                                        value={exp.company || ""}
                                        onChange={(e) => updateExperience(idx, "company", e.target.value)}
                                        type="text"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg'
                                        placeholder='Job Title'
                                        value={exp.position || ""}
                                        onChange={(e) => updateExperience(idx, "position", e.target.value)}
                                        type="text"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg'
                                        value={exp.start_date || ""}
                                        onChange={(e) => updateExperience(idx, "start_date", e.target.value)}
                                        type="month"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg disabled:bg-gray-100'
                                        value={exp.end_date || ""}
                                        onChange={(e) => updateExperience(idx, "end_date", e.target.value)}
                                        type="month"
                                        disabled={exp.is_current}
                                    />
                                </div>

                                <label className='flex items-center gap-2'>
                                    <input
                                        type="checkbox"
                                        checked={exp.is_current}
                                        onChange={(e) => updateExperience(idx, "is_current", e.target.checked ? true : false)}
                                        className='rounded border-gray-300 text-green-600 focus:ring-green-500'
                                    />
                                    <span className='text-sm text-gray-700'>Currently Working Here</span>
                                </label>

                                <div className=' space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <label className='text-sm font-medium text-gray-700'>
                                            Job Description
                                        </label>
                                        <button 
                                        disabled={isGeneratingIdx === idx || !exp.position || !exp.company} 
                                        onClick={() => generateDescription(idx)} 
                                        className='flex items-center gap-2 px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded hover:bg-purple-200 transition-colors disabled:opacity-50'>
                                            {isGeneratingIdx === idx ? (<LoaderCircleIcon className='animate-spin size-4' />) : (
                                                <Sparkles className='size-4' />
                                            )}
                                            {isGeneratingIdx === idx ? "Enhancing..." : "AI Enhance"}
                                        </button>
                                    </div>
                                    <textarea
                                        onChange={(e) => updateExperience(idx, "description", e.target.value)}
                                        value={exp.description || ""}
                                        rows={4}
                                        className='w-full text-sm px-3 py-2 rounded-lg resize-none placeholder:text-gray-500'
                                        placeholder='Describe your key responsibilities and experience...'
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

export default ExperienceForm