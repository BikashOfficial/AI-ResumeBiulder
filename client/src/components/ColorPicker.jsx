import { Check, Palette } from 'lucide-react'
import React, { useState } from 'react'

const ColorPicker = ({ selectedColor, onChange }) => {

    const colors = [
        { name: "Blue", value: "#3B82F6" },
        { name: "Red", value: "#EF4444" },
        { name: "Green", value: "#10B981" },
        { name: "Yellow", value: "#F59E0B" },
        { name: "Purple", value: "#8B5CF6" },
        { name: "Pink", value: "#EC4899" },
        { name: "Gray", value: "#6B7280" },
        { name: "Orange", value: "#F97316" },
        { name: "Teal", value: "#14B8A6" },
        { name: "Indigo", value: "#6366F1" },
    ]

    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className='relative'>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className='flex items-center gap-1 text-sm text-blue-600 bg-linear-to-br from-green-200 via-red-100 to-blue-200 ring-blue-300 hover:ring transition-all px-3 py-2 rounded-lg'
            >
                <Palette size={14} /> <span className='max-sm:hidden'>Colors</span>
            </button>

            {
                isOpen && (
                    <div className=' grid grid-cols-4 z-40 w-60 gap-2 absolute top-full left-0 right-0 p-3 mt-2 bg-white rounded-md border-gray-200 shadow-sm'>
                        {colors.map((color) => (
                            <div
                                key={color.value}
                                className='relative cursor-pointer group flex flex-col'
                                onClick={() => { onChange(color.value); setIsOpen(false) }}
                            >
                                <div
                                    className='size-12 rounded-full border-2 border-transparent group-hover:border-black/25 cursor-pointer transition-colors'
                                    style={{ backgroundColor: color.value }}
                                >

                                </div>
                                {selectedColor === color.value && (
                                    <div
                                        className='absolute top-0 left-0 right-0 bottom-4.5 flex items-center justify-center'
                                    >
                                        <Check className='size-5 text-white' />
                                    </div>
                                )}
                                <p className='text-xs text-center mt-1 text-gray-600'>{color.name}</p>
                            </div>
                        ))}
                    </div>
                )
            }

        </div>
    )
}

export default ColorPicker