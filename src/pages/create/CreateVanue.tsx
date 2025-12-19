import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  MapPin, Phone, Clock, DollarSign,
  Star, Upload, X, Plus, ArrowLeft,
  Wifi, Car, ShowerHead, Coffee, ShoppingBag,
  Map, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

const facilitiesOptions = [
  { id: 'locker_room', label: 'Locker Room', icon: '👕' },
  { id: 'parking', label: 'Parking', icon: '🅿️' },
  { id: 'shower', label: 'Shower', icon: '🚿' },
  { id: 'cafe', label: 'Cafe/Restaurant', icon: '☕' },
  { id: 'pro_shop', label: 'Pro Shop', icon: '🛍️' },
  { id: 'wifi', label: 'Free WiFi', icon: '📶' },
  { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
  { id: 'lighting', label: 'Good Lighting', icon: '💡' },
];

const CreateVenue = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    lat: -6.9175,
    lng: 107.6191,
    rating: 4.5,
    court_count: 4,
    price_per_hour: 120000,
    phone: '',
    opening_time: '07:00',
    closing_time: '21:00',
    description: '',
    facilities: [] as string[],
  });
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = useState<string[]>([]);
  const [duplicateCheck, setDuplicateCheck] = useState<{ checking: boolean; exists: boolean }>({
    checking: false,
    exists: false,
  });

  // Check if user is admin
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error('Please login first');
        navigate('/login');
        return;
      }

      const { data: userData } = await supabase
        .from('users')
        .select('username')
        .eq('id', user.id)
        .single();

      if (userData?.username !== 'admin') {
        toast.error('Only admins can create venues');
        navigate(-1);
      }
    };
    checkAdmin();
  }, [navigate]);

  const checkDuplicateVenue = async (name: string, address: string) => {
    if (!name.trim() || !address.trim()) return;

    setDuplicateCheck({ checking: true, exists: false });

    const { data, error } = await supabase
      .from('venues')
      .select('name')
      .eq('name', name)
      .eq('address', address)
      .single();

    setDuplicateCheck({
      checking: false,
      exists: !!data,
    });
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (photos.length + files.length > 10) {
      toast.error('Maximum 10 photos allowed');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });

    setPhotos(prev => [...prev, ...validFiles]);
    
    const newPreviews = validFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(prev => [...prev, ...newPreviews]);
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    setPhotoPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const uploadPhotos = async (): Promise<string[]> => {
    if (photos.length === 0) return [];

    const uploadPromises = photos.map(async (photo, index) => {
      const fileExt = photo.name.split('.').pop();
      const fileName = `${Date.now()}-${index}.${fileExt}`;

      const { error } = await supabase.storage
        .from('venue-photos')
        .upload(fileName, photo);

      if (error) throw error;

      const { data } = supabase.storage
        .from('venue-photos')
        .getPublicUrl(fileName);

      return data.publicUrl;
    });

    return Promise.all(uploadPromises);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (duplicateCheck.exists) {
      toast.error('A venue with this name and address already exists');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Upload photos
      let photoUrls: string[] = [];
      try {
        photoUrls = await uploadPhotos();
      } catch (error) {
        console.warn('Failed to upload photos');
      }

      // Create venue
      const { data: venue, error: venueError } = await supabase
        .from('venues')
        .insert([{
          ...formData,
          photos: photoUrls,
          facilities: formData.facilities,
          is_active: true,
          created_by: user.id,
        }])
        .select()
        .single();

      if (venueError) throw venueError;

      toast.success('Venue created successfully!');
      navigate(`/venue/${venue.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create venue');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFacilityToggle = (facilityId: string) => {
    setFormData(prev => ({
      ...prev,
      facilities: prev.facilities.includes(facilityId)
        ? prev.facilities.filter(id => id !== facilityId)
        : [...prev.facilities, facilityId]
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-emerald-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
              <MapPin className="text-white h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
              <p className="text-gray-600">Register a sports venue in Bandung</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Basic Information</h2>
                
                <div className="space-y-4">
                  {/* Venue Name */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Venue Name *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          checkDuplicateVenue(e.target.value, formData.address);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        placeholder="e.g., Cihampelas Padel Club"
                      />
                      {duplicateCheck.checking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="h-5 w-5 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {duplicateCheck.exists && (
                      <p className="text-sm text-red-600 mt-2">
                        ⚠️ A venue with this name and address already exists
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address *
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <textarea
                        required
                        value={formData.address}
                        onChange={(e) => {
                          setFormData({ ...formData, address: e.target.value });
                          checkDuplicateVenue(formData.name, e.target.value);
                        }}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition resize-none"
                        rows={3}
                        placeholder="Full address including street, district, city"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        placeholder="+62 22 2345 6789"
                      />
                    </div>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition resize-none"
                      placeholder="Describe the venue, features, atmosphere..."
                    />
                  </div>
                </div>
              </div>

              {/* Location Coordinates */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-6">
                  <Map className="text-emerald-600" size={24} />
                  <h2 className="text-xl font-bold text-gray-900">Location Coordinates</h2>
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lat}
                      onChange={(e) => setFormData({ ...formData, lat: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.lng}
                      onChange={(e) => setFormData({ ...formData, lng: parseFloat(e.target.value) })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                    />
                  </div>
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    <div className="font-medium mb-1">Current Coordinates:</div>
                    <div>Latitude: {formData.lat}</div>
                    <div>Longitude: {formData.lng}</div>
                  </div>
                </div>
              </div>

              {/* Venue Details */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Venue Details</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Star size={18} />
                      Rating (0-5)
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="text-2xl font-bold text-emerald-600">
                        {formData.rating.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>0</span>
                      <span>2.5</span>
                      <span>5</span>
                    </div>
                  </div>

                  {/* Court Count */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Number of Courts *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        step="1"
                        value={formData.court_count}
                        onChange={(e) => setFormData({ ...formData, court_count: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="text-2xl font-bold text-emerald-600">
                        {formData.court_count}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>1</span>
                      <span>10</span>
                      <span>20</span>
                    </div>
                  </div>

                  {/* Price */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <DollarSign size={18} />
                      Price per Hour (Rp) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        required
                        min="0"
                        step="10000"
                        value={formData.price_per_hour}
                        onChange={(e) => setFormData({ ...formData, price_per_hour: parseInt(e.target.value) })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  {/* Operating Hours */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                      <Clock size={18} />
                      Operating Hours
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Opening</div>
                        <input
                          type="time"
                          value={formData.opening_time}
                          onChange={(e) => setFormData({ ...formData, opening_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        />
                      </div>
                      <div>
                        <div className="text-sm text-gray-600 mb-1">Closing</div>
                        <input
                          type="time"
                          value={formData.closing_time}
                          onChange={(e) => setFormData({ ...formData, closing_time: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-600 focus:border-transparent transition"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Facilities */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Facilities</h2>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {facilitiesOptions.map(facility => (
                    <button
                      key={facility.id}
                      type="button"
                      onClick={() => handleFacilityToggle(facility.id)}
                      className={`p-4 rounded-xl border-2 transition-all ${formData.facilities.includes(facility.id) ? 'border-emerald-600 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <div className="text-2xl mb-2">{facility.icon}</div>
                      <div className="text-sm font-medium">{facility.label}</div>
                      {formData.facilities.includes(facility.id) && (
                        <div className="mt-2">
                          <Check className="text-emerald-600 mx-auto" size={18} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Photos */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Upload size={24} />
                    Photos
                  </h2>
                  <span className="text-sm text-gray-500">
                    {photoPreviews.length}/10 photos
                  </span>
                </div>
                
                <div className="space-y-4">
                  {photoPreviews.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photoPreviews.map((preview, index) => (
                        <div key={index} className="relative">
                          <img
                            src={preview}
                            alt={`Venue ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removePhoto(index)}
                            className="absolute top-1 right-1 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Upload venue photos (max 10)
                      </p>
                      <p className="text-sm text-gray-500 mb-4">
                        Show different angles, facilities, and atmosphere
                      </p>
                    </div>
                  )}

                  {photoPreviews.length < 10 && (
                    <label className="inline-block">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoUpload}
                        multiple
                        className="hidden"
                      />
                      <span className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:opacity-90 transition cursor-pointer inline-flex items-center gap-2">
                        <Plus size={20} />
                        Add Photos
                      </span>
                    </label>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-4">
                <button
                  type="submit"
                  disabled={isLoading || duplicateCheck.exists}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Venue...
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      Add Venue
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* Right Column - Preview */}
          <div className="space-y-6">
            {/* Preview Card */}
            <div className="bg-white rounded-xl shadow-xl overflow-hidden sticky top-4">
              {photoPreviews.length > 0 ? (
                <img
                  src={photoPreviews[0]}
                  alt="Venue preview"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-emerald-400 to-teal-400" />
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formData.name || 'Venue Name'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Star size={16} className="text-yellow-500" />
                        <span className="text-gray-700">{formData.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <span className="text-gray-700">{formData.court_count} courts</span>
                      <span className="text-gray-300">•</span>
                      <span className="text-emerald-600 font-medium">
                        Rp {formData.price_per_hour.toLocaleString()}/hour
                      </span>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-start gap-3">
                    <MapPin className="text-gray-400 mt-1" size={20} />
                    <div className="text-gray-700">
                      {formData.address || 'No address provided'}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Clock className="text-gray-400" size={20} />
                    <div className="text-gray-700">
                      {formData.opening_time} - {formData.closing_time}
                    </div>
                  </div>
                  
                  {formData.phone && (
                    <div className="flex items-center gap-3">
                      <Phone className="text-gray-400" size={20} />
                      <div className="text-gray-700">{formData.phone}</div>
                    </div>
                  )}
                </div>

                {/* Facilities Preview */}
                {formData.facilities.length > 0 && (
                  <div className="mb-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Facilities
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.facilities.map(facilityId => {
                        const facility = facilitiesOptions.find(f => f.id === facilityId);
                        return facility ? (
                          <div
                            key={facilityId}
                            className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                          >
                            {facility.icon} {facility.label}
                          </div>
                        ) : null;
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Preview</div>
                  <div className="text-xs text-gray-400 mt-1">
                    This is how your venue will look to users
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinates Info */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Map className="text-emerald-600" size={20} />
                Bandung Coordinates
              </h3>
              <div className="space-y-2 text-sm text-gray-700">
                <div><span className="font-medium">Center:</span> -6.9175, 107.6191</div>
                <div><span className="font-medium">Dago:</span> -6.8764, 107.6156</div>
                <div><span className="font-medium">Setiabudi:</span> -6.8586, 107.5928</div>
                <div><span className="font-medium">Cihampelas:</span> -6.9028, 107.6106</div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Check className="text-blue-600" size={20} />
                Venue Guidelines
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Provide accurate coordinates</li>
                <li>• Include clear photos</li>
                <li>• List all facilities</li>
                <li>• Set realistic pricing</li>
                <li>• Update operating hours</li>
                <li>• Verify contact information</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateVenue;