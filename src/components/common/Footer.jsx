import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle2, AlertCircle, Phone, MapPin } from 'lucide-react';
import { newsService } from '../../services/api';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleNewsletterSubmit = async (e) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus({ state: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setStatus({ state: 'loading', message: '' });
      await newsService.subscribeNewsletter(email);
      setStatus({ state: 'success', message: 'Subscribed to the Morning Dispatch.' });
      setEmail('');
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Subscription failed.' });
    }
  };

  return (
    <footer className="w-full bg-[#12161F] text-[#CBD5E1] border-t-4 border-[#B83232]">
      {/* Editorial Top bar: Newsletter Subscription */}
      <div className="border-b border-[#242C3F] py-8 px-4 sm:px-8 bg-[#181E2B]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="max-w-xl">
            <h3 className="font-editorial text-2xl font-bold text-white tracking-wide">
              The Kathmandu Morning Dispatch
            </h3>
            <p className="text-sm text-[#94A3B8] mt-1">
              Curated investigative reporting, Himalayan climate updates, and political intelligence delivered to your inbox every dawn.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="px-4 py-2 text-sm bg-[#0E131D] text-white border border-[#334155] rounded focus:outline-none focus:border-[#C59B27] min-w-[260px]"
            />
            <button
              type="submit"
              disabled={status.state === 'loading'}
              className="px-5 py-2 bg-[#B83232] hover:bg-[#9E2A2B] text-white text-xs font-semibold tracking-wider uppercase rounded transition-colors whitespace-nowrap"
            >
              {status.state === 'loading' ? 'Joining...' : 'Subscribe Free'}
            </button>
          </form>
        </div>

        {status.state === 'success' && (
          <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 text-xs text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
            <span>{status.message}</span>
          </div>
        )}
        {status.state === 'error' && (
          <div className="max-w-7xl mx-auto mt-3 flex items-center gap-2 text-xs text-rose-400">
            <AlertCircle className="w-4 h-4" />
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* Main Footer Sitemap Columns */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Col 1: Masthead Info */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="font-editorial text-2xl font-bold text-white tracking-wider">
              THE NEPAL CHRONICLE
            </h2>
            <p className="font-nepali text-sm text-[#94A3B8]">
              स्वतन्त्र, निष्पक्ष र अनुसन्धानात्मक डिजिटल पत्रकारिता। काठमाडौँ, नेपाल।
            </p>
            <p className="text-xs text-[#94A3B8] leading-relaxed pr-6">
              The Nepal Chronicle is an independent digital news organization based in Kathmandu, committed to sovereign reporting, public accountability, market transparency, and cultural preservation across Nepal.
            </p>
            <div className="pt-2 text-xs text-[#94A3B8] space-y-1">
              <p className="flex items-center gap-2"><MapPin className="w-3.5 h-3.5 text-[#B83232]" /> Babarmahal Media Enclave, Ward 11, Kathmandu, Nepal</p>
              <p className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#B83232]" /> +977-1-4240000 / Newsdesk: 4240001</p>
              <p className="flex items-center gap-2"><Mail className="w-3.5 h-3.5 text-[#B83232]" /> editor@nepalchronicle.com</p>
            </div>
          </div>

          {/* Col 2: News Desks */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#242C3F] pb-2 mb-3">
              News Desks
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/national" className="hover:text-white transition-colors">National Affairs</Link></li>
              <li><Link to="/category/politics" className="hover:text-white transition-colors">Singha Durbar Politics</Link></li>
              <li><Link to="/category/business" className="hover:text-white transition-colors">Economy & NEPSE</Link></li>
              <li><Link to="/category/kathmandu" className="hover:text-white transition-colors">Kathmandu Valley</Link></li>
              <li><Link to="/category/environment" className="hover:text-white transition-colors">Himalayan Climate</Link></li>
              <li><Link to="/category/technology" className="hover:text-white transition-colors">Tech & Digital Nepal</Link></li>
              <li><Link to="/category/sports" className="hover:text-white transition-colors">Cricket & Sports</Link></li>
            </ul>
          </div>

          {/* Col 3: Editorial & Opinions */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#242C3F] pb-2 mb-3">
              Editorial & Special
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/category/opinion" className="hover:text-white transition-colors">Guest Columns & Op-Eds</Link></li>
              <li><Link to="/about" className="hover:text-white transition-colors">Editorial Board & Journalists</Link></li>
              <li><Link to="/editorial-policy" className="hover:text-white transition-colors">Code of Ethics & Sourcing</Link></li>
              <li><Link to="/booking" className="text-[#C59B27] font-semibold hover:underline">Media Consultation Booking</Link></li>
              <li><Link to="/submit-story" className="hover:text-white transition-colors">Submit Confidential Whistleblower Tip</Link></li>
              <li><Link to="/careers" className="hover:text-white transition-colors">Newsroom Fellowships</Link></li>
            </ul>
          </div>

          {/* Col 4: Corporate & Commercial */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest border-b border-[#242C3F] pb-2 mb-3">
              Institutional
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/advertise" className="hover:text-white transition-colors">Advertise & Media Kit</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Contact Editorial Bureau</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Terms of Publication</Link></li>
              <li><Link to="/admin" className="text-neutral-400 hover:text-white text-[11px]">Staff Access (/admin)</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Legal bar */}
      <div className="border-t border-[#1E2536] py-4 px-4 sm:px-8 text-center text-[11px] text-[#64748B]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © {new Date().getFullYear()} The Nepal Chronicle Media Pvt. Ltd. Department of Information & Broadcasting Regd. No. 1824/078-79.
          </span>
          <span className="font-nepali">
            सर्वाधिकार सुरक्षित • नेपाल क्रोनिकल
          </span>
        </div>
      </div>
    </footer>
  );
}

