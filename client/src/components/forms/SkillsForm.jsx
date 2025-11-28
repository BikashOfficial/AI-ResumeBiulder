import { Plus, SparkleIcon, X } from 'lucide-react'
import React, { useState } from 'react'

const SkillsForm = ({ data, onChange }) => {


    const [newSkill, setnewSkill] = useState("")

    const addSkill = () => {
        if (newSkill.trim() && !data.includes(newSkill.trim())) {
            onChange([...data, newSkill.trim()])
            setnewSkill("")
        }
    }

    const removeSkill = (indexToRemove) => {
        onChange(data.filter((_, idx) => idx !== indexToRemove))
    }

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault()
            addSkill();
        }
    }

    return (
        <div className='space-y-6'>
            <div className='flex items-center justify-between'>
                <div>
                    <h3 class="flex items-center gap-2 text-lg font-semibold text-gray-900"> Skills </h3>
                    <p class="text-sm text-gray-500">Add your technical and soft skills</p>
                </div>

            </div>

            <div className='flex gap-2 '>
                <input
                    placeholder="Enter a skill (e.g., JavaScript, Project Management)"
                    className=" placeholder:text-gray-500 flex-1 px-3 py-2 text-sm"
                    type="text"
                    value={newSkill}
                    onChange={(e) => setnewSkill(e.target.value)}
                    onKeyDown={handleKeyPress}
                ></input>
                <button
                    onClick={addSkill}
                    disabled={!newSkill.trim()}
                    className='flex items-center gap-2 px-4 py-2 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
                >
                    <Plus className='size-4' />
                    Add</button>
            </div>

            {
                data.length > 0 ? (
                    <div className='flex flex-wrap gap-2'>
                        {data.map((skill, idx) => (
                            <span
                                key={idx}
                                className='flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm'
                            >
                                {skill}
                                <button
                                    className='ml-1 hover:bg-green-200 rounded-full p-0.5 transition-colors'
                                    onClick={() => removeSkill(idx)}
                                >
                                    <X className='size-4' />
                                </button>
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className='text-center py-8 text-gray-500'>
                        <SparkleIcon className='size-12 mx-auto mb-3 text-gray-300' />
                        <p>No skills added yet.</p>
                        <p class="text-sm">Add your technical and soft skills above.</p>
                    </div>

                )
            }
            <div className="bg-yellow-50 p-3 rounded-lg">
                <p
                    class="text-sm text-yellow-800"
                >
                    <strong>Tip:</strong> Add 8-12 relevant skills. Include both technical skills (programming languages, tools) and soft skills (leadership, communication).
                </p>
            </div>
        </div>
    )
}

export default SkillsForm