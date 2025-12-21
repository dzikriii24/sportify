import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import Navbar from "../manual-components/NavbarComunity";
import { Button } from "../manual-components/ui/button";
import { Badge } from "../manual-components/ui/badge";
import { 
  MapPin, Phone, Clock, Star, ArrowLeft, 
  Share2, Heart, Check, ChevronRight, Loader2 
} from "lucide-react";
import toast from "react-hot-toast";

// Interface Data (Sama seperti sebelumnya)
interface Venue {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  gmaps_url: string;
  lat: number;
  lng: number;
  rating: number;
  court_count: number;
  price_per_hour: number;
  opening_time: string;
  closing_time: string;
  facilities: string[];
  photos: string[];
  sport_categories: string[];
}

const VenueDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [venue, setVenue] = useState<Venue | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);

  // 1. Fetch Data Venue berdasarkan ID URL
  useEffect(() => {
    const fetchVenueDetail = async () => {
      if (!id) return;
      
      try {
        const { data, error } = await supabase
          .from('venuesnew')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        setVenue(data);
      } catch (error) {
        console.error("Error:", error);
        toast.error("Gagal memuat detail venue");
        navigate("/courts"); // Redirect jika error
      } finally {
        setIsLoading(false);
      }
    };

    fetchVenueDetail();
  }, [id, navigate]);

  // Format Helper
  const formatCurrency = (val: number) => 
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  
  const formatTime = (time: string) => time?.slice(0, 5);

  // Loading State
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#006989] animate-spin" />
      </div>
    );
  }

  if (!venue) return null;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">

      {/* HEADER / BREADCRUMB */}
      <div className="bg-white border-b sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)} 
            className="flex items-center gap-2 text-gray-600 hover:text-[#006989] transition"
          >
            <ArrowLeft size={20} /> <span className="font-medium">Back</span>
          </button>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon"><Share2 size={20} /></Button>
            <Button variant="ghost" size="icon"><Heart size={20} /></Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* --- LEFT COLUMN: PHOTOS & INFO (8/12) --- */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* 1. PHOTO GALLERY */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 p-1">
              <div className="relative aspect-video rounded-2xl overflow-hidden bg-gray-100">
                {venue.photos?.length > 0 ? (
                  <img 
                    src={venue.photos[selectedPhotoIndex]} 
                    alt={venue.name} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full text-gray-400">No Photos Available</div>
                )}
                <div className="absolute top-4 left-4 flex gap-2">
                  {venue.sport_categories?.map(cat => (
                    <Badge key={cat} className="bg-white/90 text-black hover:bg-white capitalize">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
              
              {/* Thumbnails */}
              {venue.photos?.length > 1 && (
                <div className="flex gap-2 p-2 overflow-x-auto">
                  {venue.photos.map((photo, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedPhotoIndex(idx)}
                      className={`relative w-20 h-20 flex-shrink-0 rounded-xl overflow-hidden border-2 transition ${
                        selectedPhotoIndex === idx ? 'border-[#006989]' : 'border-transparent opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img src={photo} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. MAIN INFO */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{venue.name}</h1>
                  <div className="flex items-center gap-2 text-gray-500 mb-4">
                    <MapPin size={18} />
                    <span>{venue.address}</span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <div className="flex items-center gap-1 bg-yellow-50 text-yellow-700 px-3 py-1 rounded-full border border-yellow-100">
                      <Star size={16} fill="currentColor" /> 
                      <span className="font-bold">{venue.rating}</span> 
                      <span className="opacity-70">(Reviews)</span>
                    </div>
                    <div className="flex items-center gap-1 bg-green-50 text-green-700 px-3 py-1 rounded-full border border-green-100">
                      <Check size={16} /> 
                      <span className="font-bold">{venue.court_count}</span> Courts
                    </div>
                  </div>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-2">About this venue</h3>
                <p>{venue.description || "No description provided."}</p>
              </div>

              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-4">Facilities</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {venue.facilities?.map(fac => (
                    <div key={fac} className="flex items-center gap-2 p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <Check size={16} className="text-[#006989]" />
                      <span className="text-sm font-medium capitalize">{fac.replace('_', ' ')}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 3. MAP LOCATION (Embed OpenStreetMap) */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Location</h3>
              <div className="rounded-2xl overflow-hidden h-[300px] bg-gray-100 relative z-0">
                {/* Kita gunakan iframe OpenStreetMap sederhana berdasarkan lat/lng */}
                <iframe 
                  width="100%" 
                  height="100%" 
                  frameBorder="0" 
                  scrolling="no" 
                  marginHeight={0} 
                  marginWidth={0} 
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${venue.lng-0.01}%2C${venue.lat-0.01}%2C${venue.lng+0.01}%2C${venue.lat+0.01}&layer=mapnik&marker=${venue.lat}%2C${venue.lng}`}
                  style={{ border: 0 }}
                ></iframe>
              </div>
              <div className="mt-4 flex justify-end">
                <a 
                  href={venue.gmaps_url || `https://www.google.com/maps/search/?api=1&query=${venue.lat},${venue.lng}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="flex items-center gap-2 text-[#006989] font-medium hover:underline"
                >
                  Open in Google Maps <ChevronRight size={16} />
                </a>
              </div>
            </div>

          </div>

          {/* --- RIGHT COLUMN: BOOKING CARD (4/12) --- */}
          <div className="lg:col-span-4">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-200 p-6 sticky top-24">
              <div className="flex justify-between items-end mb-6">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Start from</p>
                  <div className="text-3xl font-bold text-[#006989]">
                    {formatCurrency(venue.price_per_hour)}
                    <span className="text-base font-normal text-gray-400">/hour</span>
                  </div>
                </div>
                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">
                  Available Today
                </Badge>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Clock size={20} className="text-[#006989]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Operational Hours</p>
                      <p className="font-medium text-gray-900">
                        {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="bg-white p-2 rounded-lg shadow-sm">
                      <Phone size={20} className="text-[#006989]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 uppercase font-bold">Contact</p>
                      <p className="font-medium text-gray-900">{venue.phone || "-"}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button className="w-full h-12 text-lg bg-[#006989] hover:bg-[#005a75] shadow-lg shadow-blue-900/20">
                  Book Now
                </Button>
                
                {venue.phone && (
                  <Button 
                    variant="outline" 
                    className="w-full h-12 border-[#006989] text-[#006989] hover:bg-blue-50"
                    onClick={() => {
                        // Format nomor HP (ganti 08xx jadi 628xx)
                        let phone = venue.phone.replace(/\D/g, '');
                        if (phone.startsWith('0')) phone = '62' + phone.slice(1);
                        window.open(`https://wa.me/${phone}`, '_blank');
                    }}
                  >
                    Chat on WhatsApp
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-gray-400 mt-4">
                No booking fees • Secure payment
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default VenueDetail;