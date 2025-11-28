import { LockIcon, Mail, User } from 'lucide-react'
import React from 'react'
import api from '../config/api'
import { useDispatch } from 'react-redux'
import { login } from '../app/features/authSlice'
import toast from 'react-hot-toast'
const Login = () => {

  const dispatch = useDispatch()

  const query = new URLSearchParams(window.location.search)
  const urlState = query.get('state')

  const [state, setState] = React.useState(urlState || "login")

  const [formData, setFormData] = React.useState({
    name: '',
    email: '',
    password: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const { data } = await api.post(`/api/users/${state}`, formData)
      dispatch(login(data))
      localStorage.setItem('token', data.token)
      toast.success(data.message)
    } catch (error) {
      toast.success(error?.response?.data?.message || error.message)
    }

  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  return (
    <div className='flex flex-col items-center justify-center min-h-screen bg-gray-50 px-2'>
      <div className='absolute top-20 flex items-center gap-3'>
        <img className='h-16 opacity-30 mt-4' src="/favicon.ico" alt="" />
        <img className=' h-20 opacity-30' src="/logo.svg" alt="" />
      </div>
      <form onSubmit={handleSubmit} className="sm:w-[500px] w-full text-center border border-gray-300/60 rounded-2xl px-8 bg-white">
        <h1 className="text-gray-900 text-3xl mt-10 font-medium">{state === "login" ? "Login" : "Sign up"}</h1>
        <p className="text-gray-500 text-sm mt-2">Please {state} to continue</p>
        {state !== "login" && (
          <div className="flex items-center mt-6 w-full hover:border-green-500 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
            <User size={16} className='text-gray-500' />
            <input type="text" name="name" placeholder="Name" className="placeholder:text-gray-500 border-none outline-none ring-0" value={formData.name} onChange={handleChange} required />
          </div>
        )}
        <div className="flex items-center w-full mt-4 hover:border-green-500 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <Mail size={16} className='text-gray-500' />
          <input type="email" name="email" placeholder="Email id" className="placeholder:text-gray-500 border-none outline-none ring-0" value={formData.email} onChange={handleChange} required />
        </div>
        <div className="flex items-center mt-4 w-full hover:border-green-500 bg-white border border-gray-300/80 h-12 rounded-full overflow-hidden pl-6 gap-2">
          <LockIcon size={16} className='text-gray-500' />
          <input type="password" name="password" placeholder="Password" className=" placeholder:text-gray-500 border-none outline-none ring-0" value={formData.password} onChange={handleChange} required />
        </div>
        <div className="mt-4 text-left text-green-500">
          <button className="text-sm" type="reset">Forget password?</button>
        </div>
        <button type="submit" className="mt-2 w-full h-11 rounded-full text-white bg-green-500 hover:opacity-90 transition-opacity">
          {state === "login" ? "Login" : "Sign up"}
        </button>
        <p onClick={() => setState(prev => prev === "login" ? "register" : "login")} className="text-gray-500 text-sm mt-3 mb-11">{state === "login" ? "Don't have an account?" : "Already have an account?"} <a href="#" className="text-green-500 hover:underline">click here</a></p>
      </form>
    </div>
  )
}

export default Login