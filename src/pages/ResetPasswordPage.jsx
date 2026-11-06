import React, { useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import { CheckCircle2, AlertCircle } from 'lucide-react';

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const emailParam = searchParams.get('email') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState({ state: 'idle', message: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setStatus({ state: 'error', message: 'Passwords do not match.' });
      return;
    }
    if (password.length < 6) {
      setStatus({ state: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    try {
      setStatus({ state: 'loading', message: '' });
      const res = await authService.resetPassword({
        token,
        email: emailParam,
        newPassword: password
      });
      setStatus({ state: 'success', message: res.data.message });
      setTimeout(() => navigate('/login'), 2500);
    } catch (err) {
      setStatus({ state: 'error', message: err.message || 'Password reset failed.' });
    }
  };

  return (
    <div className="max-w-md mx-auto py-12">
      <div className="bg-white p-8 border border-[#E2E8F0] rounded-xs shadow-xs">
        <div className="text-center mb-6">
          <h1 className="font-editorial text-3xl font-bold text-[#0B1B3D]">
            Set New Password
          </h1>
          <p className="text-xs text-[#64748B] mt-2">
            Enter a new secure password for <strong>{emailParam}</strong>.
          </p>
        </div>

        {status.state === 'success' && (
          <div className="mb-4 p-4 bg-emerald-50 border border-emerald-300 rounded text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5 text-emerald-600" />
            <div>
              <p className="font-bold">Password Reset Successful</p>
              <p className="text-xs mt-1">Redirecting you to the sign in portal...</p>
            </div>
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
              New Password (min 6 chars)
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

          <div>
            <label className="block text-xs font-bold text-[#0B1B3D] uppercase tracking-wider mb-1">
              Confirm New Password
            </label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full text-xs p-2.5 bg-[#FBF9F5] border border-[#CBD5E1] rounded focus:outline-none focus:border-[#0B1B3D]"
            />
          </div>

          <button
            type="submit"
            disabled={status.state === 'loading'}
            className="w-full py-2.5 bg-[#0B1B3D] hover:bg-[#B83232] text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
          >
            {status.state === 'loading' ? 'Updating Password...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
}

