import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { authService } from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setStatus({ state: 'loading', message: '' });
      const res = await authService.forgotPassword(email);
      setStatus({ state: 'success', message: res.data.message });
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Request failed' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <h1 className="font-editorial text-3xl font-bold text-[#0B1B3D]">
            Password Recovery
          </h1>
          <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
            Enter your registered email address. We will dispatch a secure, time-limited reset link.
          </p>
        </div>

        {status.state === 'success' && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <span>{status.message}</span>
          </div>
        )}

        {status.state === 'error' && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-300 rounded text-xs text-rose-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{status.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1">
              Registered Email
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

          <button
            type="submit"
            disabled={status.state === 'loading'}
            className="w-full py-2.5 bg-[#0B1B3D] hover:bg-[#B83232] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            {status.state === 'loading' ? 'Dispatching Link...' : 'Send Reset Link'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-[#64748B] border-t border-[#F1F5F9] pt-4">
          <Link to="/login" className="font-semibold text-[#B83232] hover:underline">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}

