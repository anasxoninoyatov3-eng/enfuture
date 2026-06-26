import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, BookOpen, Sparkles, Trophy, LogOut, ChevronLeft, ChevronRight, Shield, User
} from 'lucide-react';
import { cn } from '@/utils';
import { useUiStore } from '@/uiStore';
import { useUserStore } from '@/userStore';
import { motion, AnimatePresence } from 'framer-motion';

const navItems = [
  { icon: LayoutGrid, label: 'Dashboard', href: '/dashboard' },
  { icon: BookOpen, label: 'Courses', href: '/courses' },
  { icon: Sparkles, label: 'Create Lesson', href: '/ai-tutor', },
  { icon: Trophy, label: 'Leaderboard', href: '/leaderboard' },
  { icon: User, label: 'Profile', href: '/profile' },
];

export const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isSidebarCollapsed, toggleSidebar, isMobileMenuOpen, setMobileMenuOpen } = useUiStore();
  const { user, logout } = useUserStore();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/');
  };

  const SidebarContent = (
    <div className="flex h-full flex-col">
      <div className={cn("flex mb-16 w-full transition-all duration-300", isSidebarCollapsed ? "flex-col items-center gap-6 px-0" : "flex-row items-center justify-between px-2")}>
        <div className={cn("flex items-center gap-3", isSidebarCollapsed ? "justify-center w-full" : "px-2")}>
          <img src="/favicon.svg?v=6" alt="Logo" className="h-9 w-9 object-contain" />
          {(!isSidebarCollapsed || isMobileMenuOpen) && (
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">ENK English</span>
          )}
        </div>

        {!isMobileMenuOpen && (
          <button
            onClick={toggleSidebar}
            className="hidden md:flex h-10 w-10 shrink-0 rounded-xl border border-slate-100 dark:border-slate-800 items-center justify-center text-slate-300 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            {isSidebarCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-3 w-full">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.href);
          return (
            <Link
              key={item.label}
              to={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={cn(
                'group relative flex items-center transition-all duration-200',
                (isSidebarCollapsed && !isMobileMenuOpen)
                  ? 'justify-center w-12 h-12 rounded-lg mx-auto'
                  : 'space-x-3 w-full px-4 py-3 rounded-lg',
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              )}
            >
              <item.icon
                className={cn(
                  "flex-shrink-0 transition-all duration-300",
                  (isSidebarCollapsed && !isMobileMenuOpen) ? "h-6 w-6" : "h-5 w-5",
                  isActive ? "text-white" : "text-slate-300 dark:text-slate-500 group-hover:text-slate-900 dark:group-hover:text-white"
                )}
              />

              {(!isSidebarCollapsed || isMobileMenuOpen) && (
                <div className="flex-1 flex items-center justify-between">
                  <span className={cn(
                    "font-medium text-sm transition-colors duration-200",
                    isActive ? "text-white" : "text-inherit"
                  )}>
                    {item.label}
                  </span>
                </div>
              )}
            </Link>
          );
        })}

        {user?.email === 'dinoyatova21@gmail.com' && (
          <Link
            to="/admin"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              'group relative flex items-center transition-all duration-200 mt-4 border border-rose-100',
              (isSidebarCollapsed && !isMobileMenuOpen)
                ? 'justify-center w-12 h-12 rounded-lg mx-auto bg-rose-50'
                : 'space-x-3 w-full px-4 py-3 rounded-lg bg-rose-50 text-rose-600 shadow-sm'
            )}
          >
            <Shield className={cn(
              "flex-shrink-0 transition-all duration-300 text-rose-600",
              (isSidebarCollapsed && !isMobileMenuOpen) ? "h-6 w-6" : "h-5 w-5"
            )}
            />
            {(!isSidebarCollapsed || isMobileMenuOpen) && (
              <span className="font-bold text-sm text-rose-600">Admin Panel</span>
            )}
          </Link>
        )}
      </nav>

      <div className="mt-auto pt-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <button
          onClick={handleLogout}
          className={cn(
            "flex items-center w-full px-4 py-3 rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all font-medium text-sm",
            (isSidebarCollapsed && !isMobileMenuOpen) && "justify-center"
          )}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {(!isSidebarCollapsed || isMobileMenuOpen) && <span className="ml-3 font-bold">Logout account</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] bg-white dark:bg-slate-900 z-[70] p-6 md:hidden shadow-2xl border-r border-slate-200 dark:border-slate-800"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "fixed left-0 top-0 hidden h-screen flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 py-8 transition-all duration-300 md:flex z-50",
          isSidebarCollapsed ? "w-20 items-center" : "w-64 px-4"
        )}
      >
        {SidebarContent}
      </aside>
    </>
  );
};
