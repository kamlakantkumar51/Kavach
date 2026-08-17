import React from 'react'
import { userDataContext } from '../context/UserContext';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import { useContext, useEffect, useState, useRef } from 'react';
import { CgMenuRightAlt } from "react-icons/cg";
import { RxCross2 } from "react-icons/rx";
import ThemeToggle from '../components/ThemeToggle';

function Home() {

const {userData, serverUrl,setUserData,getGeminiResponse} = React.useContext(userDataContext);
const navigate = useNavigate();

const [listening, setListening] = React.useState(false);
const [userText, setUserText] = React.useState("");
const [aiText, setAiText] = React.useState("");
const [voices, setVoices] = useState([]);
const [audioEnabled, setAudioEnabled] = useState(false);
const isSpeakingRef = React.useRef(false);
const recognitionRef = React.useRef(null);
const [ham, setHam] = React.useState(false);
const isRecognizingRef = React.useRef(false);
const synth= window.speechSynthesis;

const userDataRef = React.useRef(userData);
const [manualListen, setManualListen] = React.useState(false);
const manualListenRef = React.useRef(false);

const [inputText, setInputText] = React.useState("");
const [textLoading, setTextLoading] = React.useState(false);

const handleTextInputSubmit = async (e) => {
  e.preventDefault();
  if (!inputText.trim() || textLoading) return;

  // Cancel any active speech synthesis and stop recognition
  if (isSpeakingRef.current && synth) {
    synth.cancel();
    isSpeakingRef.current = false;
  }
  if (recognitionRef.current && isRecognizingRef.current) {
    recognitionRef.current.stop();
    isRecognizingRef.current = false;
    setListening(false);
  }

  const query = inputText.trim();
  setUserText(query);
  setInputText("");
  setAiText("Thinking...");
  setTextLoading(true);

  try {
    const data = await getGeminiResponse(query);
    setTextLoading(false);
    if (data) {
      handlecommand(data);
      setAiText(data.response || "");
    } else {
      setAiText("Sorry, I couldn't get a response.");
    }
  } catch (err) {
    setTextLoading(false);
    console.error(err);
    setAiText("Sorry, something went wrong.");
  }

  // Clear userText after 4 seconds
  setTimeout(() => {
    setUserText("");
  }, 4000);
};

const handleChipClick = async (chipText) => {
  if (textLoading) return;

  // Cancel any active speech synthesis and stop recognition
  if (isSpeakingRef.current && synth) {
    synth.cancel();
    isSpeakingRef.current = false;
  }
  if (recognitionRef.current && isRecognizingRef.current) {
    recognitionRef.current.stop();
    isRecognizingRef.current = false;
    setListening(false);
  }

  setUserText(chipText);
  setAiText("Thinking...");
  setTextLoading(true);

  try {
    const data = await getGeminiResponse(chipText);
    setTextLoading(false);
    if (data) {
      handlecommand(data);
      setAiText(data.response || "");
    } else {
      setAiText("Sorry, I couldn't get a response.");
    }
  } catch (err) {
    setTextLoading(false);
    console.error(err);
    setAiText("Sorry, something went wrong.");
  }

  // Clear userText after 4 seconds
  setTimeout(() => {
    setUserText("");
  }, 4000);
};

React.useEffect(() => {
  userDataRef.current = userData;
}, [userData]);

const triggerManualListen = () => {
  if (isSpeakingRef.current && synth) {
    synth.cancel();
    isSpeakingRef.current = false;
  }

  if (isRecognizingRef.current) {
    try {
      recognitionRef.current?.stop();
    } catch (e) {
      console.log("stop error:", e);
    }
    setListening(false);
    isRecognizingRef.current = false;
    setManualListen(false);
    manualListenRef.current = false;
    setAiText("");
  } else {
    setManualListen(true);
    manualListenRef.current = true;
    setAiText("Listening directly...");
    startRecognition();
  }
};

const handleLogOut = async () => {
  try {
    const result = await axios.get(`${serverUrl}/api/auth/logout`, 
      {withCredentials: true})
      setUserData(null);
      navigate("/signin");
  } catch (error) {
    setUserData(null);
    console.log(error)
  }
}

const startRecognition=()=>{
  if(!isSpeakingRef.current && !isRecognizingRef.current){
  try{
    recognitionRef.current?.start();
    console.log("Recognition requested to start")
  }catch(error){
    if(error.name !== "InvalidStateError"){
      console.log("start error:", error);
    }
  }
 }
};

const enableAudio = () => {
  // calling a dummy utterance in response to a user gesture unlocks speech
  setAudioEnabled(true);
  if (synth) {
    const u = new SpeechSynthesisUtterance('');
    synth.speak(u);
  }
};

const speak=(text)=>{
  if (!synth) {
    console.warn("Speech synthesis not supported in this browser");
    return;
  }

  // auto-enable audio when speaking in response to user input
  if (!audioEnabled) {
    enableAudio();
  }

  // refresh voices if we somehow don't have them yet
  if (voices.length === 0) {
    setVoices(synth.getVoices());
  }

  console.log("speak() called with text:", text);
  console.log("available voices:", voices);

  const utterance=new SpeechSynthesisUtterance(text);
  utterance.lang="hi-IN";

  // choose any hindi voice or fallback to first voice
  const hindiVoice = voices.find(v => v.lang && v.lang.toLowerCase().startsWith('hi'));
  if (hindiVoice) {
    utterance.voice = hindiVoice;
  } else if (voices.length > 0) {
    console.warn("Hindi voice not found, using default voice");
    utterance.voice = voices[0];
  }

  utterance.onerror = (e) => {
    console.error("utterance error", e);
  };

  isSpeakingRef.current=true;

  utterance.onend=()=>{
    setAiText("");
    isSpeakingRef.current=false;
  }

  synth.speak(utterance);
}

const safeOpen = (url) => {
  const newWindow = window.open(url, "_blank");
  // If the browser blocked the pop-up, fall back to opening in the same tab
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    console.warn("Pop-up blocked. Falling back to same-tab navigation.");
    window.location.href = url;
  }
};

