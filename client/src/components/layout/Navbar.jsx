import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Menu,
  X,
  User,
  LogOut,
  Heart,
  History,
  LayoutDashboard,
  ChevronDown,
  Crown,
  Shield,
} from 'lucide-react';
import useAuthStore from '../../store/authStore';

const navLinks = [
  { label: 'Home', path: '/' },
  { label: 'Genre', path: '/genres' },
  { label: 'Schedule', path: '/schedule' },
  { label: 'Forum', path: '/forum' },
  { label: 'Shop', path: '/shop' },
  { label: 'Premium', path: '/premium' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const userRef = useRef(null);
  const navigate = useNavigate();

  const { user, isAuthenticated, logout } = useAuthStore();
  const isLoggedIn = isAuthenticated && user;

  const isAdmin = user && ['super_admin', 'content_admin', 'moderator'].includes(user.role);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleLogout = () => {
    logout();
    setUserOpen(false);
    setMobileOpen(false);
    navigate('/');
  };

  const linkClass = ({ isActive }) =>
    `relative text-sm font-medium transition-colors duration-200 ${
      isActive ? 'text-[#0ea5e9]' : 'text-[#94a3b8] hover:text-[#f8fafc]'
    }`;

  return (
    <>
      <nav
        className={`fixed top-0 inset-x-0 z-50 h-16 transition-all duration-300 ${
          scrolled ? 'glass-strong shadow-lg' : 'glass'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full flex items-center justify-between px-4">
          {/* Left: Logo + Mobile toggle */}
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5 text-[#f8fafc]" />
            </button>
            <Link to="/" className="flex items-center gap-1 select-none">
              <span className="text-xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent">
                Anizil
              </span>
            </Link>
          </div>

          {/* Center: Nav links (desktop) */}
          <div className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <NavLink key={link.path} to={link.path} className={linkClass}>
                {({ isActive }) => (
                  <span className="relative">
                    {link.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0ea5e9] rounded-full"
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </span>
                )}
              </NavLink>
            ))}
          </div>

          {/* Right: Search + Auth */}
          <div className="flex items-center gap-2">
            <Link
              to="/search"
              className="p-2 rounded-lg hover:bg-[#1e293b] transition-colors"
              aria-label="Search"
            >
              <Search className="w-5 h-5 text-[#94a3b8]" />
            </Link>

            {isLoggedIn ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setUserOpen(!userOpen)}
                  className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-[#1e293b] transition-colors"
                >
                  <div className="relative">
                    <img
                      src={user?.avatar || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(user?.name || 'User') + '&background=0ea5e9&color=fff'}
                      alt="avatar"
                      className="w-7 h-7 rounded-full object-cover"
                      style={{
                        boxShadow: user?.role === 'super_admin'
                          ? '0 0 8px 2px rgba(168,85,247,0.5)'
                          : user?.role === 'content_admin'
                            ? '0 0 8px 2px rgba(14,165,233,0.5)'
                            : user?.role === 'moderator'
                              ? '0 0 8px 2px rgba(34,197,94,0.5)'
                              : 'none',
                      }}
                    />
                    {user?.role && user.role !== 'user' && (
                      <span className="absolute -bottom-1 -right-1 text-[8px] leading-none">
                        {user.role === 'super_admin' ? '👑' : user.role === 'content_admin' ? '📝' : '🛡️'}
                      </span>
                    )}
                  </div>
                  <span className="hidden sm:block text-sm text-[#f8fafc] max-w-[100px] truncate">
                    {user?.name || 'User'}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#94a3b8] transition-transform duration-200 ${
                      userOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {userOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 top-full mt-2 w-52 glass-strong rounded-xl border border-[rgba(148,163,184,0.12)] shadow-xl overflow-hidden"
                    >
                      <div className="px-4 py-3 border-b border-[rgba(148,163,184,0.12)]">
                        <p className="text-sm font-medium text-[#f8fafc] truncate">
                          {user?.name}
                        </p>
                        <p className="text-xs text-[#94a3b8] truncate">{user?.email}</p>
                        {isAdmin && (
                          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-[#0ea5e9]/15 text-[#0ea5e9] font-medium">
                            <Shield className="w-3 h-3" />
                            {user.role === 'super_admin' ? 'Super Admin' : user.role === 'content_admin' ? 'Content Admin' : 'Moderator'}
                          </span>
                        )}
                      </div>
                      <div className="py-1">
                        <DropdownLink
                          icon={<LayoutDashboard className="w-4 h-4" />}
                          label="Dashboard"
                          onClick={() => { navigate('/dashboard'); setUserOpen(false); }}
                        />
                        <DropdownLink
                          icon={<User className="w-4 h-4" />}
                          label="My Profile"
                          onClick={() => { navigate('/dashboard?tab=profile'); setUserOpen(false); }}
                        />
                        <DropdownLink
                          icon={<Heart className="w-4 h-4" />}
                          label="Watchlist"
                          onClick={() => { navigate('/dashboard?tab=list'); setUserOpen(false); }}
                        />
                        <DropdownLink
                          icon={<History className="w-4 h-4" />}
                          label="History"
                          onClick={() => { navigate('/dashboard?tab=history'); setUserOpen(false); }}
                        />
                        {isAdmin && (
                          <DropdownLink
                            icon={<Crown className="w-4 h-4 text-[#facc15]" />}
                            label="Admin Panel"
                            onClick={() => { navigate('/admin'); setUserOpen(false); }}
                          />
                        )}
                      </div>
                      <div className="border-t border-[rgba(148,163,184,0.12)] py-1">
                        <DropdownLink
                          icon={<LogOut className="w-4 h-4 text-[#ef4444]" />}
                          label="Logout"
                          danger
                          onClick={handleLogout}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link to="/login" className="btn-secondary text-sm px-3 py-1.5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm px-3 py-1.5">
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-[#1e293b] border-r border-[rgba(148,163,184,0.12)] z-[70] flex flex-col"
            >
              <div className="flex items-center justify-between px-4 h-16 border-b border-[rgba(148,163,184,0.12)]">
                <Link
                  to="/"
                  className="text-xl font-bold bg-gradient-to-r from-[#0ea5e9] to-[#38bdf8] bg-clip-text text-transparent"
                  onClick={() => setMobileOpen(false)}
                >
                  Anizil
                </Link>
                <button
                  className="p-2 rounded-lg hover:bg-[#334155] transition-colors"
                  onClick={() => setMobileOpen(false)}
                >
                  <X className="w-5 h-5 text-[#f8fafc]" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto py-4 px-3">
                <div className="flex flex-col gap-1">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                          isActive
                            ? 'bg-[#0ea5e9]/10 text-[#0ea5e9]'
                            : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc]'
                        }`
                      }
                    >
                      {link.label}
                    </NavLink>
                  ))}
                </div>
                <div className="mt-6 border-t border-[rgba(148,163,184,0.12)] pt-4">
                  {isLoggedIn ? (
                    <div className="flex flex-col gap-1">
                      <div className="px-3 py-2 mb-2">
                        <p className="text-sm font-medium text-[#f8fafc]">{user?.name}</p>
                        <p className="text-xs text-[#94a3b8]">{user?.email}</p>
                      </div>
                      <DropdownLink
                        icon={<LayoutDashboard className="w-4 h-4" />}
                        label="Dashboard"
                        onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}
                      />
                      <DropdownLink
                        icon={<User className="w-4 h-4" />}
                        label="My Profile"
                        onClick={() => { navigate('/dashboard?tab=profile'); setMobileOpen(false); }}
                      />
                      {isAdmin && (
                        <DropdownLink
                          icon={<Crown className="w-4 h-4 text-[#facc15]" />}
                          label="Admin Panel"
                          onClick={() => { navigate('/admin'); setMobileOpen(false); }}
                        />
                      )}
                      <button
                        className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors mt-2"
                        onClick={handleLogout}
                      >
                        <LogOut className="w-4 h-4" />
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <Link
                        to="/login"
                        className="btn-secondary text-sm text-center"
                        onClick={() => setMobileOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        to="/register"
                        className="btn-primary text-sm text-center"
                        onClick={() => setMobileOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function DropdownLink({ icon, label, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full px-4 py-2 text-sm transition-colors text-left ${
        danger
          ? 'text-[#ef4444] hover:bg-[#ef4444]/10'
          : 'text-[#94a3b8] hover:bg-[#334155] hover:text-[#f8fafc]'
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
