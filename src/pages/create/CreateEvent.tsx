import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import {
  Calendar, Clock, MapPin, Users, DollarSign,
  Upload, X, Plus, ChevronDown, Search,
  AlertCircle, Check
} from 'lucide-react';
import toast from 'react-hot-toast';

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
  const [userCommunities, setUserCommunities] = useState<any[]>([]);
  const [venues, setVenues] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    cover_url: '',
  });
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string>('');
  const [showVenueSearch, setShowVenueSearch] = useState(false);
  const [venueSearch, setVenueSearch] = useState('');
  const [duplicateCheck, setDuplicateCheck] = useState<{ checking: boolean; exists: boolean }>({
    checking: false,
    exists: false,
  });

  useEffect(() => {
    loadUserCommunities();
    loadVenues();
    
    if (communityId) {
      checkUserPermission();
    }
  }, [communityId]);

  const checkUserPermission = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('community_members')
      .select('role')
      .eq('community_id', communityId)
      .eq('user_id', user.id)
      .single();

    if (!data || !['leader', 'admin', 'moderator'].includes(data.role)) {
      toast.error('You need to be a community leader to create events');
      navigate(-1);
    }
  };

  const loadUserCommunities = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('community_members')
      .select('community_id, role, communities(*)')
      .eq('user_id', user.id)
      .eq('role', 'leader')
      .eq('status', 'active');

    if (data) {
      setUserCommunities(data.map(item => item.communities));
      if (!communityId && data.length > 0) {
        setFormData(prev => ({ ...prev, community_id: data[0].community_id }));
      }
    }
  };

  const loadVenues = async () => {
    const { data } = await supabase
      .from('venues')
      .select('*')
      .eq('is_active', true)
      .order('name');

    if (data) {
      setVenues(data);
    }
  };

  const checkDuplicateEvent = async (title: string, startDate: string, startTime: string) => {
    if (!title.trim() || !startDate || !startTime) return;

    setDuplicateCheck({ checking: true, exists: false });

    const startDateTime = `${startDate} ${startTime}:00`;

    const { data, error } = await supabase
      .from('events')
      .select('title')
      .eq('title', title)
      .eq('start_date', startDate)
      .eq('start_time', startTime)
      .single();

    setDuplicateCheck({
      checking: false,
      exists: !!data,
    });
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    setCoverImage(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const uploadCoverImage = async (): Promise<string> => {
    if (!coverImage) return '';

    const fileExt = coverImage.name.split('.').pop();
    const fileName = `${Date.now()}.${fileExt}`;

    const { error } = await supabase.storage
      .from('event-covers')
      .upload(fileName, coverImage);

    if (error) throw error;

    const { data } = supabase.storage
      .from('event-covers')
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (duplicateCheck.exists) {
      toast.error('An event with this name and time already exists');
      return;
    }

    setIsLoading(true);

    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not found');

      // Upload cover image
      let coverUrl = '';
      if (coverImage) {
        coverUrl = await uploadCoverImage();
      }

      // Create event
      const { data: event, error: eventError } = await supabase
        .from('events')
        .insert([{
          ...formData,
          community_id: formData.community_id,
          fee: parseFloat(formData.fee) || 0,
          registered_count: 0,
          cover_url: coverUrl,
          created_by: user.id,
        }])
        .select()
        .single();

      if (eventError) throw eventError;

      // Create notification for community members
      const { data: members } = await supabase
        .from('community_members')
        .select('user_id')
        .eq('community_id', formData.community_id)
        .eq('status', 'active');

      if (members && members.length > 0) {
        const notifications = members.map(member => ({
          user_id: member.user_id,
          type: 'event_created',
          title: 'New Event Created',
          content: `New event "${formData.title}" has been created in your community`,
          data: { event_id: event.id, community_id: formData.community_id },
        }));

        await supabase.from('notifications').insert(notifications);
      }

      toast.success('Event created successfully!');
      navigate(`/event/${event.id}`);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create event');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredVenues = venues.filter(venue =>
    venue.name.toLowerCase().includes(venueSearch.toLowerCase()) ||
    venue.address.toLowerCase().includes(venueSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
          >
            <ChevronDown size={20} className="rotate-90" />
            Back
          </button>
          
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
              <Calendar className="text-white h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Event</h1>
              <p className="text-gray-600">Organize a sports event for your community</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Info */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Event Details</h2>
                
                <div className="space-y-4">
                  {/* Event Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={formData.title}
                        onChange={(e) => {
                          setFormData({ ...formData, title: e.target.value });
                          checkDuplicateEvent(e.target.value, formData.start_date, formData.start_time);
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                        placeholder="e.g., Weekend Social Match"
                      />
                      {duplicateCheck.checking && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <div className="h-5 w-5 border-2 border-purple-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    {duplicateCheck.exists && (
                      <p className="text-sm text-red-600 mt-2 flex items-center gap-2">
                        <AlertCircle size={16} />
                        An event with this name and time already exists
                      </p>
                    )}
                  </div>

                  {/* Community Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Community *
                    </label>
                    <select
                      required
                      value={formData.community_id}
                      onChange={(e) => setFormData({ ...formData, community_id: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                      disabled={!!communityId}
                    >
                      <option value="">Select a community</option>
                      {userCommunities.map(community => (
                        <option key={community.id} value={community.id}>
                          {community.name} ({community.sport_type})
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition resize-none"
                      placeholder="Describe your event, rules, what to bring, etc..."
                    />
                  </div>
                </div>
              </div>

              {/* Date & Time */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  <Clock className="inline mr-2" size={24} />
                  Date & Time
                </h2>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Date *
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        required
                        value={formData.start_date}
                        onChange={(e) => {
                          setFormData({ ...formData, start_date: e.target.value });
                          if (!formData.end_date) {
                            setFormData(prev => ({ ...prev, end_date: e.target.value }));
                          }
                          checkDuplicateEvent(formData.title, e.target.value, formData.start_time);
                        }}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Date (Optional)
                    </label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="date"
                        value={formData.end_date}
                        onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                        min={formData.start_date}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Start Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="time"
                        required
                        value={formData.start_time}
                        onChange={(e) => {
                          setFormData({ ...formData, start_time: e.target.value });
                          checkDuplicateEvent(formData.title, formData.start_date, e.target.value);
                        }}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      End Time *
                    </label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                      <input
                        type="time"
                        required
                        value={formData.end_time}
                        onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MapPin size={24} />
                    Location
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/create-venue')}
                    className="text-purple-600 hover:text-purple-700 text-sm font-medium flex items-center gap-1"
                  >
                    <Plus size={16} />
                    Add New Venue
                  </button>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Venue *
                  </label>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setShowVenueSearch(!showVenueSearch)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition text-left flex justify-between items-center"
                    >
                      <span className="text-gray-700">
                        {formData.venue_id 
                          ? venues.find(v => v.id === formData.venue_id)?.name
                          : 'Select a venue'
                        }
                      </span>
                      <ChevronDown className={`transition ${showVenueSearch ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {showVenueSearch && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg">
                        <div className="p-2 border-b">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                            <input
                              type="text"
                              value={venueSearch}
                              onChange={(e) => setVenueSearch(e.target.value)}
                              placeholder="Search venues..."
                              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-purple-600 focus:border-transparent"
                              autoFocus
                            />
                          </div>
                        </div>
                        <div className="max-h-60 overflow-y-auto">
                          {filteredVenues.map(venue => (
                            <button
                              key={venue.id}
                              type="button"
                              onClick={() => {
                                setFormData({ ...formData, venue_id: venue.id });
                                setShowVenueSearch(false);
                                setVenueSearch('');
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b last:border-b-0"
                            >
                              <div className="font-medium">{venue.name}</div>
                              <div className="text-sm text-gray-500 truncate">{venue.address}</div>
                              <div className="text-sm text-purple-600">
                                Rp {venue.price_per_hour.toLocaleString()}/hour
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {formData.venue_id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium">
                            {venues.find(v => v.id === formData.venue_id)?.name}
                          </div>
                          <div className="text-sm text-gray-600">
                            {venues.find(v => v.id === formData.venue_id)?.address}
                          </div>
                          <div className="flex items-center gap-2 mt-2">
                            <div className="text-sm px-2 py-1 bg-green-100 text-green-800 rounded">
                              {venues.find(v => v.id === formData.venue_id)?.court_count} courts
                            </div>
                            <div className="text-sm px-2 py-1 bg-blue-100 text-blue-800 rounded">
                              ⭐ {venues.find(v => v.id === formData.venue_id)?.rating}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFormData({ ...formData, venue_id: '' })}
                          className="text-red-500 hover:text-red-700"
                        >
                          <X size={20} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Event Settings */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Event Settings</h2>
                
                <div className="grid md:grid-cols-2 gap-6">
                  {/* Capacity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="inline mr-2" size={18} />
                      Capacity *
                    </label>
                    <div className="flex items-center gap-4">
                      <input
                        type="range"
                        min="2"
                        max="100"
                        step="2"
                        value={formData.capacity}
                        onChange={(e) => setFormData({ ...formData, capacity: parseInt(e.target.value) })}
                        className="flex-1"
                      />
                      <div className="text-2xl font-bold text-purple-600">
                        {formData.capacity}
                      </div>
                    </div>
                    <div className="flex justify-between text-sm text-gray-500 mt-2">
                      <span>Small (2)</span>
                      <span>Medium (16)</span>
                      <span>Large (100)</span>
                    </div>
                  </div>

                  {/* Fee */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <DollarSign className="inline mr-2" size={18} />
                      Registration Fee (Rp)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                        Rp
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="1000"
                        value={formData.fee}
                        onChange={(e) => setFormData({ ...formData, fee: e.target.value })}
                        className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  {/* Skill Level */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Skill Level *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {skillLevels.map((level) => (
                        <button
                          key={level.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, level: level.value })}
                          className={`p-2 rounded-lg border-2 transition-all ${formData.level === level.value ? 'border-purple-600 bg-purple-50' : 'border-gray-200 hover:border-gray-300'}`}
                        >
                          <div className={`text-xs font-medium px-2 py-1 rounded-full ${level.color}`}>
                            {level.label}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent transition"
                    >
                      {eventStatuses.map(status => (
                        <option key={status.value} value={status.value}>
                          {status.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Cover Image */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Event Cover Image</h2>
                
                <div className="space-y-4">
                  {coverPreview ? (
                    <div className="relative">
                      <img
                        src={coverPreview}
                        alt="Event cover preview"
                        className="w-full h-48 object-cover rounded-lg"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setCoverImage(null);
                          setCoverPreview('');
                        }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <p className="text-gray-600 mb-2">
                        Upload a cover image for your event (optional)
                      </p>
                      <label className="inline-block">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                        <span className="bg-purple-600 text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition cursor-pointer">
                          Choose Image
                        </span>
                      </label>
                      <p className="text-sm text-gray-500 mt-2">
                        Recommended: 800x400px, max 5MB
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="sticky bottom-4">
                <button
                  type="submit"
                  disabled={isLoading || duplicateCheck.exists}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50 flex items-center justify-center gap-3"
                >
                  {isLoading ? (
                    <>
                      <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Creating Event...
                    </>
                  ) : (
                    <>
                      <Plus size={24} />
                      Create Event
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
              {coverPreview ? (
                <img
                  src={coverPreview}
                  alt="Event preview"
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gradient-to-r from-purple-400 to-pink-400" />
              )}
              
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">
                      {formData.title || 'Event Title'}
                    </h3>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          {formData.start_date ? new Date(formData.start_date).toLocaleDateString('id-ID', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short'
                          }) : 'Select date'}
                        </span>
                      </div>
                      <span className="text-gray-300">•</span>
                      <div className="flex items-center gap-1">
                        <Clock size={16} className="text-gray-400" />
                        <span className="text-gray-600">
                          {formData.start_time} - {formData.end_time}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${skillLevels.find(l => l.value === formData.level)?.color}`}>
                      {skillLevels.find(l => l.value === formData.level)?.label}
                    </div>
                    <div className="text-lg font-bold text-purple-600 mt-2">
                      {parseFloat(formData.fee) > 0 ? `Rp ${parseInt(formData.fee).toLocaleString()}` : 'FREE'}
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex items-center gap-3">
                    <MapPin className="text-gray-400" size={20} />
                    <div className="text-gray-700">
                      {formData.venue_id 
                        ? venues.find(v => v.id === formData.venue_id)?.name || 'Select venue'
                        : 'No venue selected'
                      }
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users className="text-gray-400" size={20} />
                    <div>
                      <div className="text-gray-700">
                        0 / {formData.capacity} registered
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-purple-600 h-2 rounded-full" 
                          style={{ width: '0%' }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t border-gray-200">
                  <div className="text-sm text-gray-500">Preview</div>
                  <div className="text-xs text-gray-400 mt-1">
                    This is how your event will look to members
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl shadow-xl p-6 text-white">
              <h3 className="font-bold text-lg mb-4">Event Stats</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{formData.capacity}</div>
                  <div className="text-sm opacity-90">Max Capacity</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold">0</div>
                  <div className="text-sm opacity-90">Registered</div>
                </div>
              </div>
            </div>

            {/* Tips */}
            <div className="bg-purple-50 border border-purple-100 rounded-xl p-6">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                <Check className="text-purple-600" size={20} />
                Tips for Great Events
              </h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• Choose a catchy title</li>
                <li>• Set clear skill requirements</li>
                <li>• Provide detailed description</li>
                <li>• Set appropriate capacity</li>
                <li>• Choose convenient time</li>
                <li>• Select accessible venue</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateEvent;