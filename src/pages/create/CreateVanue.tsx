import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  MapPin, Clock,
  Star, Upload, X, Plus, ArrowLeft,
  Map, Check, RefreshCw,
  Eye
} from 'lucide-react';
import toast from 'react-hot-toast';

// --- DATA CONSTANTS ---
// (Sama seperti sebelumnya)
const sportOptions = [
  { id: 'futsal', label: 'Futsal', icon: '⚽' },
  { id: 'badminton', label: 'Badminton', icon: '🏸' },
  { id: 'basketball', label: 'Basketball', icon: '🏀' },
  { id: 'tennis', label: 'Tennis', icon: '🎾' },
  { id: 'padel', label: 'Padel', icon: '🎾' },
  { id: 'gym', label: 'Gym', icon: '💪' },
  { id: 'swimming', label: 'Swimming', icon: '🏊' },
  { id: 'volleyball', label: 'Volleyball', icon: '🏐' },
];

const facilitiesOptions = [
  { id: 'locker', label: 'Locker', icon: '🔐' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'shower', label: 'Shower', icon: '🚿' },
  { id: 'wifi', label: 'WiFi', icon: '📶' },
  { id: 'canteen', label: 'Canteen', icon: '☕' },
  { id: 'musholla', label: 'Musholla', icon: '🕌' },
  { id: 'toilet', label: 'Toilet', icon: '🚻' },
  { id: 'ac', label: 'AC', icon: '❄️' },
];

