import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient'; // Pastikan path ini benar
import {
  Users, MapPin, Target, Trophy,
  Hash, Type, Globe, Lock,
  Upload, X, Plus, ArrowLeft, Camera
} from 'lucide-react';
import toast from 'react-hot-toast';

// Types
interface CommunityFormData {
  name: string;
  sport_type: string;
  level: string;
  description: string;
  is_public: boolean;
  max_members: number;
  lat: number;
  lng: number;
}

interface SportType {
  value: string;
  label: string;
  icon: string;
}

interface SkillLevel {
  value: string;
  label: string;
  color: string;
}

const sportTypes: SportType[] = [
  { value: 'padel', label: 'Padel', icon: '🎾' },
  { value: 'running', label: 'Running', icon: '🏃' },
  { value: 'soccer', label: 'Soccer', icon: '⚽' },
  { value: 'cycling', label: 'Cycling', icon: '🚴' },
  { value: 'hiking', label: 'Hiking', icon: '🏔️' },
  { value: 'basketball', label: 'Basketball', icon: '🏀' },
  { value: 'badminton', label: 'Badminton', icon: '🏸' },
  { value: 'tennis', label: 'Tennis', icon: '🎾' },
];

const skillLevels: SkillLevel[] = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'professional', label: 'Professional', color: 'bg-red-100 text-red-800' },
];

