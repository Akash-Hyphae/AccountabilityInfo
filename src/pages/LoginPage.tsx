import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, ArrowRight, Sparkles, Sprout } from 'lucide-react';
import { BrandLogo } from '../components/common/BrandLogo.tsx';
import { useAuth } from '../context/AuthContext.tsx';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);

  const { login, loginDemo } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      await loginDemo();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Demo access failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0f172a] flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="flex justify-center mb-2">
          <BrandLogo size="lg" showText={false} />
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-gray-100 tracking-tight">
          Welcome to <span className="text-emerald-600 dark:text-emerald-400">accountabilityInfo</span>
        </h2>
        <p className="mt-1 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
          "Nurture Today. A Better You Tomorrow."
        </p>

        {/* Sticky Motivational Quote tape */}
        <div className="mt-3 inline-block bg-[#fefce8] dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 px-4 py-1 rounded-lg transform -rotate-1 shadow-xs">
          <p className="font-handwriting text-lg text-amber-900 dark:text-amber-200">
            "Discipline waters your mind, and creates a better tomorrow."
          </p>
        </div>
      </div>

      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="bg-white dark:bg-[#1e293b] py-8 px-6 sm:px-10 shadow-xl rounded-3xl border border-gray-200/80 dark:border-gray-800">
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-600 dark:text-red-400 text-xs">
              {error}
            </div>
          )}

          {/* 1-Click Demo Login Banner */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={demoLoading}
            className="w-full mb-5 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold text-emerald-900 dark:text-emerald-200 bg-emerald-100/70 dark:bg-emerald-950/50 border border-emerald-300 dark:border-emerald-800 hover:bg-emerald-200/80 transition-all shadow-xs active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>{demoLoading ? 'Starting Demo Session...' : 'Instant 1-Click Demo Drive (Preloaded Data)'}</span>
          </button>

          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200 dark:border-gray-700" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white dark:bg-[#1e293b] px-2 text-gray-400">
                Or Sign In with Email
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="demo@accountability.info"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-3 py-2.5 text-xs sm:text-sm rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-sm flex items-center justify-center gap-2 mt-2"
            >
              <span>{loading ? 'Authenticating...' : 'Sign In to Account'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-gray-500">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-emerald-600 dark:text-emerald-400 hover:underline">
              Create one now
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