const CreateVenue = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [isParsingMap, setIsParsingMap] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    description: '',
    gmaps_url: '',
    lat: -6.9175,
    lng: 107.6191,
    rating: 4.5,
    court_count: 1,
    price_per_hour: 100000,
    opening_time: '08:00',
    closing_time: '22:00',
    sport_categories: [] as string[],
    facilities: [] as string[],
  });

  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);

  // Auth Check
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Please login first');
        navigate('/login');
      }
    };
    checkAuth();
  }, [navigate]);

  // --- LOGIC: GMAPS & PHOTOS (Sama seperti sebelumnya) ---
  const extractFromGoogleMaps = async () => {
    const url = formData.gmaps_url;
    if (!url) return toast.error('Please enter a Google Maps URL first');
    setIsParsingMap(true);
    let foundLat = null, foundLng = null;

    try {
      const regexAt = /@(-?\d+\.\d+),(-?\d+\.\d+)/;
      const regexData = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/;
      const regexQuery = /[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/;
      
      const matchAt = url.match(regexAt);
      const matchData = url.match(regexData);
      const matchQuery = url.match(regexQuery);

      if (matchAt) { foundLat = parseFloat(matchAt[1]); foundLng = parseFloat(matchAt[2]); }
      else if (matchData) { foundLat = parseFloat(matchData[1]); foundLng = parseFloat(matchData[2]); }
      else if (matchQuery) { foundLat = parseFloat(matchQuery[1]); foundLng = parseFloat(matchQuery[2]); }

      if (foundLat && foundLng) {
        setFormData(prev => ({ ...prev, lat: foundLat!, lng: foundLng! }));
        toast.success('Location updated!');
      } else {
        toast.error('Could not extract coordinates. Please use full URL.');
      }
    } catch (err) { toast.error('Error parsing URL'); } 
    finally { setIsParsingMap(false); }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (photos.length + files.length > 10) return toast.error('Max 10 photos');
    const newPhotos = files.filter(f => f.type.startsWith('image/'));
    setPhotos(prev => [...prev, ...newPhotos]);
    setPhotoPreviews(prev => [...prev, ...newPhotos.map(f => URL.createObjectURL(f))]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotosToSupabase = async () => {
    if (photos.length === 0) return [];
    const urls = [];
    for (const [index, photo] of photos.entries()) {
      const ext = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${ext}`;
      const { error } = await supabase.storage.from('venue-photos').upload(fileName, photo);
      if (!error) {
        const { data } = supabase.storage.from('venue-photos').getPublicUrl(fileName);
        urls.push(data.publicUrl);
      }
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');
      
      const photoUrls = await uploadPhotosToSupabase();
      const { error } = await supabase.from('venuesnew').insert([{
        ...formData, photos: photoUrls, created_by: user.id
      }]);
      if (error) throw error;
      toast.success('Venue Created!');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSelection = (field: 'sport_categories' | 'facilities', value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].includes(value) 
        ? prev[field].filter(item => item !== value) 
        : [...prev[field], value]
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* HEADER */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-2 transition">
              <ArrowLeft size={20} /> Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
            <Eye size={16} /> Live Preview Mode Active
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: FORM INPUTS (Width 7/12) --- */}
          <div className="lg:col-span-7 space-y-6">
            <form id="venue-form" onSubmit={handleSubmit}>
              
              {/* SECTION 1: IDENTITY */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs">1</div>
                  Identity & Description
                </h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                    <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="e.g. Gor Saparua" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="Highlight the best features..." />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Price / Hour (Rp)</label>
                      <input type="number" value={formData.price_per_hour} onChange={e => setFormData({...formData, price_per_hour: Number(e.target.value)})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone (WA)</label>
                      <input type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" placeholder="+62..." />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: SPORTS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center text-xs">2</div>
                  Sports Category
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {sportOptions.map(sport => (
                    <button key={sport.id} type="button" onClick={() => toggleSelection('sport_categories', sport.id)}
                      className={`p-3 rounded-xl border text-sm font-medium transition-all ${formData.sport_categories.includes(sport.id) ? 'border-orange-500 bg-orange-50 text-orange-700' : 'border-gray-200 hover:bg-gray-50'}`}>
                      <div className="text-xl mb-1">{sport.icon}</div>
                      {sport.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* SECTION 3: LOCATION */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-xs">3</div>
                  Location
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input type="text" value={formData.gmaps_url} onChange={e => setFormData({...formData, gmaps_url: e.target.value})} placeholder="Paste Google Maps Link..." className="flex-1 px-4 py-2 border rounded-xl focus:ring-2 focus:ring-blue-500" />
                    <button type="button" onClick={extractFromGoogleMaps} disabled={isParsingMap} className="bg-blue-600 text-white px-4 rounded-xl hover:bg-blue-700 transition">
                      {isParsingMap ? <RefreshCw className="animate-spin" /> : 'Fetch'}
                    </button>
                  </div>
                  <textarea rows={2} value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="Full Address..." className="w-full px-4 py-2 border rounded-xl" />
                  <div className="grid grid-cols-2 gap-4">
                    <input type="number" placeholder="Lat" value={formData.lat} onChange={e => setFormData({...formData, lat: parseFloat(e.target.value)})} className="px-4 py-2 border rounded-xl bg-gray-50" />
                    <input type="number" placeholder="Lng" value={formData.lng} onChange={e => setFormData({...formData, lng: parseFloat(e.target.value)})} className="px-4 py-2 border rounded-xl bg-gray-50" />
                  </div>
                </div>
              </div>

              {/* SECTION 4: FACILITIES & PHOTOS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                  <div className="w-6 h-6 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-xs">4</div>
                  Facilities & Photos
                </h3>
                
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facilities</label>
                  <div className="flex flex-wrap gap-2">
                    {facilitiesOptions.map(fac => (
                      <button key={fac.id} type="button" onClick={() => toggleSelection('facilities', fac.id)}
                        className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${formData.facilities.includes(fac.id) ? 'bg-purple-50 border-purple-200 text-purple-700' : 'bg-gray-50 border-transparent text-gray-600'}`}>
                        {fac.icon} {fac.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Photos ({photos.length}/10)</label>
                  <div className="grid grid-cols-4 gap-2">
                    {photoPreviews.map((src, i) => (
                      <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                        <img src={src} className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removePhoto(i)} className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 flex items-center justify-center transition"><X size={16} /></button>
                      </div>
                    ))}
                    {photos.length < 10 && (
                      <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-50 transition">
                        <Plus className="text-gray-400" />
                        <span className="text-[10px] text-gray-500 mt-1">Add</span>
                        <input type="file" hidden multiple accept="image/*" onChange={handlePhotoUpload} />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 5: DETAILS */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Rating</label>
                        <input type="number" step="0.1" value={formData.rating} onChange={e => setFormData({...formData, rating: parseFloat(e.target.value)})} className="w-full border rounded-lg px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Open</label>
                        <input type="time" value={formData.opening_time} onChange={e => setFormData({...formData, opening_time: e.target.value})} className="w-full border rounded-lg px-2 py-1" />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Close</label>
                        <input type="time" value={formData.closing_time} onChange={e => setFormData({...formData, closing_time: e.target.value})} className="w-full border rounded-lg px-2 py-1" />
                    </div>
                 </div>
              </div>

              <button type="submit" disabled={isLoading} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:bg-blue-700 transition flex items-center justify-center gap-2">
                {isLoading ? <RefreshCw className="animate-spin" /> : <Check />} Save & Publish Venue
              </button>

            </form>
          </div>

          {/* --- RIGHT COLUMN: STICKY PREVIEW (Width 5/12) --- */}
          <div className="lg:col-span-5">
            <div className="sticky top-6">
              
              <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-bold text-gray-500 text-sm uppercase tracking-wide">Mobile Preview</h3>
                <span className="text-xs text-gray-400">Live Update</span>
              </div>

              {/* MOCKUP CONTAINER */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl border-[8px] border-gray-900 overflow-hidden relative" style={{ minHeight: '600px' }}>
                
                {/* Status Bar Mockup */}
                <div className="bg-gray-900 h-6 w-full absolute top-0 z-20 flex justify-center">
                    <div className="h-4 w-32 bg-black rounded-b-xl"></div>
                </div>

                {/* Content */}
                <div className="h-full overflow-y-auto pb-10 bg-gray-50 scrollbar-hide" style={{ maxHeight: '700px' }}>
                  
                  {/* Hero Image */}
                  <div className="relative h-64 bg-gray-200">
                    {photoPreviews.length > 0 ? (
                      <img src={photoPreviews[0]} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Upload size={32} />
                        <span className="text-xs mt-2">No Cover Photo</span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Header Icons */}
                    <div className="absolute top-8 left-4 right-4 flex justify-between text-white">
                      <div className="p-2 bg-black/20 backdrop-blur-md rounded-full"><ArrowLeft size={20} /></div>
                      <div className="flex gap-2">
                        <div className="p-2 bg-black/20 backdrop-blur-md rounded-full"><Map size={20} /></div>
                      </div>
                    </div>

                    {/* Venue Title on Image */}
                    <div className="absolute bottom-4 left-4 right-4 text-white">
                      {formData.sport_categories.length > 0 && (
                        <div className="flex gap-1 mb-2">
                          {formData.sport_categories.slice(0, 3).map(cat => {
                             const sport = sportOptions.find(s => s.id === cat);
                             return <span key={cat} className="text-[10px] bg-blue-600 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">{sport?.label}</span>
                          })}
                        </div>
                      )}
                      <h2 className="text-2xl font-bold leading-tight">{formData.name || 'Venue Name'}</h2>
                      <div className="flex items-center gap-1 text-sm text-gray-200 mt-1">
                        <MapPin size={14} /> 
                        <span className="truncate">{formData.address || 'Address location...'}</span>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 -mt-4 bg-gray-50 rounded-t-3xl relative z-10">
                    
                    {/* Rating & Price */}
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-1">
                        <Star className="fill-yellow-400 text-yellow-400" size={20} />
                        <span className="font-bold text-gray-900">{formData.rating}</span>
                        <span className="text-gray-400 text-sm">({Math.floor(Math.random() * 50) + 10} reviews)</span>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">Starts from</p>
                        <p className="font-bold text-blue-600 text-lg">Rp {formData.price_per_hour.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Facilities Horizontal Scroll */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-3 text-sm">Facilities</h4>
                      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {formData.facilities.length === 0 && <span className="text-xs text-gray-400 italic">No facilities selected</span>}
                        {formData.facilities.map(facId => {
                          const fac = facilitiesOptions.find(f => f.id === facId);
                          return (
                            <div key={facId} className="flex flex-col items-center justify-center min-w-[70px] h-[70px] bg-white rounded-2xl shadow-sm border border-gray-100 p-2">
                              <span className="text-xl mb-1">{fac?.icon}</span>
                              <span className="text-[10px] text-gray-600 text-center leading-tight">{fac?.label}</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-6">
                      <h4 className="font-bold text-gray-900 mb-2 text-sm">About Venue</h4>
                      <p className="text-sm text-gray-500 leading-relaxed">
                        {formData.description || 'Description will appear here. Make it catchy so users want to book!'}
                      </p>
                    </div>

                    {/* Info Cards */}
                    <div className="grid grid-cols-2 gap-3 mb-6">
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="bg-green-100 p-2 rounded-full text-green-600"><Clock size={18} /></div>
                        <div>
                          <p className="text-[10px] text-gray-400">Open Hours</p>
                          <p className="text-xs font-bold text-gray-800">{formData.opening_time} - {formData.closing_time}</p>
                        </div>
                      </div>
                      <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="bg-orange-100 p-2 rounded-full text-orange-600"><Check size={18} /></div>
                        <div>
                          <p className="text-[10px] text-gray-400">Courts</p>
                          <p className="text-xs font-bold text-gray-800">{formData.court_count} Available</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Map Preview */}
                    <div className="rounded-xl overflow-hidden h-32 bg-blue-50 border border-blue-100 relative mb-20 flex items-center justify-center">
                        <div className="text-center">
                            <MapPin className="text-blue-500 mx-auto mb-1" />
                            <p className="text-xs text-blue-600 font-medium">Map View</p>
                            <p className="text-[10px] text-gray-400">{formData.lat.toFixed(4)}, {formData.lng.toFixed(4)}</p>
                        </div>
                    </div>

                  </div>
                </div>

                {/* Floating Bottom Bar Mockup */}
                <div className="absolute bottom-0 left-0 right-0 bg-white border-t p-4 pb-6 z-20 flex items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Total Price</p>
                        <p className="font-bold text-blue-600">Rp {formData.price_per_hour.toLocaleString()}</p>
                    </div>
                    <button className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-lg shadow-blue-200">
                        Book Now
                    </button>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default CreateVenue;