const handlecommand=(data)=>{

  if(!data){
    console.log("No response from assistant");
    return;
  }

  const {type,userInput,response}=data;

  speak(response);

  if (type === "google_search") {
    const query = encodeURIComponent(userInput);
    safeOpen(`https://www.google.com/search?q=${query}`);
  }

  if (type === "youtube_search") {
    const query = encodeURIComponent(userInput);
    safeOpen(`https://www.youtube.com/results?search_query=${query}`);
  }

  if (type === "youtube_play") {
    const query = encodeURIComponent(userInput);
    safeOpen(`https://www.youtube.com/results?search_query=${query}`);
  }

  if (type === "instagram_open") {
    safeOpen(`https://www.instagram.com`);
  }

  if (type === "facebook_open") {
    safeOpen(`https://www.facebook.com`);
  }

  if (type === "calculator_open") {
    safeOpen(`https://www.google.com/search?q=calculator`);
  }

  if (type === "weather_show") {
    const query = encodeURIComponent("weather " + userInput);
    safeOpen(`https://www.google.com/search?q=${query}`);
  }

}

useEffect(()=>{

  const SpeechRecognition=window.SpeechRecognition || window.webkitSpeechRecognition;

  const recognition=new SpeechRecognition();

  recognition.continuous=false;
  recognition.lang="en-US";
  recognition.interimResults=false;
  recognitionRef.current=recognition;

  recognition.onstart=()=>{
    isRecognizingRef.current=true;
    setListening(true);
  };

  recognition.onend=()=>{
    isRecognizingRef.current=false;
    setListening(false);
    setManualListen(false);
    manualListenRef.current = false;
  };

  recognition.onerror=(event)=>{
    console.warn("Recognition error", event.error);
    isRecognizingRef.current=false;
    setListening(false);
    setManualListen(false);
    manualListenRef.current = false;
  };

  recognition.onresult=async(e)=>{
    const transcript=e.results[e.results.length-1][0].transcript.trim();

    // Show what is being spoken immediately in real-time
    setUserText(transcript);
    console.log("Speech recognition output:", transcript);

    setManualListen(false);
    manualListenRef.current = false;
    setAiText("Thinking...");
    
    try {
      recognition.stop();
    } catch(err) {
      console.log("recognition stop error on result:", err);
    }
    isRecognizingRef.current=false;
    setListening(false);

    const data = await getGeminiResponse(transcript);

    if (data) {
      handlecommand(data);
      setAiText(data.response || "");
    } else {
      setAiText("Sorry, I couldn't get a response.");
    }
    
    // Let the text stay visible on the screen for 4 seconds so the user can read it
    setTimeout(() => {
      setUserText("");
    }, 4000);
  }

  return ()=>{
    try {
      recognition.stop();
    } catch (err) {
      console.log("recognition cleanup error:", err);
    }
    setListening(false);
    isRecognizingRef.current=false;
  }

},[])

