import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, User, Menu, X, Calendar, ChevronDown, LogOut, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getNepaliDateStamp } from '../../utils/dateUtils';
import { newsService } from '../../services/api';

export default function Header() {
  const { user, logout, isAdmin } = useAuth();
  const [dateInfo, setDateInfo] = useState(getNepaliDateStamp());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const [breaking, setBreaking] = useState([]);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load categories dynamically from backend
    newsService.getCategories()
      .then(res => {
        if (res.data?.data && res.data.data.length > 0) {
          setCategories(res.data.data);
        }
      })
      .catch(() => {
        // Fallback standard 13 categories
        setCategories([
          { name: 'National News', slug: 'national', nepaliName: 'राष्ट्रिय' },
          { name: 'Politics', slug: 'politics', nepaliName: 'राजनीति' },
          { name: 'Economy & Business', slug: 'business', nepaliName: 'अर्थ' },
          { name: 'Kathmandu Valley', slug: 'kathmandu', nepaliName: 'उपत्यका' },
          { name: 'International', slug: 'international', nepaliName: 'अन्तर्राष्ट्रिय' },
          { name: 'Technology', slug: 'technology', nepaliName: 'प्रविधि' },
          { name: 'Science & Environment', slug: 'science', nepaliName: 'विज्ञान' },
          { name: 'Climate & Himalayas', slug: 'climate', nepaliName: 'जलवायु' },
          { name: 'Sports', slug: 'sports', nepaliName: 'खेलकुद' },
          { name: 'Education', slug: 'education', nepaliName: 'शिक्षा' },
          { name: 'Health', slug: 'health', nepaliName: 'स्वास्थ्य' },
          { name: 'Opinion', slug: 'opinion', nepaliName: 'विचार' },
          { name: 'Culture & Society', slug: 'culture', nepaliName: 'संस्कृति' }
        ]);
      });

    // Load live breaking news ticker
    newsService.getBreakingNews()
      .then(res => setBreaking(res.data?.data || []))
      .catch(() => {});
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="w-full bg-[#FBF9F5] text-[#1E293B] border-b border-[#E2E8F0] shadow-xs">
      {/* 1. TOP UTILITY BAR (Bilingual Date, Weather/Markets, User Actions) */}
      <div className="border-b border-[#E2E8F0] bg-[#F4EFE6] text-xs py-1.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          {/* Left: Date & Edition */}
          <div className="flex items-center space-x-3 text-[#475569]">
            <span className="font-semibold text-[#0B1B3D] flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#B83232]" />
              {dateInfo.gregorian}
            </span>
            <span className="hidden md:inline text-neutral-300">|</span>
            <span className="hidden md:inline font-nepali text-[#B83232] font-semibold">{dateInfo.bikramSambat}</span>
            <span className="hidden lg:inline text-neutral-300">|</span>
            <span className="hidden lg:inline text-[#64748B]">{dateInfo.edition}</span>
          </div>

          {/* Right: Quick Links / Secure Auth */}
          <div className="flex items-center space-x-4">
            <Link to="/booking" className="hidden sm:inline-flex items-center text-[#B83232] hover:text-[#9E2A2B] font-semibold tracking-wide uppercase text-[11px]">
              Book Consultation / Coverage
            </Link>
            <span className="text-neutral-300 hidden sm:inline">|</span>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-1.5 text-[#0B1B3D] font-medium hover:text-[#B83232]"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>{user.name.split(' ')[0]}</span>
                  {isAdmin && (
                    <span className="bg-[#B83232] text-white text-[9px] px-1.5 py-0.2 rounded font-bold uppercase">Staff</span>
                  )}
                  <ChevronDown className="w-3 h-3 text-[#64748B]" />
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-[#E2E8F0] rounded shadow-lg py-1 z-50">
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#B83232] hover:bg-[#F8FAFC]"
                      >
                        <ShieldAlert className="w-3.5 h-3.5" />
                        Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="block px-4 py-2 text-xs text-[#334155] hover:bg-[#F8FAFC]"
                    >
                      My Profile & Bookmarks
                    </Link>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-[#F8FAFC]"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3 font-medium">
                <Link to="/login" className="text-[#0B1B3D] hover:text-[#B83232]">Sign In</Link>
                <span className="text-neutral-300">/</span>
                <Link to="/register" className="text-[#B83232] hover:underline font-semibold">Subscribe</Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. BROADSHEET MASTHEAD (Editorial Branding) */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-5">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Left: Weather & NEPSE Snapshot */}
          <div className="hidden md:flex flex-col text-xs text-[#64748B]">
            <span className="font-semibold text-[#0B1B3D]">KATHMANDU 19°C • AIR: MODERATE</span>
            <span className="text-[11px]">NEPSE: 2,824.12 (+42.6 pts)</span>
          </div>

          {/* Center: Brand Identity Masthead */}
          <div className="text-center">
            <Link to="/" className="inline-block group">
              <span className="block text-[11px] uppercase tracking-[0.3em] font-semibold text-[#B83232] mb-0.5">
                Independent Nepali Digital Journalism
              </span>
              <h1 className="font-editorial text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[#0B1B3D] group-hover:text-[#9E2A2B] transition-colors leading-none">
                THE NEPAL CHRONICLE
              </h1>
              <span className="block font-nepali text-sm text-[#475569] mt-1 tracking-widest font-semibold">
                नेपाल क्रोनिकल • सत्य, तथ्य र निष्पक्ष समाचार
              </span>
            </Link>
          </div>

          {/* Right: Search Box */}
          <div className="w-full md:w-auto">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center">
              <input
                type="text"
                placeholder="Search articles, keywords, topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-3 pr-8 py-1.5 text-xs bg-white border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D] focus:ring-1 focus:ring-[#0B1B3D]"
              />
              <button type="submit" className="absolute right-2.5 text-[#64748B] hover:text-[#0B1B3D]">
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. EDITORIAL NAVIGATION BAR (All Required Categories) */}
      <div className="bg-[#0B1B3D] text-[#F8FAFC]">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center justify-between">
          <nav className="hidden lg:flex items-center space-x-1 py-0 overflow-x-auto text-[12px] font-semibold tracking-wider uppercase">
            <Link to="/" className="px-3 py-3 border-b-2 border-transparent hover:border-[#C59B27] hover:text-[#C59B27] transition-colors">
              Home
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                to={`/category/${cat.slug}`}
                className="px-2.5 py-3 border-b-2 border-transparent hover:border-[#C59B27] hover:text-[#C59B27] whitespace-nowrap transition-colors"
              >
                {cat.name}
              </Link>
            ))}
          </nav>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center justify-between w-full py-2.5">
            <span className="text-xs font-semibold tracking-wider uppercase text-neutral-300">All Sections</span>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1 rounded text-white hover:bg-[#1E293B]"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0B1B3D] border-t border-[#1E293B] px-4 py-4 space-y-2 text-sm text-white max-h-[80vh] overflow-y-auto">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-1.5 font-semibold text-[#C59B27]"
          >
            Front Page
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              to={`/category/${cat.slug}`}
              onClick={() => setMobileMenuOpen(false)}
              className="block py-1.5 text-neutral-200 hover:text-white"
            >
              {cat.name} {cat.nepaliName && <span className="font-nepali text-xs text-neutral-400">({cat.nepaliName})</span>}
            </Link>
          ))}
          <div className="border-t border-[#1E293B] pt-3 mt-2 space-y-2 text-xs">
            <Link to="/booking" onClick={() => setMobileMenuOpen(false)} className="block text-[#C59B27] font-semibold">
              Book Consultation / Coverage
            </Link>
            <Link to="/contact" onClick={() => setMobileMenuOpen(false)} className="block text-neutral-300">Contact Newsroom</Link>
            <Link to="/about" onClick={() => setMobileMenuOpen(false)} className="block text-neutral-300">About Editorial Team</Link>
          </div>
        </div>
      )}

      {/* 4. BREAKING NEWS WIRE TICKER */}
      {breaking.length > 0 && (
        <div className="bg-[#B83232] text-white text-xs py-1.5 px-4 sm:px-8 overflow-hidden">
          <div className="max-w-7xl mx-auto flex items-center">
            <span className="bg-[#0B1B3D] text-white font-bold px-2.5 py-0.5 uppercase tracking-wider text-[10px] rounded-xs mr-3 flex-shrink-0 animate-pulse">
              BREAKING
            </span>
            <div className="truncate font-medium flex items-center gap-4">
              <Link to={`/news/${breaking[0].slug}`} className="hover:underline">
                {breaking[0].title}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
