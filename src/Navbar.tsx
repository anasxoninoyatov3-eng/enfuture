import { Link } from 'react-router-dom';
import { Search, Sun, Moon, Menu, X } from 'lucide-react';
import { useUiStore } from '@/uiStore';
import { useUserStore } from '@/userStore';
import { NotificationBell } from '@/components/NotificationBell';

export const Navbar = () => {
  const { isDarkMode, toggleDarkMode, isMobileMenuOpen, toggleMobileMenu } = useUiStore();
  const { user } = useUserStore();

  const displayName = user ? `${user.firstName}${user.lastName ? ` ${user.lastName}` : ''}` : 'Profile';

  return (
    <header className="sticky top-0 z-40 w-full flex h-16 items-center justify-between px-4 md:px-8 bg-white/80 dark:bg-[#0f172a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-all">
      <div className="flex items-center gap-4">
        <button
          onClick={toggleMobileMenu}
          className="md:hidden h-10 w-10 flex items-center justify-center rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:bg-slate-100 transition-colors"
        >
          {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
        
        <div className="hidden max-w-xs md:flex-1 md:flex relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 dark:text-slate-500 group-focus-within:text-indigo-600 transition-colors" />
          <input 
            type="text"
            placeholder="Quick search..."
            className="h-10 w-full bg-slate-50 dark:bg-slate-800/50 border-none pl-10 pr-4 text-sm font-medium rounded-xl focus:ring-2 focus:ring-indigo-600/20 outline-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center space-x-3 md:space-x-6">
        <button
          onClick={toggleDarkMode}
          className="h-9 w-9 md:h-10 md:w-10 rounded-full flex items-center justify-center bg-slate-50 dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-indigo-600 transition-all border border-transparent hover:border-indigo-100"
        >
          {isDarkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
        </button>

        <NotificationBell />

        <div className="hidden h-6 w-px bg-slate-100 dark:bg-slate-800 mx-1 md:block" />

        <Link to="/profile" className="flex items-center space-x-2 md:space-x-4 group">
          <div className="flex flex-col items-end hidden sm:flex">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 transition-colors">{displayName}</span>
            <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-tighter">Level {user?.currentLevel || 'A1'}</span>
          </div>
          <div className="h-9 w-9 md:h-10 md:w-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm transition-all group-hover:ring-4 group-hover:ring-indigo-100 dark:group-hover:ring-indigo-900/40 overflow-hidden shadow-sm">
            {user?.picture ? (
              <img src={user.picture} alt="Profile" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
            ) : (
              user?.firstName?.[0] || 'U'
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
