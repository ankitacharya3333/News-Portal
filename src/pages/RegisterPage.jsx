import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AlertCircle } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await register(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#B83232] block">
            Digital Membership
          </span>
          <h1 className="font-editorial text-3xl font-bold text-[#0B1B3D] mt-1">
            Create Reader Account
          </h1>
          <p className="text-xs text-[#64748B] mt-1">Join thousands of verified readers in respectful civic discourse.</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Maya Tamang"
              required
              className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@domain.com"
              required
              className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1">
              Create Password (min. 6 characters)
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-[#B83232] hover:bg-[#9E2A2B] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            {loading ? 'Creating Membership...' : 'Join The Nepal Chronicle'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#64748B] border-t border-[#F1F5F9] pt-4">
          Already a subscriber?{' '}
          <Link to="/login" className="font-semibold text-[#0B1B3D] hover:underline">
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

