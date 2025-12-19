import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Lock, Eye, EyeOff, Check, X, UserPlus, Phone } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { showToast } from '../utils/toast'; // Menggunakan custom toast
import { Toaster } from 'react-hot-toast';

const Register = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk username check
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);
  const [checkingUsername, setCheckingUsername] = useState(false);
  
  const navigate = useNavigate();

  // Fungsi Cek Username (Realtime check)
  const checkUsername = async (username: string) => {
    if (username.length < 3) {
      setUsernameAvailable(null);
      return;
    }

    setCheckingUsername(true);
    try {
      const { data, error } = await supabase
        .from('users')
        .select('username')
        .eq('username', username)
        .maybeSingle(); // Gunakan maybeSingle agar tidak error jika kosong

      if (error) throw error;
      setUsernameAvailable(!data); // Jika data null, berarti available
    } catch (error) {
      console.error('Error checking username:', error);
      // Jangan set available false dulu jika error koneksi, biarkan null
    } finally {
      setCheckingUsername(false);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      return 'Password tidak cocok.';
    }
    if (formData.password.length < 6) {
      return 'Password minimal 6 karakter.';
    }
    if (usernameAvailable === false) {
      return 'Username sudah digunakan, silakan ganti.';
    }
    if (formData.username.length < 3) {
      return 'Username minimal 3 karakter.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errorMsg = validateForm();
    if (errorMsg) {
      showToast.error(errorMsg);
      return;
    }

    setIsLoading(true);

    try {
      // 1. Sign up ke Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            username: formData.username,
          },
        },
      });

      if (authError) throw authError;

      if (authData.user) {
        // 2. Buat profil user di tabel public.users
        const { error: profileError } = await supabase.from('users').insert({
          id: authData.user.id, // PENTING: ID harus sama dengan Auth ID
          username: formData.username,
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone || null,
          level: 1,
          avatar_url: `https://ui-avatars.com/api/?name=${formData.fullName}&background=random`
        });

        if (profileError) {
          console.error("Profile creation failed:", profileError);
          // Opsional: Hapus user auth jika profil gagal dibuat (Rollback manual)
          // await supabase.auth.signOut(); 
          throw new Error('Gagal membuat profil user. Silakan coba lagi.');
        }

        showToast.success('Registrasi berhasil! Silakan cek email untuk verifikasi.');
        
        // Delay sedikit sebelum redirect
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      }

    } catch (error: any) {
      showToast.error(error.message || 'Registrasi gagal.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      showToast.error(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 flex items-center justify-center p-4 md:p-6 lg:p-8">
      {/* Toaster Local (Jaga-jaga jika di App.tsx belum terload sempurna saat redirect) */}
      <Toaster position="top-center" />

      <div className="w-full grid lg:grid-cols-5 gap-8 bg-white rounded-3xl shadow-2xl overflow-hidden">
        
        {/* Left Side - Form (Lebih Lebar: 3/5 cols) */}
        <div className="lg:col-span-3 p-8 md:p-10 lg:p-12">
          {/* Header Mobile */}
          <div className="text-center lg:text-left mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Join <span className="text-[#006989]">Sportify.id</span>
            </h1>
            <p className="text-gray-600">
              Buat akun dan mulai berkomunitas olahraga di Bandung.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="text-[#006989] w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="Contoh: Budi Santoso"
                />
              </div>
            </div>

            {/* Username & Phone Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Username */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block text-sm font-medium text-gray-700">Username</label>
                  {usernameAvailable !== null && !checkingUsername && (
                    <span className={`text-xs font-medium ${usernameAvailable ? 'text-green-600' : 'text-red-600'} flex items-center gap-1`}>
                      {usernameAvailable ? <Check size={14} /> : <X size={14} />}
                      {usernameAvailable ? 'Tersedia' : 'Dipakai'}
                    </span>
                  )}
                </div>
                <div className="relative">
                  <UserPlus className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => {
                      const val = e.target.value.toLowerCase().replace(/\s/g, ''); // Hapus spasi
                      setFormData({ ...formData, username: val });
                      checkUsername(val);
                    }}
                    className={`text-[#006989] w-full pl-10 pr-3 py-3 border rounded-xl focus:ring-2 focus:ring-[#006989] transition bg-gray-50 focus:bg-white
                      ${usernameAvailable === false ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-transparent'}
                    `}
                    placeholder="budisantoso"
                  />
                  {checkingUsername && (
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      <div className="h-4 w-4 border-2 border-[#006989] border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </div>
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">No. WhatsApp (Opsional)</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="text-[#006989] w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="0812..."
                  />
                </div>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="text-[#006989] w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition bg-gray-50 focus:bg-white"
                  placeholder="email@anda.com"
                />
              </div>
            </div>

            {/* Passwords Grid */}
            <div className="grid md:grid-cols-2 gap-5">
              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="text-[#006989] w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Konfirmasi Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="text-[#006989] w-full pl-10 pr-10 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition bg-gray-50 focus:bg-white"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-[#006989] to-[#00A6A6] text-white py-3.5 rounded-xl font-bold text-lg hover:shadow-lg hover:opacity-90 transition disabled:opacity-50 mt-4 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mendaftar...
                </>
              ) : (
                'Buat Akun Sekarang'
              )}
            </button>

            {/* Google Login */}
            <div className="mt-6">
              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-300"></div></div>
                <div className="relative flex justify-center text-sm"><span className="px-4 bg-white text-gray-500">atau daftar dengan</span></div>
              </div>
              
              <button
                type="button"
                onClick={handleGoogleSignUp}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Google
              </button>
            </div>

            <div className="text-center mt-6">
              <p className="text-gray-600">
                Sudah punya akun?{' '}
                <Link to="/login" className="text-[#006989] font-bold hover:text-[#005b78] hover:underline">
                  Masuk di sini
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Right Side - Features (2/5 cols) */}
        <div className="hidden lg:block lg:col-span-2 bg-gradient-to-br from-[#006989] to-[#00A6A6] p-12 text-white flex-col justify-between relative overflow-hidden">
          {/* Decorative Circle */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white opacity-10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-60 h-60 bg-black opacity-10 rounded-full blur-3xl"></div>

          <div className="relative z-10">
            <h3 className="text-3xl font-bold mb-6">Kenapa bergabung?</h3>
            <ul className="space-y-6">
              {[
                "Temukan komunitas olahraga lokal",
                "Info turnamen & event terbaru",
                "Booking lapangan lebih mudah",
                "Chat real-time dengan member",
                "Tracking level & progress"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-4">
                  <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center flex-shrink-0">
                    <Check className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-lg font-medium">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-12 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h4 className="font-bold text-xl mb-2">Statistik Platform</h4>
            <div className="flex justify-between items-center text-center mt-4">
              <div>
                <div className="text-3xl font-bold">142+</div>
                <div className="text-sm opacity-80">Komunitas</div>
              </div>
              <div className="h-10 w-px bg-white/30"></div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm opacity-80">Venue</div>
              </div>
              <div className="h-10 w-px bg-white/30"></div>
              <div>
                <div className="text-3xl font-bold">1k+</div>
                <div className="text-sm opacity-80">User</div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Register;