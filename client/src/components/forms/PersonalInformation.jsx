import { BriefcaseBusiness, GlobeIcon, Linkedin, Mail, MapPin, Phone, User } from 'lucide-react'
import React from 'react'

const PersonalInformation = ({ data, onChange, removeBg, setRemoveBg }) => {

    const handleChange = (field, value) => {
        onChange({ ...data, [field]: value })
    }

    const fields = [
        { key: "full_name", label: "Full Name", icon: User, type: "text", required: true, maxLength: 20 },
        { key: "email", label: "Email Address", icon: Mail, type: "email", required: true, maxLength: 22 },
        { key: "phone", label: "Phone_Number", icon: Phone, type: "tel", required: true, maxLength: 13 },
        { key: "location", label: "Location", icon: MapPin, type: "text", maxLength: 18 },
        { key: "profession", label: "Profession", icon: BriefcaseBusiness, type: "text", maxLength: 15 },
        { key: "linkedIn", label: "LinkedIn Profile", icon: Linkedin, type: "url", maxLength: 20 },
        { key: "website", label: "Personal Website", icon: GlobeIcon, type: "url", maxLength: 20 },
    ]

    return (
        <div>
            <h3 className="text-lg font-semibold text-gray-900">
                Personal Information
            </h3>
            <p className="text-sm text-gray-600">
                Get Started with the personal information
            </p>

            <div className="flex items-center gap-2">
                <label>
                    {data.image ? (
                        <img
                            src={typeof data.image === 'string' ? data.image : URL.createObjectURL(data.image)}
                            alt=""
                            className='size-16 rounded-full object-cover mt-5 ring ring-slate-300 hover:opacity-80'
                        />
                    ) : (
                        <div className='inline-flex items-center gap-2 mt-5 text-slate-600 hover:text-slate-700 cursor-pointer'>
                            <User className='size-10 p-2.5 border rounded-full' />
                            upload user image
                        </div>
                    )}
                    <input accept="image/jpeg, image/png" className="hidden" type="file" onChange={(e) => handleChange("image", e.target.files[0])} />
                </label>
                {typeof data.image === 'object' && (
                    <div className='flex flex-col gap-1 pl-4 text-sm'>
                        <p>Remove Background</p>
                        <label className='relative inline-flex items-center cursor-pointer text-gray-900 gap-3'>
                            <input
                                type="checkbox"
                                className='sr-only peer'
                                onChange={() => setRemoveBg(prev => !prev)}
                                checked={removeBg}
                            />
                            <div className='w-9 h-5 bg-slate-300 rounded-full peer peer-checked:bg-green-600 transition-colors duration-200'>
                            </div>
                            <span className='dot absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition-transform duration-200 ease-in-out peer-checked:translate-x-4'></span>
                        </label>
                    </div>
                )}
            </div>

            {fields.map((field) => {
                const Icon = field?.icon;
                return (
                    <div key={field.key} className='space-y-1 mt-5'>
                        <label className="flex items-center gap-2 text-sm font-medium text-gray-600">
                            <Icon className='size-4' />
                            {field.label}
                            {field.required && <span className='text-red-500 -ml-1'>*</span>}
                        </label>
                        <input
                            type={field.type}
                            className='mt-1 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring focus:ring-green-500 focus:border-green-500 placeholder:text-slate-500 outline-none transition-colors text-sm'
                            value={data[field.key] || ""}
                            onChange={(e) => handleChange(field.key, e.target.value)}
                            placeholder={`Enter your ${field.label.toLowerCase()}`}
                            required={field.required}
                            maxLength={field.maxLength}
                        />


                    </div>
                )
            })}
        </div>

    )
}

export default PersonalInformation