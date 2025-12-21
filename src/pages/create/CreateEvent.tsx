import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Calendar, Clock, MapPin, Users, DollarSign,
  Upload, X, Plus, ChevronDown, Search,
  AlertCircle, Check, ArrowLeft, Eye, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- CONSTANTS ---
const skillLevels = [
  { value: 'beginner', label: 'Beginner', color: 'bg-green-100 text-green-800' },
  { value: 'intermediate', label: 'Intermediate', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'advanced', label: 'Advanced', color: 'bg-orange-100 text-orange-800' },
  { value: 'professional', label: 'Professional', color: 'bg-red-100 text-red-800' },
  { value: 'all', label: 'All Levels', color: 'bg-blue-100 text-blue-800' },
];

const eventStatuses = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-100 text-gray-800' },
  { value: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' },
  { value: 'full', label: 'Full', color: 'bg-red-100 text-red-800' },
];

const CreateEvent = () => {
  const navigate = useNavigate();
  const { communityId } = useParams();

  // State Data
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');

  // UI State
  const [showVenueSearch, setShowVenueSearch] = useState(false);
  const [venueSearch, setVenueSearch] = useState('');

  // Form Data
  const [formData, setFormData] = useState({
    community_id: communityId || '',
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    start_time: '14:00',
    end_time: '16:00',
    venue_id: '',
    capacity: 16,
    level: 'intermediate',
    status: 'upcoming',
    fee: '0',
  });

  // --- LOAD DATA ---
  useEffect(() => {
    loadUserCommunities();
    loadVenues();
  }, []);

  const loadUserCommunities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Ambil komunitas dimana user adalah leader/admin
    const { data } = await supabase
      .from('02_anggota') // Pastikan nama tabel ini benar sesuai setup sebelumnya
      .select('community_id, role, community:01_komunitas(*)')
      .eq('user_id', user.id)
      .in('role', ['leader', 'admin']);

    if (data) {
      const comms = data.map((item: any) => item.community);
      setUserCommunities(comms);
      if (!communityId && comms.length > 0) {
        setFormData(prev => ({ ...prev, community_id: comms[0].id }));
      }
    }
  };

  const loadVenues = async () => {
    // Ambil dari tabel venuesnew yg baru kita buat
    const { data } = await supabase
      .from('venuesnew')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) setVenues(data);
  };

  // --- HANDLERS ---
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) return toast.error('Max 5MB');

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Validasi Wajib
    if (!formData.title || !formData.start_date || !formData.start_time || !formData.end_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (!formData.community_id) {
      toast.error('Please select a community');
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Please login first');

      // 2. Upload Cover (Jika ada)
      let coverUrl = '';
      if (coverImage) {
        const fileExt = coverImage.name.split('.').pop();
        const fileName = `event-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('event-covers').upload(fileName, coverImage);

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from('event-covers').getPublicUrl(fileName);
        coverUrl = data.publicUrl;
      }

      // 3. Persiapkan Data (Sanitize)
      // PENTING: Ubah string kosong "" menjadi null untuk field opsional/UUID
      const eventPayload = {
        title: formData.title,
        description: formData.description,
        start_date: formData.start_date,
        end_date: formData.end_date || null, // Handle empty date string
        start_time: formData.start_time,
        end_time: formData.end_time,

        // Konversi angka
        capacity: parseInt(formData.capacity.toString()),
        fee: parseFloat(formData.fee.toString()),

        level: formData.level,
        status: formData.status,
        cover_url: coverUrl,
        created_by: user.id,

        // PENTING: Pastikan ini valid UUID
        community_id: formData.community_id,

        // PENTING: Jika string kosong, kirim NULL
        venue_id: formData.venue_id === '' ? null : formData.venue_id
      };

      console.log("Sending Payload:", eventPayload); // Debugging

      // 4. Insert ke Supabase
      const { data: event, error } = await supabase
        .from('eventsnew')
        .insert([eventPayload])
        .select()
        .single();

      if (error) {
        console.error("Supabase Error:", error);
        throw new Error(error.message);
      }

      toast.success('Event Created! 🚀');
      navigate('/dashboard');

    } catch (error: any) {
      console.error("Catch Error:", error);
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };
  const filteredVenues = venues.filter(v =>
    v.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    v.address.toLowerCase().includes(venueSearch.toLowerCase())
  );

  const selectedVenue = venues.find(v => v.id === formData.venue_id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 transition">
              <ArrowLeft size={20} /> Back
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
            <Eye size={16} /> Live Preview
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">

          {/* --- LEFT: FORM (7/12) --- */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">

              {/* 1. Basic Info */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">1</div>
                  Event Details
                </h3>

                <div className="space-y-4">
                  {/* Community Select (If user has multiple) */}
                  {userCommunities.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Host Community</label>
                      <select
                        value={formData.community_id}
                        onChange={e => setFormData({ ...formData, community_id: e.target.value })}
                        className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
                        disabled={!!communityId}
                      >
                        <option value="">Select Community</option>
                        {userCommunities.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Title *</label>
                    <input
                      type="text" required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
                      placeholder="e.g. Sunday Morning Match"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      rows={3}
                      value={formData.description}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-purple-500"
                      placeholder="Event details, rules, equipment needed..."
                    />
                  </div>
                </div>
              </div>

              {/* 2. Schedule & Venue */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">2</div>
                  Time & Location
                </h3>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                      <input
                        type="date" required
                        value={formData.start_date}
                        onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                        className="w-full px-4 py-2 border rounded-xl"
                      />
                    </div>
                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                        <input type="time" required value={formData.start_time} onChange={e => setFormData({ ...formData, start_time: e.target.value })} className="w-full px-2 py-2 border rounded-xl" />
                      </div>
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                        <input type="time" required value={formData.end_time} onChange={e => setFormData({ ...formData, end_time: e.target.value })} className="w-full px-2 py-2 border rounded-xl" />
                      </div>
                    </div>
                  </div>

                  {/* Venue Search Dropdown */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                    <div
                      className="w-full px-4 py-3 border rounded-xl flex justify-between items-center cursor-pointer hover:bg-gray-50"
                      onClick={() => setShowVenueSearch(!showVenueSearch)}
                    >
                      <span className={selectedVenue ? 'text-gray-900' : 'text-gray-500'}>
                        {selectedVenue ? selectedVenue.name : 'Select a venue...'}
                      </span>
                      <ChevronDown size={16} />
                    </div>

                    {showVenueSearch && (
                      <div className="absolute z-10 w-full mt-2 bg-white border rounded-xl shadow-lg max-h-60 overflow-y-auto p-2">
                        <input
                          type="text"
                          placeholder="Search venue..."
                          className="w-full px-3 py-2 border rounded-lg mb-2 text-sm"
                          autoFocus
                          value={venueSearch}
                          onChange={e => setVenueSearch(e.target.value)}
                        />
                        {filteredVenues.map(v => (
                          <div
                            key={v.id}
                            className="p-3 hover:bg-purple-50 rounded-lg cursor-pointer transition"
                            onClick={() => {
                              setFormData({ ...formData, venue_id: v.id });
                              setShowVenueSearch(false);
                            }}
                          >
                            <div className="font-medium text-gray-900">{v.name}</div>
                            <div className="text-xs text-gray-500 truncate">{v.address}</div>
                          </div>
                        ))}
                        {filteredVenues.length === 0 && <div className="p-3 text-center text-gray-500 text-sm">No venue found</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 3. Capacity & Fee */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">3</div>
                  Capacity & Fee
                </h3>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Max Participants</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min="2" max="50"
                        value={formData.capacity}
                        onChange={e => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        className="flex-1 accent-purple-600"
                      />
                      <span className="font-bold text-purple-600 w-8">{formData.capacity}</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Fee (Rp)</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">Rp</span>
                      <input
                        type="number" step="1000"
                        value={formData.fee}
                        onChange={e => setFormData({ ...formData, fee: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 border rounded-xl"
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
                  <div className="flex flex-wrap gap-2">
                    {skillLevels.map(lvl => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, level: lvl.value })}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${formData.level === lvl.value
                            ? 'bg-purple-600 text-white border-purple-600'
                            : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                          }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 4. Cover Image */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">Cover Image</h3>
                {coverPreview ? (
                  <div className="relative h-48 rounded-xl overflow-hidden group">
                    <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
                    <button
                      type="button"
                      onClick={() => { setCoverImage(null); setCoverPreview(''); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <label className="h-32 border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                    <Upload className="text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Click to upload cover image</span>
                    <input type="file" hidden accept="image/*" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              {/* SUBMIT */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                {isLoading ? <RefreshCw className="animate-spin" /> : <Check />} Create Event
              </button>

            </form>
          </div>

          {/* --- RIGHT: PREVIEW (5/12) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">Event Card Preview</h3>
              </div>

              {/* EVENT CARD PREVIEW */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-200 overflow-hidden relative">

                {/* Image */}
                <div className="h-48 bg-gray-200 relative">
                  {coverPreview ? (
                    <img src={coverPreview} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gradient-to-br from-purple-100 to-pink-100">
                      <Calendar size={40} className="text-purple-300" />
                    </div>
                  )}
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-xs font-bold text-purple-700 shadow-sm uppercase">
                    {formData.level}
                  </div>
                </div>

                {/* Content */}
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h2 className="text-xl font-bold text-gray-900 leading-tight">
                      {formData.title || 'Event Title'}
                    </h2>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Fee</p>
                      <p className="font-bold text-purple-600">
                        {parseInt(formData.fee) > 0 ? `Rp ${parseInt(formData.fee).toLocaleString()}` : 'FREE'}
                      </p>
                    </div>
                  </div>

                  {/* Info Row */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 mt-4">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-purple-500" />
                      <span>{formData.start_date || 'Date'}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={16} className="text-purple-500" />
                      <span>{formData.start_time} - {formData.end_time}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                    <MapPin size={16} className="text-purple-500" />
                    <span className="truncate">{selectedVenue ? selectedVenue.name : 'Venue Location'}</span>
                  </div>

                  {/* Participants Bar */}
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>0 joined</span>
                      <span>{formData.capacity} spots</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 w-0"></div>
                    </div>
                  </div>

                  {/* Join Button Mockup */}
                  <div className="mt-4">
                    <button className="w-full py-2.5 bg-purple-600 text-white rounded-xl font-bold text-sm shadow-md shadow-purple-200">
                      Join Event
                    </button>
                  </div>

                </div>
              </div>

              {/* Tips */}
              <div className="mt-6 bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-800">
                <p className="font-bold mb-1 flex items-center gap-2"><Check size={16} /> Pro Tip</p>
                Events with clear descriptions and good cover photos get 2x more participants!
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateEvent;