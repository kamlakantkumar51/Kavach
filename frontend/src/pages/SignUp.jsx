import React, { useState } from 'react'
import bg from '../assets/authBg.png'
import { FaEye, FaEyeSlash } from "react-icons/fa6";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { userDataContext } from '../context/UserContext';
import RobotAvatar from '../components/RobotAvatar';
import ThemeToggle from '../components/ThemeToggle';

function SignUp() {
  const [showPassword, setShowPassword] = React.useState(false);
  const {serverUrl,userData, setUserData} = React.useContext(userDataContext);
  const navigate = useNavigate();
  
  // Multi-step state
  const [step, setStep] = React.useState(1);
  const [name, setName] = React.useState(""); 
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState("");

  const handleSignUp = async () => {
    setErr("");
    setLoading(true);
    try {
      let result = await axios.post(`${serverUrl}/api/auth/signup`, {
        name, email, password
      }, { withCredentials: true });
      setUserData(result.data);
      setLoading(false);
      navigate("/customize");
    } catch (error) {
      console.log(error);
      setUserData(null);
      setLoading(false);
      if (error.response && error.response.data && error.response.data.message) {
        setErr(error.response.data.message);
      } else if (error.code === 'ERR_NETWORK' || !error.response) {
        setErr("Server is starting up (Render free tier takes ~30s to wake). Please wait a moment and click Sign Up again!");
      } else {
        setErr("Something went wrong during sign up. Please try again.");
      }
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setErr("");
    
    if (step === 1) {
      if (!name.trim()) {
        setErr("Please enter your name");
        return;
      }
      setStep(2);
    } else if (step === 2) {
      if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
        setErr("Please enter a valid email address");
        return;
      }
      setStep(3);
    } else if (step === 3) {
      if (password.length < 6) {
        setErr("Password must be at least 6 characters");
        return;
      }
      handleSignUp();
    }
  };

  // Determine robot pose based on active step
  const getRobotPose = () => {
    if (step === 1) return 'happy';
    if (step === 2) return 'thinking';
    return 'shy'; // Step 3 - password privacy
  };

  return (
    <div
      className='w-full min-h-[100vh] bg-cover bg-center flex justify-center items-center p-4 relative bg-slate-900 dark:bg-slate-950 transition-colors duration-300'
      style={{ backgroundImage: `url(${bg})` }}
    >
      {/* Floating Theme Toggle */}
      <div className="absolute top-[15px] right-[15px] md:top-[20px] md:right-[20px] z-20 scale-90 md:scale-100">
        <ThemeToggle />
      </div>

      <div className='w-full max-w-[500px] bg-white/90 dark:bg-[#090d22bd] backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 rounded-3xl p-5 md:p-8 flex flex-col justify-between items-center text-center gap-4 md:gap-6 shadow-xl dark:shadow-[0_0_50px_rgba(0,0,255,0.2)] transition-all duration-300 mt-12 md:mt-0'>
        
        {/* Progress Tracker */}
        <div className="w-full relative flex items-center justify-between max-w-[320px] md:max-w-[360px] mx-auto select-none mt-1">
          <div className="absolute top-[14px] md:top-[16px] left-2 right-2 h-[2px] bg-slate-200 dark:bg-slate-800 z-0"></div>
          <div 
            className="absolute top-[14px] md:top-[16px] left-2 h-[2px] bg-blue-600 dark:bg-blue-500 transition-all duration-500 z-0" 
            style={{ width: `${((step - 1) / 2) * 95}%` }}
          ></div>

          {/* Step 1 */}
          <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => step > 1 && setStep(1)}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs transition-all duration-300 ${step >= 1 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-slate-800'}`}>
              1
            </div>
            <span className={`text-[9px] md:text-[10px] font-bold tracking-wide uppercase transition-colors ${step >= 1 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>Name</span>
          </div>

          {/* Step 2 */}
          <div className="flex flex-col items-center gap-1 z-10 cursor-pointer" onClick={() => step > 2 && setStep(2)}>
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs transition-all duration-300 ${step >= 2 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-slate-800'}`}>
              2
            </div>
            <span className={`text-[9px] md:text-[10px] font-bold tracking-wide uppercase transition-colors ${step >= 2 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>Email</span>
          </div>

          {/* Step 3 */}
          <div className="flex flex-col items-center gap-1 z-10">
            <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center font-bold text-[10px] md:text-xs transition-all duration-300 ${step >= 3 ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40' : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-gray-500 border border-slate-200 dark:border-slate-800'}`}>
              3
            </div>
            <span className={`text-[9px] md:text-[10px] font-bold tracking-wide uppercase transition-colors ${step >= 3 ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-gray-500'}`}>Password</span>
          </div>
        </div>

        {/* Robot Reacts */}
        <div className="flex justify-center items-center h-[120px] md:h-[160px]">
          <RobotAvatar pose={getRobotPose()} className="w-[120px] h-[120px] md:w-[160px] md:h-[160px]" />
        </div>

        {/* Input Card Container */}
        <form onSubmit={handleSubmit} className="w-full flex flex-col gap-4 md:gap-6">
          {step === 1 && (
            <div className="flex flex-col gap-2 md:gap-3 animate-fadeIn">
              <h2 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold tracking-wide">
                Let's get started. What is your name?
              </h2>
              <input
                type="text"
                placeholder="Enter your name"
                required
                autoFocus
                className="w-full h-[48px] md:h-[52px] outline-none border border-slate-300 dark:border-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 md:px-5 rounded-xl text-sm md:text-[16px] transition-all text-center shadow-inner"
                onChange={(e) => setName(e.target.value)}
                value={name}
              />
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-2 md:gap-3 animate-fadeIn">
              <h2 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold tracking-wide">
                Nice to meet you, {name}! What's your email?
              </h2>
              <input
                type="email"
                placeholder="Enter your email"
                required
                autoFocus
                className="w-full h-[48px] md:h-[52px] outline-none border border-slate-300 dark:border-blue-500/20 focus:border-blue-600 dark:focus:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-4 md:px-5 rounded-xl text-sm md:text-[16px] transition-all text-center shadow-inner"
                onChange={(e) => setEmail(e.target.value)}
                value={email}
              />
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-2 md:gap-3 animate-fadeIn">
              <h2 className="text-slate-900 dark:text-white text-lg md:text-xl font-bold tracking-wide">
                Almost done! Choose a secure password.
              </h2>
              <div className="w-full h-[48px] md:h-[52px] border border-slate-300 dark:border-blue-500/20 focus-within:border-blue-600 dark:focus-within:border-blue-500 bg-slate-50/50 dark:bg-slate-950/40 text-slate-900 dark:text-white rounded-xl relative flex items-center transition-all shadow-inner">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  required
                  autoFocus
                  className="w-full h-full rounded-xl outline-none bg-transparent px-4 md:px-5 pr-10 text-center text-slate-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 text-sm md:text-[16px]"
                  onChange={(e) => setPassword(e.target.value)}
                  value={password}
                />
                <div
                  className="absolute right-3 md:right-4 text-slate-400 dark:text-gray-400 hover:text-slate-600 dark:hover:text-white cursor-pointer z-10 transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </div>
              </div>
            </div>
          )}

          {err && (
            <p className="text-rose-600 dark:text-rose-400 text-xs md:text-sm bg-rose-500/10 border border-rose-500/20 px-4 py-2 rounded-lg font-medium">
              * {err}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex gap-3 w-full justify-center mt-1 md:mt-2">
            {step > 1 && (
              <button
                type="button"
                onClick={() => { setErr(""); setStep(step - 1); }}
                className="w-[90px] md:w-[100px] h-[44px] md:h-[48px] border border-slate-300 dark:border-slate-700 hover:border-slate-500 text-slate-600 dark:text-gray-300 font-semibold rounded-xl transition-all cursor-pointer bg-slate-100 dark:bg-slate-900/40 hover:bg-slate-200 dark:hover:bg-slate-900 text-sm"
              >
                Back
              </button>
            )}
            <button
              type="submit"
              className="flex-1 max-w-[280px] h-[44px] md:h-[48px] text-white dark:text-slate-950 font-bold bg-blue-600 dark:bg-white hover:bg-blue-700 dark:hover:bg-gray-100 active:bg-blue-800 dark:active:bg-gray-200 rounded-xl text-sm md:text-[16px] flex items-center justify-center gap-2 transition-all cursor-pointer shadow-lg shadow-blue-500/10 dark:shadow-white/5"
              disabled={loading}
            >
              {loading ? "Registering..." : step < 3 ? <>Next <span className="text-md md:text-lg">→</span></> : <>Sign Up <span className="text-md md:text-lg">→</span></>}
            </button>
          </div>
        </form>

        <p className="text-slate-500 dark:text-gray-400 text-xs md:text-sm mt-1 md:mt-2">
          Already have an account?{' '}
          <span
            className="text-blue-600 dark:text-blue-400 font-semibold cursor-pointer hover:underline"
            onClick={() => navigate("/signin")}
          >
            Sign In
          </span>
        </p>

      </div>
    </div>
  )
}

export default SignUp;