import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-3 text-center">
          <div className="mx-auto w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center">
            <GraduationCap className="w-10 h-10 text-white" />
          </div>
          <CardTitle className="text-2xl">LMS Admin Portal</CardTitle>
          <CardDescription>
            Sign in to manage your billing and subscriptions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Enter username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
            {import.meta.env.DEV && (
              <div className="text-sm text-center text-gray-500 mt-4">
                Dev: admin / admin123
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
