import { useState } from "react";
import Navbar from "../manual-components/NavbarComunity";
import { Card } from "../manual-components/ui/card";
import { Badge } from "../manual-components/ui/badge";
import { Button } from "../manual-components/ui/button";
import { MapPin, Phone, Clock, Star } from "lucide-react";



const courts = [
    {
        id: 1,
        name: "Padel Arena Bandung",
        address: "Jl. Setiabudhi No. 123, Bandung",
        phone: "+62 22 1234 5678",
        hours: "6:00 AM - 10:00 PM",
        rating: 4.8,
        courts: 6,
        price: "Rp 150,000/hour",
        facilities: ["Locker Room", "Cafe", "Pro Shop"],
    },
    {
        id: 2,
        name: "Cihampelas Padel Club",
        address: "Jl. Cihampelas No. 45, Bandung",
        phone: "+62 22 2345 6789",
        hours: "7:00 AM - 9:00 PM",
        rating: 4.6,
        courts: 4,
        price: "Rp 120,000/hour",
        facilities: ["Locker Room", "Parking"],
    },
    {
        id: 3,
        name: "Dago Padel Courts",
        address: "Jl. Ir. H. Djuanda No. 89, Bandung",
        phone: "+62 22 3456 7890",
        hours: "6:00 AM - 11:00 PM",
        rating: 4.9,
        courts: 8,
        price: "Rp 180,000/hour",
        facilities: ["Locker Room", "Cafe", "Pro Shop", "Coaching"],
    },
    {
        id: 4,
        name: "Setrasari Padel Center",
        address: "Jl. Surya Sumantri No. 56, Bandung",
        phone: "+62 22 4567 8901",
        hours: "7:00 AM - 10:00 PM",
        rating: 4.7,
        courts: 5,
        price: "Rp 140,000/hour",
        facilities: ["Locker Room", "Parking", "Cafe"],
    },
    {
        id: 5,
        name: "Bandung Sports Complex - Padel",
        address: "Jl. Soekarno Hatta No. 234, Bandung",
        phone: "+62 22 5678 9012",
        hours: "6:00 AM - 10:00 PM",
        rating: 4.5,
        courts: 10,
        price: "Rp 160,000/hour",
        facilities: ["Locker Room", "Parking", "Cafe", "Pro Shop", "Gym"],
    },
];

const Courts = () => {

    const [searchTerm, setSearchTerm] = useState("");
    const [activeTab, setActiveTab] = useState<"community" | "event">("community");

    const filteredCourts = courts.filter((court) =>
        court.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        court.address.toLowerCase().includes(searchTerm.toLowerCase())
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
                        Padel Courts in Bandung
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

                {/* Courts List */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredCourts.map((court, index) => (
                        <Card
                            key={court.id}
                            className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer border-[#006989] hover:border-[#006989]/80 animate-scale-in text-[#006989]"
                            style={{ animationDelay: `${index * 0.1}s` }}
                        >
                            <div className="space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h3 className="text-lg font-bold text-foreground mb-1">
                                            {court.name}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1">
                                                <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                                <span className="text-sm font-medium text-foreground">{court.rating}</span>
                                            </div>
                                            <span className="text-sm text-muted-foreground">•</span>
                                            <span className="text-sm text-muted-foreground">{court.courts} courts</span>
                                        </div>
                                    </div>
                                    <Badge className="bg-transparent border-[#006989] border-1 text-primary-foreground">
                                        {court.price}
                                    </Badge>
                                </div>

                                {/* Details */}
                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                        <span>{court.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Phone className="w-4 h-4 flex-shrink-0" />
                                        <span>{court.phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="w-4 h-4 flex-shrink-0" />
                                        <span>{court.hours}</span>
                                    </div>
                                </div>

                                {/* Facilities */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
                                    {court.facilities.map((facility) => (
                                        <Badge key={facility} variant="default" className="text-xs">
                                            {facility}
                                        </Badge>
                                    ))}
                                </div>

                                {/* Action */}
                                <Button className="w-full mt-2 bg-[#006989]/80 hover:bg-[#006989] text-[#EAEBED]">
                                    Book Court
                                </Button>
                            </div>
                        </Card>
                    ))}
                </div>

                {filteredCourts.length === 0 && (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No courts found matching your search.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Courts;