const CreateCommunity = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<CommunityFormData>({
    name: '',
    sport_type: 'padel',
    level: 'beginner',
    description: '',
    is_public: true,
    max_members: 100,
    lat: -6.9175,
    lng: 107.6191,
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [checkingName, setCheckingName] = useState(false);
  const [nameAvailable, setNameAvailable] = useState<boolean | null>(null);

  // Check authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login first to create a community');
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  const checkCommunityName = async (name: string) => {
    if (!name.trim() || name.length < 3) {
      setNameAvailable(null);
      return;
    }

    setCheckingName(true);
    try {
      // UPDATE: Menggunakan nama tabel unik '01_komunitas'
      const { data, error } = await supabase
        .from('01_komunitas')
        .select('name')
        .eq('name', name.trim())
        .single();

      // Jika ada error (row not found), berarti nama tersedia
      setNameAvailable(!!error);
    } catch (error) {
      setNameAvailable(true);
    } finally {
      setCheckingName(false);
    }
  };

  const generateSlug = (name: string): string => {
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    return name
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/--+/g, '-')
      .trim() + '-' + randomSuffix; // Tambah suffix random biar slug unik
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file (JPEG, PNG, etc.)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setCoverImage(file);
    const previewUrl = URL.createObjectURL(file);
    setCoverPreview(previewUrl);
  };

  const uploadCoverImage = async (): Promise<string> => {
    if (!coverImage) {
      return 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000';
    }

    const fileExt = coverImage.name.split('.').pop();
    const fileName = `cover-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

    const { error } = await supabase.storage
      .from('community-covers')
      .upload(fileName, coverImage);

    if (error) {
      console.error('Upload error:', error);
      throw new Error('Failed to upload image');
    }

    const { data } = supabase.storage
      .from('community-covers')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const validateForm = (): string[] => {
    const errors: string[] = [];

    if (!formData.name.trim()) {
      errors.push('Community name is required');
    } else if (formData.name.length < 3) {
      errors.push('Community name must be at least 3 characters');
    }

    if (formData.description.length > 500) {
      errors.push('Description must be less than 500 characters');
    }

    if (formData.max_members < 2 || formData.max_members > 1000) {
      errors.push('Max members must be between 2 and 1000');
    }

    return errors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    if (nameAvailable === false) {
      toast.error('Community name is already taken');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found. Please login again.');

      // 1. Upload Cover Image
      let coverUrl = 'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000';
      try {
        if (coverImage) {
          coverUrl = await uploadCoverImage();
        }
      } catch (error) {
        console.warn('Using default cover image due to upload error');
      }

      // 2. Prepare PostGIS Location Format
      const locationPoint = `POINT(${formData.lng} ${formData.lat})`;
      const slug = generateSlug(formData.name);

      // 3. Create Community (Tabel: 01_komunitas)
      const { data: community, error: communityError } = await supabase
        .from('01_komunitas')
        .insert([{
          name: formData.name.trim(),
          slug: slug,
          sport_type: formData.sport_type,
          description: formData.description,
          cover_url: coverUrl,
          level: formData.level,
          lat: formData.lat,
          lng: formData.lng,
          location: locationPoint, // Supabase akan convert ini otomatis ke geography
          is_public: formData.is_public,
          max_members: formData.max_members,
          created_by: user.id,
        }])
        .select()
        .single();

      if (communityError) {
        console.error('Community creation error:', communityError);
        throw new Error(communityError.message || 'Failed to create community');
      }

      // 4. Auto-join as Leader (Tabel: 02_anggota)
      const { error: memberError } = await supabase
        .from('02_anggota')
        .insert({
          community_id: community.id,
          user_id: user.id,
          role: 'leader',
          status: 'active',
        });

      if (memberError) {
        console.error('Member creation error:', memberError);
      }

      toast.success('Community created successfully! 🎉');
      // Redirect ke halaman detail (pastikan route ini ada di App.tsx)
      navigate(`/community/${community.slug}`);
      
    } catch (error: any) {
      console.error('Submit error:', error);
      toast.error(error.message || 'Failed to create community. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const bandungLocations = [
    { name: 'Bandung Center', lat: -6.9175, lng: 107.6191 },
    { name: 'Dago', lat: -6.8764, lng: 107.6156 },
    { name: 'Setiabudi', lat: -6.8586, lng: 107.5928 },
    { name: 'Cihampelas', lat: -6.9028, lng: 107.6106 },
    { name: 'Buah Batu', lat: -6.9656, lng: 107.6369 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span>Back</span>
          </button>
          
          <div className="flex flex-col md:flex-row md:items-center gap-6 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-[#006989] to-[#00A6A6] rounded-2xl flex items-center justify-center shadow-lg">
              <Users className="text-white h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                Create New Community
              </h1>
              <p className="text-gray-600 text-lg">
                Bring sports enthusiasts together in Bandung
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Community Name Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Type className="text-[#006989]" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Basic Information</h2>
                </div>
                
                <div className="space-y-6">
                  {/* Community Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Community Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          const value = e.target.value;
                          setFormData({ ...formData, name: value });
                          if (value.length >= 3) {
                            checkCommunityName(value);
                          } else {
                            setNameAvailable(null);
                          }
                        }}
                        className="w-full px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition text-lg"
                        placeholder="e.g., Bandung Padel Elite"
                        maxLength={50}
                      />
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        {checkingName ? (
                          <div className="h-5 w-5 border-2 border-[#006989] border-t-transparent rounded-full animate-spin" />
                        ) : nameAvailable === true ? (
                          <span className="text-green-600 text-sm font-medium">✓ Available</span>
                        ) : nameAvailable === false ? (
                          <span className="text-red-600 text-sm font-medium">✗ Taken</span>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-sm text-gray-500">
                        {formData.name.length}/50 characters
                      </span>
                      {formData.name.length >= 3 && !checkingName && nameAvailable === null && (
                        <span className="text-sm text-amber-600">Checking...</span>
                      )}
                    </div>
                  </div>

                  {/* Sport Type Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Sport Type *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {sportTypes.map((sport) => (
                        <button
                          key={sport.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, sport_type: sport.value })}
                          className={`p-4 rounded-xl border-2 transition-all duration-200 ${formData.sport_type === sport.value 
                            ? 'border-[#006989] bg-blue-50 shadow-sm' 
                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                          }`}
                        >
                          <div className="text-3xl mb-2">{sport.icon}</div>
                          <div className="text-sm font-medium text-gray-900">{sport.label}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Skill Level Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                      Skill Level *
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {skillLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, level: level.value })}
                          className={`p-4 rounded-xl border-2 transition-all ${formData.level === level.value 
                            ? 'border-[#006989]' 
                            : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`text-sm font-medium px-3 py-1.5 rounded-full ${level.color}`}>
                            {level.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Description Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Hash className="text-[#006989]" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Description</h2>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tell us about your community
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full h-48 px-4 py-3.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition resize-none"
                    placeholder="Describe what your community is about, activities, schedule, rules, expectations, etc..."
                    maxLength={500}
                  />
                  <div className="flex justify-between items-center mt-2">
                    <span className="text-sm text-gray-500">
                      {formData.description.length}/500 characters
                    </span>
                    <span className="text-sm text-gray-500">
                      {Math.ceil(formData.description.length / 5)} seconds to read
                    </span>
                  </div>
                </div>
              </div>

              {/* Cover Image Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Camera className="text-[#006989]" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Cover Image</h2>
                </div>
                
                <div className="space-y-4">
                  {coverPreview ? (
                    <div className="relative group">
                      <img
                        src={coverPreview}
                        alt="Cover preview"
                        className="w-full h-64 object-cover rounded-xl"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all rounded-xl flex items-center justify-center">
                        <button
                          type="button"
                          onClick={() => {
                            setCoverImage(null);
                            setCoverPreview('');
                          }}
                          className="opacity-0 group-hover:opacity-100 bg-red-500 text-white p-3 rounded-full hover:bg-red-600 transition-all transform translate-y-2 group-hover:translate-y-0"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <label className="block cursor-pointer">
                      <div className="border-3 border-dashed border-gray-300 rounded-xl p-10 text-center hover:border-[#006989] hover:bg-blue-50 transition-all group">
                        <div className="mb-4">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto group-hover:bg-blue-100 transition-all">
                            <Upload className="h-8 w-8 text-gray-400 group-hover:text-[#006989]" />
                          </div>
                        </div>
                        <p className="text-gray-700 font-medium mb-2">
                          Upload a cover image
                        </p>
                        <p className="text-sm text-gray-500 mb-4">
                          Recommended: 1200x400px • JPG, PNG, or WebP • Max 5MB
                        </p>
                        <span className="inline-block bg-[#006989] text-white px-6 py-2.5 rounded-lg font-medium hover:opacity-90 transition">
                          Choose Image
                        </span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Community Settings Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 border border-gray-200">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Target className="text-[#006989]" size={24} />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Community Settings</h2>
                </div>
                
                <div className="space-y-8">
                  {/* Privacy Settings */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Privacy Settings
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_public: true })}
                        className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${formData.is_public 
                          ? 'border-[#006989] bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${formData.is_public ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Globe className={`h-6 w-6 ${formData.is_public ? 'text-[#006989]' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">Public</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Anyone can see and join without approval
                          </div>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, is_public: false })}
                        className={`p-5 rounded-xl border-2 flex items-center gap-4 transition-all ${!formData.is_public 
                          ? 'border-[#006989] bg-blue-50 shadow-sm' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className={`p-3 rounded-lg ${!formData.is_public ? 'bg-blue-100' : 'bg-gray-100'}`}>
                          <Lock className={`h-6 w-6 ${!formData.is_public ? 'text-[#006989]' : 'text-gray-400'}`} />
                        </div>
                        <div className="text-left">
                          <div className="font-bold text-gray-900">Private</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Members need approval to join
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Max Members */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Maximum Members
                      </label>
                      <span className="text-2xl font-bold text-[#006989]">
                        {formData.max_members}
                      </span>
                    </div>
                    <div className="space-y-3">
                      <input
                        type="range"
                        min="10"
                        max="1000"
                        step="10"
                        value={formData.max_members}
                        onChange={(e) => setFormData({ ...formData, max_members: parseInt(e.target.value) })}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#006989]"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>Small (10)</span>
                        <span>Medium (500)</span>
                        <span>Large (1000)</span>
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      Location in Bandung
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                      {bandungLocations.map((location) => (
                        <button
                          key={location.name}
                          type="button"
                          onClick={() => setFormData({ 
                            ...formData, 
                            lat: location.lat, 
                            lng: location.lng 
                          })}
                          className={`p-3 rounded-lg border text-sm transition-all ${formData.lat === location.lat && formData.lng === location.lng 
                            ? 'border-[#006989] bg-blue-50 text-[#006989] font-medium' 
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {location.name}
                        </button>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-gray-600">
                        <span className="font-medium">Selected:</span>{' '}
                        {bandungLocations.find(l => 
                          l.lat === formData.lat && l.lng === formData.lng
                        )?.name || 'Custom Location'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        Coordinates: {formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-6 bg-gradient-to-t from-white via-white to-transparent pt-6">
                <button
                  type="submit"
                  disabled={isLoading || nameAvailable === false}
                  className="w-full bg-gradient-to-r from-[#006989] via-[#0088a3] to-[#00A6A6] text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Community...
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      Create Community
                    </>
                  )}
                </button>
                <p className="text-center text-sm text-gray-500 mt-3">
                  Your community will be live immediately after creation
                </p>
              </div>
            </form>
          </div>

          {/* Right Column - Preview (Sama seperti sebelumnya) */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden sticky top-6">
              <div className="relative">
                {coverPreview ? (
                  <img
                    src={coverPreview}
                    alt="Community preview"
                    className="w-full h-48 object-cover"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-r from-blue-400 to-cyan-400" />
                )}
                <div className="absolute top-4 right-4">
                  <div className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                    skillLevels.find(l => l.value === formData.level)?.color
                  }`}>
                    {skillLevels.find(l => l.value === formData.level)?.label}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="flex items-start justify-between mb-5">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-2xl font-bold text-gray-900 truncate">
                      {formData.name || 'Community Name'}
                    </h3>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1.5">
                        <Users size={16} className="text-gray-400" />
                        <span className="text-gray-600">0 members</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-600">
                        {sportTypes.find(s => s.value === formData.sport_type)?.label}
                      </span>
                    </div>
                  </div>
                  <div className="text-4xl ml-4">
                    {sportTypes.find(s => s.value === formData.sport_type)?.icon}
                  </div>
                </div>

                <p className="text-gray-600 mb-6 line-clamp-3">
                  {formData.description || 'No description provided yet.'}
                </p>

                <div className="space-y-4 mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {formData.is_public ? (
                        <Globe className="text-gray-600" size={20} />
                      ) : (
                        <Lock className="text-gray-600" size={20} />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {formData.is_public ? 'Public Community' : 'Private Community'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {formData.is_public 
                          ? 'Open for anyone to join' 
                          : 'Requires approval to join'
                        }
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      <Target className="text-gray-600" size={20} />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">Max Members</div>
                      <div className="text-sm text-gray-500">
                        Up to {formData.max_members} members
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500 mb-1">Preview</div>
                  <div className="text-xs text-gray-400">
                    This is how your community will appear to others
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Stats Cards tetap sama... */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateCommunity;