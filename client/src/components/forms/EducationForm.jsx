import React from 'react'
import { BriefcaseBusiness, GraduationCap, Plus, Sparkles, Trash2 } from 'lucide-react'

const EducationForm = ({ data, onChange }) => {

    const addEduction = () => {
        const newEduction = {
            institution: "",
            degree: "",
            field: "",
            graduation_date: "",
            gpa: "",
        }
        onChange([...data, newEduction])
    }
    const removeEduction = (idx) => {
        const updated = data.filter((_, i) => i !== idx);
        onChange(updated)
    }
    const updateEduction = (idx, field, val) => {
        const updated = [...data]
        updated[idx] = { ...updated[idx], [field]: val }
        onChange(updated)
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900"> Education </h3>
                    <p class="text-sm text-gray-500">Add your education details</p>
                </div>
                <button onClick={addEduction} className='flex items-center gap-2 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50'>
                    <Plus className='size-4' /> Add Education
                </button>
            </div>

            {data.length === 0 ? (
                <div className='text-center py-8 text-gray-500'>
                    <GraduationCap className='size-12 mx-auto mb-3 text-gray-300' />
                    <p>No education added yet.</p>
                    <p className='text-sm' >Click "Add Education" to get started.</p>
                </div>
            ) : (
                <div className=' space-y-4'>
                    {
                        data.map((edu, idx) => (
                            <div key={idx} className='p-4 border border-gray-200 rounded-lg space-y-3'>
                                <div className='flex justify-between items-start'>
                                    <h4>Eduction #{idx + 1}</h4>
                                    <button
                                        onClick={() => removeEduction(idx)}
                                        className='text-red-500 hover:text-red-700 transition-colors'
                                    >
                                        <Trash2 className=' size-4' />
                                    </button>
                                </div>

                                <div className='grid md:grid-cols-2 gap-3'>
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                                        placeholder='Institution name'
                                        value={edu.institution || ""}
                                        onChange={(e) => updateEduction(idx, "institution", e.target.value)}
                                        type="text"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                                        placeholder="Degree (e.g., Bachelor's, Master's)"
                                        value={edu.degree || ""}
                                        onChange={(e) => updateEduction(idx, "degree", e.target.value)}
                                        type="text"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                                        placeholder="Field of Study"
                                        value={edu.field || ""}
                                        onChange={(e) => updateEduction(idx, "field", e.target.value)}
                                        type="text"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg '
                                        value={edu.graduation_date || ""}
                                        onChange={(e) => updateEduction(idx, "graduation_date", e.target.value)}
                                        type="month"
                                    />
                                    <input
                                        className='px-3 py-2 text-sm rounded-lg placeholder:text-gray-500'
                                        placeholder="GPA (optional)"
                                        value={edu.gpa || ""}
                                        onChange={(e) => updateEduction(idx, "gpa", e.target.value)}
                                        type="text"
                                    />

                                </div>


                            </div>
                        ))
                    }
                </div>
            )}
        </div>
    )
}

export default EducationForm