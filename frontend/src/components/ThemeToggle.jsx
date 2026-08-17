import React, { useContext } from 'react';
import { userDataContext } from '../context/UserContext';
import { FiSun, FiMoon, FiMonitor } from 'react-icons/fi';

function ThemeToggle() {
  const { theme, setTheme } = useContext(userDataContext);

  return (
    <div className="w-[130px] h-[38px] bg-slate-200/60 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-800 rounded-full flex items-center justify-between p-[3px] relative select-none transition-colors duration-300">
      {/* Sliding indicator */}
      <div 
        className="absolute bg-white dark:bg-blue-600/30 border border-slate-200 dark:border-blue-500/30 rounded-full h-[30px] w-[38px] transition-all duration-300 z-0 shadow-sm"
        style={{
          left: theme === 'light' ? '3px' : theme === 'dark' ? '45px' : '87px'
        }}
      />
      
      {/* Light Button */}
      <button
        onClick={() => setTheme('light')}
        type="button"
        className={`w-[38px] h-[30px] flex items-center justify-center rounded-full z-10 cursor-pointer transition-colors ${theme === 'light' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        title="Light Theme"
      >
        <FiSun size={15} />
      </button>

      {/* Dark Button */}
      <button
        onClick={() => setTheme('dark')}
        type="button"
        className={`w-[38px] h-[30px] flex items-center justify-center rounded-full z-10 cursor-pointer transition-colors ${theme === 'dark' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        title="Dark Theme"
      >
        <FiMoon size={15} />
      </button>

      {/* System Button */}
      <button
        onClick={() => setTheme('system')}
        type="button"
        className={`w-[38px] h-[30px] flex items-center justify-center rounded-full z-10 cursor-pointer transition-colors ${theme === 'system' ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'}`}
        title="System Theme"
      >
        <FiMonitor size={15} />
      </button>
    </div>
  );
}

export default ThemeToggle;