useEffect(() => {
  const updateVoices = () => {
    setVoices(window.speechSynthesis.getVoices());
  };
  updateVoices();
  window.speechSynthesis.onvoiceschanged = updateVoices;
  return () => {
    window.speechSynthesis.onvoiceschanged = null;
  };
}, [])

// keep polling until voices appear, in case the event didn't fire
useEffect(() => {
  if (voices.length === 0 && synth) {
    const timer = setInterval(() => {
      const v = synth.getVoices();
      if (v.length > 0) {
        setVoices(v);
        clearInterval(timer);
      }
    }, 500);
    return () => clearInterval(timer);
  }
}, [voices, synth]);

// automatically enable audio when the user interacts with the page
useEffect(() => {
  const onUserGesture = () => {
    if (!audioEnabled) {
      enableAudio();
    }
  };
  document.addEventListener("mousedown", onUserGesture, { once: true });
  document.addEventListener("touchstart", onUserGesture, { once: true });
  return () => {
    document.removeEventListener("mousedown", onUserGesture);
    document.removeEventListener("touchstart", onUserGesture);
  };
}, [audioEnabled]);

return (
<div className='w-full h-[100dvh] bg-gradient-to-t from-slate-100 to-indigo-50 dark:from-[black] dark:to-[#02023d] text-slate-800 dark:text-white flex justify-center items-center flex-col gap-[12px] md:gap-[15px] overflow-hidden transition-colors duration-300 p-4 relative'>

<CgMenuRightAlt className='lg:hidden text-slate-800 dark:text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer z-20' onClick={()=>setHam(true)}/>
<div className={`absolute lg:hidden top-0 w-full h-full bg-white/95 dark:bg-slate-950/95 text-slate-800 dark:text-white border-l border-slate-200 dark:border-slate-800 backdrop-blur-lg p-[20px] flex flex-col gap-[20px] items-start ${ham ? "translate-x-0" : "translate-x-full"} transition-transform z-30`}>
<RxCross2 className='text-slate-800 dark:text-white absolute top-[20px] right-[20px] w-[25px] h-[25px] cursor-pointer' onClick={()=>setHam(false)}/>

<button className='w-[150px] h-[45px] mx-auto text-slate-700 hover:text-slate-900 dark:text-slate-950 bg-slate-200 hover:bg-slate-300 dark:bg-white dark:hover:bg-gray-100 rounded-full cursor-pointer text-[16px] font-semibold mt-12' onClick={handleLogOut}>
Log Out
</button>

<button className='w-[220px] h-[45px] mx-auto text-slate-700 hover:text-slate-900 dark:text-slate-950 bg-slate-200 hover:bg-slate-300 dark:bg-white dark:hover:bg-gray-100 rounded-full cursor-pointer text-[16px] font-semibold' onClick={() => navigate("/customize")}>
Customize your Assistant
</button>

<div className='w-full h-[2px] bg-slate-200 dark:bg-slate-800 mt-2'></div>

<div className="flex justify-between items-center w-full mt-2">
  <span className="text-slate-500 dark:text-gray-400 font-semibold text-sm">Theme</span>
  <ThemeToggle />
</div>

<div className='w-full h-[2px] bg-slate-200 dark:bg-slate-800 mt-2'></div>
<h1 className='font-semibold text-[19px]'>History</h1>
<div className='w-full h-[300px] gap-[15px] overflow-y-auto flex flex-col'>
  {userData.history?.map((his, idx)=>(
    <span key={idx} className='text-slate-600 dark:text-gray-200 text-[16px] truncate'>{his}</span>
  ))}
</div>

</div>

{/* Floating Theme Toggle on desktop */}
<div className="absolute top-[20px] right-[430px] hidden lg:block z-10">
  <ThemeToggle />
</div>

<button className='w-[150px] h-[45px] mx-auto mt-[10px] text-slate-700 hover:text-slate-900 dark:text-slate-950 bg-slate-200 hover:bg-slate-300 dark:bg-white dark:hover:bg-gray-100 rounded-full cursor-pointer text-[16px] font-semibold absolute hidden lg:block top-[20px] right-[20px]' onClick={handleLogOut}>
Log Out
</button>

<button className='w-[220px] h-[45px] mx-auto mt-[10px] text-slate-700 hover:text-slate-900 dark:text-slate-950 bg-slate-200 hover:bg-slate-300 dark:bg-white dark:hover:bg-gray-100 rounded-full cursor-pointer text-[16px] font-semibold absolute top-[20px] right-[190px] hidden lg:block' onClick={() => navigate("/customize")}>
Customize your Assistant
</button>

  {/* Equalizer animation CSS */}
  <style>{`
    @keyframes wave {
      0% { height: 10px; }
      50% { height: 48px; }
      100% { height: 12px; }
    }
    .equalizer-bar {
      animation: wave 1.2s ease-in-out infinite alternate;
    }
  `}</style>

  {/* Circular Assistant Avatar */}
  <div className="relative flex items-center justify-center mt-6 md:mt-10 group select-none">
    {/* Pulsing glow ring under avatar */}
    <div className={`absolute inset-0 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 blur-[12px] transition-all duration-500 ${listening ? 'scale-115 opacity-100' : 'scale-100 opacity-40 group-hover:opacity-60'}`}></div>
    {/* Double border container */}
    <div 
      className={`w-[130px] h-[130px] md:w-[170px] md:h-[170px] rounded-full overflow-hidden border-2 relative z-10 transition-all duration-300 ${listening ? 'border-blue-400 scale-105 shadow-[0_0_35px_rgba(59,130,246,0.6)]' : 'border-blue-500/30'}`}
    >
      <img src={userData?.assistantImage} alt="Assistant" className='w-full h-full object-cover' />
    </div>
  </div>

  <h1 className='text-slate-900 dark:text-white text-2xl md:text-3xl font-bold tracking-wide mt-1 md:mt-2 select-none'>
    I'm {userData?.assistantName}
  </h1>

  {/* Equalizer Waveform & State Status */}
  <div className="flex flex-col items-center gap-1 md:gap-2 select-none mt-1 md:mt-2">
    <button 
      onClick={triggerManualListen}
      className={`relative w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center text-white cursor-pointer transition-all duration-300 z-10 ${listening ? 'bg-rose-600 shadow-[0_0_20px_rgba(244,63,94,0.6)] scale-110' : 'bg-blue-600 hover:bg-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:scale-105'}`}
    >
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
        <path d="M19 10a1 1 0 0 0-1 1 6 6 0 0 1-12 0 1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A8 8 0 0 0 19 11a1 1 0 0 0-1-1Z" />
      </svg>
    </button>
    
    <p className="text-blue-500 dark:text-blue-300 text-xs md:text-[13px] font-bold tracking-wider mt-1 uppercase">
      {listening ? "Listening..." : aiText === "Thinking..." ? "Thinking..." : "Click to speak"}
    </p>
  </div>

  {/* Waveform Visualization */}
  <div className="flex items-end justify-center gap-[5px] md:gap-[6px] h-[40px] md:h-[55px] mt-1 select-none">
    <div className={`w-[4px] md:w-[5px] bg-blue-400 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[30px] md:h-[40px]' : isSpeakingRef.current ? 'equalizer-bar h-[22px] md:h-[30px]' : 'h-[6px]'}`} style={{ animationDelay: '0.1s', animationDuration: '0.8s' }}></div>
    <div className={`w-[4px] md:w-[5px] bg-blue-500 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[36px] md:h-[48px]' : isSpeakingRef.current ? 'equalizer-bar h-[26px] md:h-[35px]' : 'h-[6px]'}`} style={{ animationDelay: '0.3s', animationDuration: '1.2s' }}></div>
    <div className={`w-[4px] md:w-[5px] bg-indigo-400 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[28px] md:h-[35px]' : isSpeakingRef.current ? 'equalizer-bar h-[18px] md:h-[25px]' : 'h-[6px]'}`} style={{ animationDelay: '0.5s', animationDuration: '0.9s' }}></div>
    <div className={`w-[4px] md:w-[5px] bg-blue-400 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[32px] md:h-[45px]' : isSpeakingRef.current ? 'equalizer-bar h-[30px] md:h-[40px]' : 'h-[6px]'}`} style={{ animationDelay: '0.2s', animationDuration: '1.4s' }}></div>
    <div className={`w-[4px] md:w-[5px] bg-indigo-500 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[26px] md:h-[38px]' : isSpeakingRef.current ? 'equalizer-bar h-[22px] md:h-[32px]' : 'h-[6px]'}`} style={{ animationDelay: '0.4s', animationDuration: '0.7s' }}></div>
    <div className={`w-[4px] md:w-[5px] bg-blue-300 rounded-full transition-all duration-300 ${listening ? 'equalizer-bar h-[30px] md:h-[42px]' : isSpeakingRef.current ? 'equalizer-bar h-[26px] md:h-[38px]' : 'h-[6px]'}`} style={{ animationDelay: '0.6s', animationDuration: '1.1s' }}></div>
  </div>

  {/* Conversation Dialogue Display */}
  <div className="flex flex-col items-center gap-[8px] md:gap-[10px] mt-2 text-center max-w-[90%] md:max-w-[80%] px-[10px] md:px-[20px] z-10 min-h-[50px] overflow-y-auto">
    {userText && <p className="text-blue-600 dark:text-blue-300 text-sm md:text-[17px] italic font-medium animate-pulse">You: "{userText}"</p>}
    {aiText && aiText !== "Listening directly..." && (
      <h2 className="text-slate-900 dark:text-white text-sm md:text-[18px] font-semibold tracking-wide drop-shadow bg-white/80 dark:bg-[#090d228c] backdrop-blur border border-slate-200 dark:border-blue-500/10 px-4 py-2 md:px-5 md:py-3 rounded-2xl max-w-[600px] leading-relaxed shadow-lg">
        {aiText}
      </h2>
    )}
  </div>

  {/* Orbiting / Quick Suggestion Chips */}
  {!aiText && !listening && !userText && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-3 max-w-[500px] w-full mt-2 px-4 select-none">
      {[
        { label: "Summarize my day", text: "Summarize my day" },
        { label: "Write an email", text: "Write an email" },
        { label: "Explain a concept", text: "Explain a concept" },
        { label: "Debug my code", text: "Debug my code" }
      ].map((chip, idx) => (
        <div 
          key={idx}
          onClick={() => handleChipClick(chip.text)}
          className="bg-white/80 dark:bg-[#090d22bd] backdrop-blur-xl border border-slate-200 dark:border-blue-500/10 hover:border-blue-300 dark:hover:border-blue-500/40 rounded-2xl p-3 md:p-4 cursor-pointer hover:shadow-lg dark:hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] hover:scale-102 transition-all flex flex-col text-left gap-1"
        >
          <span className="text-blue-600 dark:text-blue-400 text-[10px] md:text-xs font-semibold flex items-center gap-1">
            ✦ Quick prompt
          </span>
          <span className="text-xs md:text-sm font-medium">
            {chip.label}
          </span>
        </div>
      ))}
    </div>
  )}

  {/* Bottom Dual-Mode Input Bar */}
  <div className="w-full max-w-[600px] px-4 mt-auto mb-4 md:mb-6 z-10">
    <form onSubmit={handleTextInputSubmit} className="relative flex items-center bg-white/90 dark:bg-[#090d22bd] backdrop-blur-xl border border-slate-200 dark:border-blue-500/20 focus-within:border-blue-600 dark:focus-within:border-blue-500 rounded-2xl h-[50px] md:h-[56px] px-2 shadow-xl dark:shadow-2xl transition-all">
      <input 
        type="text" 
        placeholder={`Message ${userData?.assistantName || "assistant"}...`}
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        className="flex-1 h-full bg-transparent outline-none text-slate-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 px-3 md:px-4 text-sm md:text-base"
        disabled={textLoading}
      />
      
      <div className="flex items-center gap-1">
        {/* Speech Trigger in Capsule */}
        <button 
          type="button" 
          onClick={triggerManualListen}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-white cursor-pointer transition-colors ${listening ? 'bg-rose-600 hover:bg-rose-700 animate-pulse' : 'bg-blue-600/20 hover:bg-blue-600/40 text-blue-400'}`}
          title="Speak"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 md:w-5 md:h-5">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10a1 1 0 0 0-1 1 6 6 0 0 1-12 0 1 1 0 0 0-2 0 8 8 0 0 0 7 7.93V21H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.07A8 8 0 0 0 19 11a1 1 0 0 0-1-1Z" />
          </svg>
        </button>

        {/* Submit Prompt Button */}
        <button 
          type="submit" 
          disabled={!inputText.trim() || textLoading}
          className={`w-8 h-8 md:w-10 md:h-10 rounded-xl flex items-center justify-center transition-colors cursor-pointer ${inputText.trim() && !textLoading ? 'bg-blue-600 dark:bg-white text-white dark:text-slate-950 hover:bg-blue-700 dark:hover:bg-gray-100' : 'bg-slate-200 dark:bg-slate-800 text-slate-400 dark:text-gray-500 cursor-not-allowed'}`}
          title="Send"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4.5 h-4.5 md:w-5 md:h-5">
            <path d="M3.478 2.404a.75.75 0 0 0-.926.941l2.432 7.905H13.5a.75.75 0 0 1 0 1.5H4.984l-2.432 7.905a.75.75 0 0 0 .926.94 60.519 60.519 0 0 0 18.445-8.986.75.75 0 0 0 0-1.218A60.517 60.517 0 0 0 3.478 2.404Z" />
          </svg>
        </button>
      </div>
    </form>
  </div>
</div>
)

}

export default Home