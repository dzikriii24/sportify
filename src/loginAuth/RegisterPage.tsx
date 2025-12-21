import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  User, Mail, Lock, Eye, EyeOff, Check, X, 
  Smartphone, ArrowRight, Loader2, Camera, MapPin
} from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import toast, { Toaster } from 'react-hot-toast';

const Register = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // State Form
  const [formData, setFormData] = useState({
    fullName: '',
    username: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    location: '', // Tambahan
  });

  // State File Avatar
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // State UI
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [checkingUsername, setCheckingUsername] = useState(false);
  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  // --- Real-time Username Check ---
  useEffect(() => {
    const checkUsername = async () => {
      if (formData.username.length < 3) {
        setUsernameAvailable(null);
        return;
      }
      setCheckingUsername(true);
      try {
        const { data } = await supabase
          .from('profile_user_fixs') // Cek ke tabel baru
          .select('username')
          .eq('username', formData.username)
          .maybeSingle();

        setUsernameAvailable(!data);
      } catch (error) {
        console.error(error);
      } finally {
        setCheckingUsername(false);
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.username) checkUsername();
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.username]);

  // --- Handle File Upload Preview ---
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Validasi ukuran (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        return toast.error("Ukuran foto maksimal 2MB");
      }

      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  // --- Handle Submit ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return toast.error('Password tidak cocok');
    }
    if (usernameAvailable === false) {
      return toast.error('Username sudah dipakai');
    }

    setIsLoading(true);

    try {
      // 1. Sign Up Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) throw authError;

      if (authData.user) {
        let avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${formData.fullName}`; // Default

        // 2. Upload Avatar jika user memilih file
        if (avatarFile) {
          const fileExt = avatarFile.name.split('.').pop();
          const fileName = `${authData.user.id}-${Math.random()}.${fileExt}`;
          const filePath = `${fileName}`;

          const { error: uploadError } = await supabase.storage
            .from('avatars') // Pastikan bucket 'avatars' sudah dibuat public
            .upload(filePath, avatarFile);

          if (uploadError) {
            toast.error("Gagal upload foto, menggunakan default avatar");
            console.error(uploadError);
          } else {
            const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
            avatarUrl = urlData.publicUrl;
          }
        }

        // 3. Insert ke profile_user_fixs
        const { error: profileError } = await supabase
          .from('profile_user_fixs')
          .insert({
            id: authData.user.id,
            username: formData.username,
            full_name: formData.fullName,
            phone: formData.phone || null,
            location: formData.location || null,
            avatar_url: avatarUrl,
            level: 1,
            xp: 0
          });

        if (profileError) throw profileError;

        toast.success('Akun berhasil dibuat! Silahkan Login.');
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (error: any) {
      toast.error(error.message || 'Gagal mendaftar');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Toaster position="top-center" />

      {/* --- LEFT SIDE: FORM --- */}
      <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24 py-12 bg-white">
        <div className="mx-auto w-full max-w-sm lg:w-96">
          
          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Join <span className="text-[#006989]">Sportify</span>
            </h1>
            <p className="mt-2 text-sm text-gray-600">Buat profil barumu sekarang.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* --- Avatar Upload Section --- */}
            <div className="flex justify-center mb-6">
              <div className="relative group cursor-pointer">
                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-[#006989] bg-gray-100 flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <User className="w-10 h-10 text-gray-400" />
                  )}
                </div>
                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#006989] text-white p-2 rounded-full shadow-lg hover:bg-[#005a75] transition cursor-pointer">
                  <Camera size={16} />
                  <input 
                    id="avatar-upload" 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* Nama Lengkap */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
              <div className="relative">
                <input
                  type="text" required
                  className="block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-[#006989] focus:border-[#006989] sm:text-sm"
                  placeholder="Budi Santoso"
                  value={formData.fullName}
                  onChange={e => setFormData({...formData, fullName: e.target.value})}
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Username & Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1 flex justify-between">
                  Username
                  {checkingUsername ? <Loader2 className="w-3 h-3 animate-spin text-[#006989]" /> : 
                   usernameAvailable !== null && (
                     usernameAvailable ? <Check className="w-3 h-3 text-green-500" /> : <X className="w-3 h-3 text-red-500" />
                   )
                  }
                </label>
                <input
                  type="text" required
                  className={`block w-full px-3 py-3 border rounded-xl focus:outline-none focus:ring-1 sm:text-sm transition
                    ${usernameAvailable === false ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-[#006989]'}`}
                  placeholder="budi_s"
                  value={formData.username}
                  onChange={e => setFormData({...formData, username: e.target.value.toLowerCase().replace(/\s/g, '')})}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
                <div className="relative">
                  <input
                    type="tel"
                    className="block w-full px-3 py-3 pl-9 border border-gray-300 rounded-xl focus:ring-[#006989] focus:border-[#006989] sm:text-sm"
                    placeholder="0812..."
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                  <Smartphone className="w-4 h-4 text-gray-400 absolute left-3 top-3.5" />
                </div>
              </div>
            </div>

            {/* Domisili (Location) - Tambahan agar detail */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Domisili Kota</label>
              <div className="relative">
                <input
                  type="text"
                  className="block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-[#006989] focus:border-[#006989] sm:text-sm"
                  placeholder="Bandung, Jawa Barat"
                  value={formData.location}
                  onChange={e => setFormData({...formData, location: e.target.value})}
                />
                <MapPin className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <div className="relative">
                <input
                  type="email" required
                  className="block w-full px-3 py-3 pl-10 border border-gray-300 rounded-xl focus:ring-[#006989] focus:border-[#006989] sm:text-sm"
                  placeholder="email@anda.com"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                />
                <Mail className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* Passwords */}
            <div className="grid grid-cols-1 gap-4">
               <div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'} required
                    className="block w-full px-3 py-3 pl-10 pr-10 border border-gray-300 rounded-xl focus:ring-[#006989] focus:border-[#006989] sm:text-sm"
                    placeholder="Password"
                    value={formData.password}
                    onChange={e => setFormData({...formData, password: e.target.value})}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'} required
                    className={`block w-full px-3 py-3 pl-10 pr-10 border rounded-xl focus:ring-1 sm:text-sm
                      ${formData.confirmPassword && formData.password !== formData.confirmPassword ? 'border-red-300' : 'border-gray-300 focus:border-[#006989]'}`}
                    placeholder="Konfirmasi Password"
                    value={formData.confirmPassword}
                    onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                  />
                  <Lock className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
                  <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-3 top-3 text-gray-400">
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-bold text-white bg-[#006989] hover:bg-[#005a75] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#006989] disabled:opacity-50 transition-all"
            >
              {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : 'Buat Akun'}
              {!isLoading && <ArrowRight size={18} />}
            </button>

            <p className="mt-2 text-center text-sm text-gray-600">
              Sudah punya akun?{' '}
              <Link to="/login" className="font-medium text-[#006989] hover:underline">
                Masuk sekarang
              </Link>
            </p>
          </form>
        </div>
      </div>
      
      {/* Right Side Image */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <img className="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=2070" alt="Gym" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#006989]/90 to-transparent mix-blend-multiply" />
      </div>
    </div>
  );
};

export default Register;