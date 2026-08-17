import React, { useState } from 'react'
import bg from '../assets/authBg.png'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import RobotAvatar from '../components/RobotAvatar';
import ThemeToggle from '../components/ThemeToggle';

function ForgotPassword() {
  const { serverUrl } = React.useContext(userDataContext);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMessage("");
    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/forgot-password`, {
        email
      }, { withCredentials: true });
      
      setMessage(result.data.message || "A reset link has been sent to your email.");
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setErr(error.response.data.message);
      } else {
        setErr("Something went wrong. Please try again.");
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

      {/* Glassmorphic main container */}
      <div className='w-full max-w-[800px] bg-white/90 dark:bg-[#090d22bd] backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 rounded-3xl shadow-xl dark:shadow-[0_0_50px_rgba(0,0,255,0.25)] flex flex-col md:flex-row overflow-hidden transition-all duration-300 mt-12 md:mt-0'>
        
        {/* Left pane: Assistant */}
        <div className='w-full md:w-1/2 bg-gradient-to-br from-blue-50/80 to-indigo-100/50 dark:from-blue-950/40 dark:to-slate-950/60 p-6 md:p-8 flex flex-col justify-center items-center border-b md:border-b-0 md:border-r border-slate-200 dark:border-blue-500/10 text-center gap-2 md:gap-3 select-none'>
          <RobotAvatar pose="happy" className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]" />
          
          <h2 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide mt-1 md:mt-2'>
            Forgot Password?
          </h2>
          <p className='text-indigo-600 dark:text-blue-300 text-xs md:text-sm max-w-[200px] leading-relaxed'>
            No worries! Kavach will help you regain access securely.
          </p>
        </div>

        {/* Right pane: Forgot Password Form */}
        <form 
          className='w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center gap-4 md:gap-5' 
          onSubmit={handleForgotPassword}
        >
          <div>
            <h1 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide'>
              Reset Password request
            </h1>
            <p className='text-slate-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
              Enter your email address and we will send you a password reset link.
            </p>
          </div>

          <div className='flex flex-col gap-1 md:gap-2'>
            <label className='text-slate-700 dark:text-gray-300 text-xs md:text-sm font-medium ml-1'>
              Email Address
            </label>
            <input
              type="email"
              placeholder='Enter your registered email'
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              className='w-full h-[48px] md:h-[52px] outline-none border border-slate-300 dark:border-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 md:px-5 rounded-xl text-sm md:text-[16px] transition-all shadow-inner'
            />
          </div>

          {message && (
            <p className='text-emerald-600 dark:text-emerald-400 text-xs md:text-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-2 rounded-lg font-medium'>
              {message}
            </p>
          )}

          {err && (
            <p className='text-rose-600 dark:text-rose-400 text-xs md:text-sm bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg font-medium'>
              * {err}
            </p>
          )}

          <button 
            type="submit"
            className='w-full h-[46px] md:h-[50px] mt-1 md:mt-2 text-white dark:text-slate-950 font-bold bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-100 active:bg-blue-800 dark:active:bg-gray-200 rounded-xl text-sm md:text-[16px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-white/5 disabled:opacity-50'
            disabled={loading}
          >
            {loading ? "Sending link..." : <>Send Reset Link <span className='text-md md:text-lg'>→</span></>}
          </button>

          <p className='text-slate-500 dark:text-gray-400 text-xs md:text-sm text-center mt-1 md:mt-2'>
            Back to{' '}
            <span
              className='text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline'
              onClick={() => navigate("/signin")}
            >
              Sign In
            </span>
          </p>
        </form>

      </div>
    </div>
  )
}

export default ForgotPassword;
