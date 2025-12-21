import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Login Auth Standar
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) throw error;

      // Jika sukses, Auth Listener di app.tsx biasanya menghandle, 
      // tapi kita paksa redirect manual untuk UX yang cepat.
      toast.success(`Selamat datang kembali!`);
      navigate('/dashboard-community'); 
      
    } catch (error: any) {
      toast.error(error.message || 'Email atau password salah');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard-community` },
    });
    if (error) toast.error(error.message);
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <Toaster position="top-center" />
      
      {/* Left Image Section */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
         <img className="absolute inset-0 h-auto w-auto object-center" src="../src/assets/sportify-logo-light.svg" alt="Team Sports" />
         <div className="absolute inset-0 bg-[#006989]/80 mix-blend-multiply" />
         <div className="absolute bottom-0 left-0 p-16 text-white">
            <h2 className="text-4xl font-bold mb-4">Kembali Beraksi</h2>
            <p className="text-lg opacity-90">Terhubung kembali dengan komunitas dan jadwal latihanmu.</p>
         </div>
      </div>

      {/* Right Form Section */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="text-center mb-10">
             <div className="w-12 h-12 bg-[#006989] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
                <span className="text-white font-bold text-xl">S</span>
             </div>
             <h2 className="text-3xl font-bold text-gray-900">Welcome Back!</h2>
             <p className="mt-2 text-sm text-gray-600">Masukkan akun Sportify kamu.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email" required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition outline-none text-gray-700"
                  placeholder="email@anda.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition outline-none text-gray-700"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <div className="flex justify-end mt-2">
                <Link to="/forgot-password" className="text-xs font-medium text-[#006989] hover:underline">
                  Lupa password?
                </Link>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 bg-[#006989] hover:bg-[#005a75] text-white py-3 rounded-xl font-bold transition shadow-md disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                 <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn size={20} /> Masuk
                </>
              )}
            </button>
          </form>

          {/* Google Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Atau masuk dengan</span>
              </div>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="mt-6 w-full flex justify-center items-center gap-3 px-4 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-xl text-gray-700 bg-white hover:bg-gray-50 transition"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-sm text-gray-600">
            Belum punya akun?{' '}
            <Link to="/register" className="font-bold text-[#006989] hover:underline">
              Daftar Gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;