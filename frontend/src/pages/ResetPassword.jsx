import React, { useState, useEffect } from 'react'
import bg from '../assets/authBg.png'
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import RobotAvatar from '../components/RobotAvatar';
import ThemeToggle from '../components/ThemeToggle';
import { FaEye, FaEyeSlash } from "react-icons/fa6";

function ResetPassword() {
  const { token } = useParams();
  const { serverUrl } = React.useContext(userDataContext);
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    let timer;
    if (isSuccess && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
    } else if (isSuccess && countdown === 0) {
      navigate("/signin");
    }
    return () => clearTimeout(timer);
  }, [isSuccess, countdown, navigate]);

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErr("");
    setMessage("");

    if (password.length < 6) {
      setErr("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErr("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const result = await axios.post(`${serverUrl}/api/auth/reset-password/${token}`, {
        password
      }, { withCredentials: true });

      setMessage(result.data.message || "Password updated successfully!");
      setIsSuccess(true);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setErr(error.response.data.message);
      } else {
        setErr("Failed to reset password. The link may have expired or is invalid.");
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
          <RobotAvatar pose={isSuccess ? "happy" : "normal"} className="w-[120px] h-[120px] md:w-[180px] md:h-[180px]" />
          
          <h2 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide mt-1 md:mt-2'>
            New Password
          </h2>
          <p className='text-indigo-600 dark:text-blue-300 text-xs md:text-sm max-w-[200px] leading-relaxed'>
            {isSuccess ? "All set! Let's get you back inside." : "Create a strong password that you don't use elsewhere."}
          </p>
        </div>

        {/* Right pane: Reset Password Form */}
        <form 
          className='w-full md:w-1/2 p-6 md:p-10 flex flex-col justify-center gap-4 md:gap-5' 
          onSubmit={handleResetPassword}
        >
          <div>
            <h1 className='text-slate-900 dark:text-white text-xl md:text-2xl font-bold tracking-wide'>
              Reset Password
            </h1>
            <p className='text-slate-500 dark:text-gray-400 text-xs md:text-sm mt-1'>
              Please enter your new password below.
            </p>
          </div>

          {!isSuccess ? (
            <>
              {/* Password field */}
              <div className='flex flex-col gap-1 md:gap-2'>
                <label className='text-slate-700 dark:text-gray-300 text-xs md:text-sm font-medium ml-1'>
                  New Password
                </label>
                <div className='w-full h-[48px] md:h-[52px] border border-slate-300 dark:border-blue-500/20 focus-within:border-blue-600 dark:focus-within:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white rounded-xl relative flex items-center transition-all shadow-inner'>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder='At least 6 characters'
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

              {/* Confirm Password field */}
              <div className='flex flex-col gap-1 md:gap-2'>
                <label className='text-slate-700 dark:text-gray-300 text-xs md:text-sm font-medium ml-1'>
                  Confirm New Password
                </label>
                <div className='w-full h-[48px] md:h-[52px] border border-slate-300 dark:border-blue-500/20 focus-within:border-blue-600 dark:focus-within:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white rounded-xl relative flex items-center transition-all shadow-inner'>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder='Confirm your password'
                    required
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    className='w-full h-full rounded-xl outline-none bg-transparent px-4 md:px-5 pr-10 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-[16px]'
                  />
                  <div
                    className='absolute right-3 md:right-4 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white cursor-pointer z-10 transition-colors'
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </div>
                </div>
              </div>
            </>
          ) : null}

          {message && (
            <div className='text-emerald-600 dark:text-emerald-400 text-xs md:text-sm bg-emerald-500/10 border border-emerald-500/20 px-4 py-3 rounded-lg font-medium flex flex-col gap-1'>
              <span>✓ {message}</span>
              <span className='text-[11px] opacity-80'>Redirecting to sign in page in {countdown} seconds...</span>
            </div>
          )}

          {err && (
            <p className='text-rose-600 dark:text-rose-400 text-xs md:text-sm bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg font-medium'>
              * {err}
            </p>
          )}

          {!isSuccess ? (
            <button 
              type="submit"
              className='w-full h-[46px] md:h-[50px] mt-1 md:mt-2 text-white dark:text-slate-950 font-bold bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-100 active:bg-blue-800 dark:active:bg-gray-200 rounded-xl text-sm md:text-[16px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-white/5 disabled:opacity-50'
              disabled={loading}
            >
              {loading ? "Resetting Password..." : <>Reset Password <span className='text-md md:text-lg'>→</span></>}
            </button>
          ) : (
            <button 
              type="button"
              onClick={() => navigate("/signin")}
              className='w-full h-[46px] md:h-[50px] mt-1 md:mt-2 text-white dark:text-slate-950 font-bold bg-emerald-600 dark:bg-emerald-400 hover:bg-emerald-700 dark:hover:bg-emerald-300 rounded-xl text-sm md:text-[16px] flex items-center justify-center gap-2 transition-all cursor-pointer'
            >
              Go to Sign In
            </button>
          )}
        </form>

      </div>
    </div>
  )
}

export default ResetPassword;
