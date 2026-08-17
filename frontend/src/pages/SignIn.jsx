import React, { useState } from 'react'
import bg from '../assets/authBg.png'
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import RobotAvatar from '../components/RobotAvatar';
import ThemeToggle from '../components/ThemeToggle';

function SignIn() {
  const [showPassword, setShowPassword] = React.useState(false);
  const {serverUrl,userData, setUserData} = React.useContext(userDataContext);
  const navigate = useNavigate();
  const[email,setEmail]  = React.useState("");
  const[password,setPassword]  = React.useState("");
  const[err,setErr]=React.useState("")
  const [loading,setLoading]=React.useState(false)

  const handleSignIn = async(e)=>{
    e.preventDefault()
    setErr("")
    setLoading(true)
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signin`,{
        email,password
      },{withCredentials:true})
      setUserData(result.data)
      setLoading(false)
      navigate("/")
    } catch (error) {
      console.log(error)
      setUserData(null)
      setLoading(false)
      if (error.response && error.response.data && error.response.data.message) {
        setErr(error.response.data.message);
      } else {
        setErr("Incorrect email or password");
      }
    }
  }

  return (
    <div
      className='w-full min-h-[100vh] bg-cover bg-center flex justify-center items-center p-4 relative bg-slate-900 dark:bg-slate-950 transition-colors duration-300'
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Floating Theme Toggle */}
      <div className="absolute top-[15px] right-[15px] md:top-[20px] md:right-[20px] z-20 scale-90 md:scale-100">
        <ThemeToggle />
      </div>

      {/* Inline styles for Equalizer Waveform */}
      <style>{`
        @keyframes wave {
          0% { height: 10px; }
          50% { height: 40px; }
          100% { height: 15px; }
        }
        .equalizer-bar {
          animation: wave 1.2s ease-in-out infinite alternate;
        }
      `}</style>

      {/* Glassmorphic main container */}
      <div className='w-full max-w-[800px] bg-white/90 dark:bg-[#090d22bd] backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,255,0.25)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 mt-12 md:mt-0'>
        
        {/* Left pane: Assistant and Waveform */}
        <div className='w-full md:w-1/2 bg-gradient-to-br from-blue-50/80 to-indigo-100/50 dark:from-blue-950/40 dark:to-slate-950/60 p-6 md:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-blue-500/10 text-center gap-2 md:gap-3 select-none'>
          <RobotAvatar pose="happy" className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]" />
          
          <h2 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide mt-1 md:mt-2'>
            I'm kavach
          </h2>
          <p className='text-indigo-600 dark:text-blue-300 text-xs md:text-sm max-w-[200px] leading-relaxed'>
            Your intelligent AI voice assistant is ready to help.
          </p>

          {/* Equalizer animation */}
          <div className="flex items-center gap-[5px] h-[35px] md:h-[45px] mt-2 md:mt-4">
            <div className="w-[3px] md:w-[4px] bg-blue-500 dark:bg-blue-400 rounded-full equalizer-bar" style={{ animationDelay: '0.1s', animationDuration: '0.8s' }}></div>
            <div className="w-[3px] md:w-[4px] bg-indigo-500 dark:bg-blue-500 rounded-full equalizer-bar" style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></div>
            <div className="w-[3px] md:w-[4px] bg-blue-600 dark:bg-blue-300 rounded-full equalizer-bar" style={{ animationDelay: '0.5s', animationDuration: '0.9s' }}></div>
            <div className="w-[3px] md:w-[4px] bg-indigo-600 dark:bg-blue-400 rounded-full equalizer-bar" style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
            <div className="w-[3px] md:w-[4px] bg-blue-500 dark:bg-blue-500 rounded-full equalizer-bar" style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}></div>
            <div className="w-[3px] md:w-[4px] bg-indigo-500 dark:bg-blue-300 rounded-full equalizer-bar" style={{ animationDelay: '0.6s', animationDuration: '1.1s' }}></div>
          </div>
        </div>

        {/* Right pane: Auth Form */}
        <form 
          className='w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center gap-4 md:gap-5' 
          onSubmit={handleSignIn}
        >
          <div>
            <h1 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide'>
              Sign in to continue
            </h1>
            <p className='text-slate-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
              Please enter your details to access your assistant.
            </p>
          </div>

          <div className='flex flex-col gap-1 md:gap-2'>
            <label className='text-slate-700 dark:text-gray-300 text-xs md:text-sm font-medium ml-1'>
              Email Address
            </label>
            <input
              type="email"
              placeholder='Enter your email'
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='w-full h-[48px] md:h-[52px] outline-none border border-slate-300 dark:border-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 md:px-5 rounded-xl text-sm md:text-[16px] transition-all shadow-inner'
            />
          </div>

          <div className='flex flex-col gap-1 md:gap-2'>
            <label className='text-slate-700 dark:text-gray-300 text-xs md:text-sm font-medium ml-1'>
              Password
            </label>
            <div className='w-full h-[48px] md:h-[52px] border border-slate-300 dark:border-blue-500/20 focus-within:border-blue-600 dark:focus-within:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white rounded-xl relative flex items-center transition-all shadow-inner'>
              <input
                type={showPassword ? "text" : "password"}
                placeholder='Enter your password'
                required
                onChange={(e) => setPassword(e.target.value)}
                value={password}
                className='w-full h-full rounded-xl outline-none bg-transparent px-4 md:px-5 pr-10 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-[16px]'
              />
              <div
                className='absolute right-3 md:right-4 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white cursor-pointer z-10 transition-colors'
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </div>
            </div>
          </div>

          <div className='flex justify-end mt-[-10px] pr-1'>
            <span
              className='text-blue-600 dark:text-blue-400 text-xs font-semibold cursor-pointer hover:underline select-none'
              onClick={() => navigate("/forgot-password")}
            >
              Forgot Password?
            </span>
          </div>

          {err && (
            <p className='text-rose-600 dark:text-rose-400 text-xs md:text-sm bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg font-medium'>
              * {err}
            </p>
          )}

          <button 
            className='w-full h-[46px] md:h-[50px] mt-1 md:mt-2 text-white dark:text-slate-950 font-bold bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-100 active:bg-blue-800 dark:active:bg-gray-200 rounded-xl text-sm md:text-[16px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-white/5 disabled:opacity-50'
            disabled={loading}
          >
            {loading ? "Signing In..." : <>Sign In <span className='text-md md:text-lg'>→</span></>}
          </button>

          <p className='text-slate-500 dark:text-gray-400 text-xs md:text-sm text-center mt-1 md:mt-2'>
            Don't have an account?{' '}
            <span
              className='text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline'
              onClick={() => navigate("/signup")}
            >
              Sign Up
            </span>
          </p>
        </form>

      </div>
    </div>
  )
}

export default SignIn;