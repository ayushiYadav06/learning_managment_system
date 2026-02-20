import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from '../hooks';
import { loginThunk, selectLoginLoading, clearLoginError } from '../store/slices/authSlice';

export function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const loading = useAppSelector(selectLoginLoading);

  useEffect(() => {
    dispatch(clearLoginError());
  }, [dispatch]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(loginThunk({ username, password }));
    if (loginThunk.fulfilled.match(result)) {
      toast.success('Login successful!');
      navigate('/dashboard');
    } else if (loginThunk.rejected.match(result)) {
      toast.error(result.payload ?? 'Invalid credentials.');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left: Navy brand panel */}
      <div className="hidden lg:flex lg:w-[52%] bg-[#0f172a] flex-col justify-between p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <span className="text-xl font-semibold tracking-tight">LMS Admin</span>
        </div>
        <div className="space-y-6">
          <h1 className="text-3xl lg:text-4xl font-bold tracking-tight leading-tight max-w-md">
            Billing & subscription management, simplified.
          </h1>
          <p className="text-slate-300 text-lg max-w-sm leading-relaxed">
            Sign in to manage plans, masters, and subscriptions from one secure dashboard.
          </p>
        </div>
        <div className="flex gap-6 text-sm text-slate-400">
          <span>© LMS Admin Portal</span>
        </div>
      </div>

      {/* Right: White form panel */}
      <div className="flex-1 flex items-center justify-center bg-white p-6 sm:p-10">
        <div className="w-full max-w-[400px]">
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-lg bg-[#0f172a] flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-[#0f172a]">LMS Admin Portal</span>
          </div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-[#0f172a] tracking-tight">Welcome back</h2>
            <p className="text-slate-500 mt-1.5">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-[#0f172a] font-medium">
                Username
              </Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-11 border-slate-200 focus-visible:ring-[#0f172a]/20 focus-visible:border-[#0f172a]"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-[#0f172a] font-medium">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-11 border-slate-200 focus-visible:ring-[#0f172a]/20 focus-visible:border-[#0f172a]"
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full h-11 bg-[#0f172a] hover:bg-[#1e293b] text-white font-medium rounded-lg"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>
            {import.meta.env.DEV && (
              <p className="text-center text-sm text-slate-400 mt-4">Dev: admin / admin123</p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
