import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../manual-components/NavbarComunity";
import { Card } from "../manual-components/ui/card";
import { Badge } from "../manual-components/ui/badge";
import { Button } from "../manual-components/ui/button";
import { MapPin, Phone, Clock, Star, Loader2 } from "lucide-react";
import { supabase } from "../lib/supabaseClient"; 

// Tipe data sesuai struktur tabel 'venuesnew'
interface Venue {
  id: string;
  name: string;
  address: string;
  phone: string;
  opening_time: string;
  closing_time: string;
  rating: number;
  court_count: number;
  price_per_hour: number;
  facilities: string[];
  photos: string[];
  sport_categories: string[];
}

const Courts = () => {
    const navigate = useNavigate();
    const [venues, setVenues] = useState<Venue[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"community" | "event">("community");

    // 1. Fetch Data dari Supabase
    useEffect(() => {
        const fetchVenues = async () => {
            try {
                const { data, error } = await supabase
                    .from('venuesnew')
                    .select('*')
                    .eq('is_active', true) // Hanya ambil venue yang aktif
                    .order('created_at', { ascending: false });

                if (error) throw error;

                if (data) {
                    setVenues(data);
                }
            } catch (error) {
                console.error("Error fetching venues:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchVenues();
    }, []);

    // 2. Format Mata Uang (IDR)
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            maximumFractionDigits: 0
        }).format(amount);
    };

    // 3. Format Jam (Hilangkan detik: 08:00:00 -> 08:00)
    const formatTime = (timeString: string) => {
        return timeString?.slice(0, 5) || "N/A";
    };

    // 4. Filtering Logic
    const filteredVenues = venues.filter((venue) =>
        venue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        venue.address.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="max-w-7xl mx-auto p-8">
                <div className="mb-8 animate-fade-in">
                    <h1 className="text-3xl font-bold text-[#006989] mb-2">
                        Sports Venues in Bandung
                    </h1>
                    <p className="text-[#006989]/80 mb-6">
                        Find the perfect court for your next game
                    </p>
                </div>

                {/* Map Placeholder */}
                <Card className="mb-8 overflow-hidden border-border animate-scale-in">
                    <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-96 flex items-center justify-center relative">
                        <div className="text-center z-10">
                            <MapPin className="w-16 h-16 text-primary mx-auto mb-4" />
                            <h3 className="text-xl font-semibold text-foreground mb-2">Interactive Map</h3>
                            <p className="text-muted-foreground">Map integration coming soon</p>
                        </div>
                        {/* Decorative elements */}
                        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0iIzAwNjk4OSIgc3Ryb2tlLXdpZHRoPSIwLjUiIG9wYWNpdHk9IjAuMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50" />
                    </div>
                </Card>

                {/* Loading State */}
                {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="w-10 h-10 text-[#006989] animate-spin" />
                    </div>
                ) : (
                    /* Courts List */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredVenues.map((venue, index) => (
                            <Card
                                key={venue.id}
                                className="p-0 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer border-[#006989] hover:border-[#006989]/80 animate-scale-in flex flex-col h-full"
                                style={{ animationDelay: `${index * 0.1}s` }}
                                onClick={() => navigate(`/venue/${venue.id}`)} // Link ke detail page
                            >
                                {/* Photo Display (Mengambil foto pertama jika ada) */}
                                <div className="h-48 bg-gray-200 relative">
                                    {venue.photos && venue.photos.length > 0 ? (
                                        <img 
                                            src={venue.photos[0]} 
                                            alt={venue.name} 
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
                                            <MapPin size={32} />
                                        </div>
                                    )}
                                    {/* Sport Category Badge */}
                                    <div className="absolute top-2 left-2 flex gap-1">
                                        {venue.sport_categories?.slice(0, 2).map((cat) => (
                                            <Badge key={cat} className="bg-black/60 backdrop-blur-sm text-white hover:bg-black/80 border-none capitalize">
                                                {cat}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div className="p-6 flex flex-col flex-1 space-y-4">
                                    {/* Header Info */}
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="text-lg font-bold text-[#006989] mb-1 line-clamp-1">
                                                {venue.name}
                                            </h3>
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-1">
                                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                    <span className="text-sm font-medium text-foreground">
                                                        {venue.rating?.toFixed(1) || "N/A"}
                                                    </span>
                                                </div>
                                                <span className="text-sm text-muted-foreground">•</span>
                                                <span className="text-sm text-muted-foreground">
                                                    {venue.court_count} courts
                                                </span>
                                            </div>
                                        </div>
                                        {/* Price Badge */}
                                        <Badge className="bg-white border-[#006989] border text-[#006989] hover:bg-[#006989]/5 whitespace-nowrap">
                                            {formatCurrency(venue.price_per_hour)}/jam
                                        </Badge>
                                    </div>

                                    {/* Address & Hours */}
                                    <div className="space-y-2 flex-1">
                                        <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                            <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span className="line-clamp-2">{venue.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Phone className="w-4 h-4 flex-shrink-0" />
                                            <span>{venue.phone || "-"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4 flex-shrink-0" />
                                            <span>
                                                {formatTime(venue.opening_time)} - {formatTime(venue.closing_time)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Facilities */}
                                    <div className="flex flex-wrap gap-2 pt-2 border-t border-border mt-auto">
                                        {venue.facilities?.slice(0, 3).map((facility) => (
                                            <Badge key={facility} variant="secondary" className="text-xs capitalize">
                                                {facility.replace('_', ' ')}
                                            </Badge>
                                        ))}
                                        {venue.facilities?.length > 3 && (
                                            <Badge variant="outline" className="text-xs">
                                                +{venue.facilities.length - 3}
                                            </Badge>
                                        )}
                                    </div>

                                    {/* Action Button */}
                                    <Button className="w-full mt-2 bg-[#006989]/90 hover:bg-[#006989] text-white">
                                        Book Now
                                    </Button>
                                </div>
                            </Card>
                        ))}
                    </div>
                )}

                {!isLoading && filteredVenues.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No courts found matching your search.</p>
                        <Button 
                            variant="outline" 
                            className="mt-4"
                            onClick={() => setSearchTerm("")}
                        >
                            Clear Search
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courts;