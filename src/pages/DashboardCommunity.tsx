import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Plus, Users, Calendar, MapPin, 
  Search, Filter, ChevronDown, 
  Sparkles, Trophy, TrendingUp 
} from "lucide-react";
import Navbar from "../manual-components/NavbarComunity";
import LeftSidebar from "../manual-components/LeftSidebar";
import RightSidebar from "../manual-components/RightSideBar";
import CommunityCard from "../manual-components/CommunityCard";
import EventCard from "../manual-components/EventCard";
import CreateCommunity from "./create/CreateCommunity";
import CreateEvent from "./create/CreateEvent";
import CreateVenue from "./create/CreateVanue";

// Mock data
const communities = [
  {
    name: "Bandung Padel Elite",
    sport: "Padel",
    memberCount: 142,
    members: [
      { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1" },
      { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2" },
      { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3" },
      { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4" },
    ],
    level: "Advanced",
    description: "Premier padel community in Bandung for advanced players. Weekly tournaments and coaching sessions.",
    trending: true,
    slug: "bandung-padel-elite"
  },
  {
    name: "Weekend Warriors",
    sport: "Padel",
    memberCount: 89,
    members: [
      { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user5" },
      { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user6" },
      { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user7" },
      { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user8" },
    ],
    level: "Intermediate",
    description: "Casual padel players meeting every weekend for friendly matches and social events.",
    slug: "weekend-warriors"
  },
  {
    name: "Padel Newbies BDG",
    sport: "Padel",
    memberCount: 67,
    members: [
      { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user9" },
      { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user10" },
      { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user11" },
      { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user12" },
    ],
    level: "Beginner",
    description: "Welcoming community for those new to padel. Learn the basics and make new friends!",
    slug: "padel-newbies-bdg"
  },
  {
    name: "Pro Players Club",
    sport: "Padel",
    memberCount: 156,
    members: [
      { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user13" },
      { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user14" },
      { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user15" },
      { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user16" },
    ],
    level: "Professional",
    description: "Elite level players competing in national and regional tournaments.",
    trending: true,
    slug: "pro-players-club"
  },
];

const events = [
  {
    id: 1,
    title: "Bandung Summer Cup 2024",
    date: "June 15-17, 2024",
    time: "9:00 AM - 6:00 PM",
    location: "Padel Arena Bandung",
    participants: 32,
    maxParticipants: 64,
    level: "All Levels",
    status: "open" as const,
    communitySlug: "bandung-padel-elite",
    fee: 250000,
    coverUrl: "https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1000"
  },
  {
    id: 2,
    title: "Weekend Social Match",
    date: "May 25, 2024",
    time: "2:00 PM - 5:00 PM",
    location: "Cihampelas Padel Club",
    participants: 16,
    maxParticipants: 16,
    level: "Intermediate",
    status: "full" as const,
    communitySlug: "weekend-warriors",
    fee: 120000,
    coverUrl: "https://images.unsplash.com/photo-1622279446713-2d5d41c43c4c?q=80&w=1000"
  },
  {
    id: 3,
    title: "Beginners Workshop",
    date: "June 1, 2024",
    time: "10:00 AM - 12:00 PM",
    location: "Dago Padel Courts",
    participants: 8,
    maxParticipants: 20,
    level: "Beginner",
    status: "open" as const,
    communitySlug: "padel-newbies-bdg",
    fee: 75000,
    coverUrl: "https://images.unsplash.com/photo-1595435934247-5d33b7a5d7e3?q=80&w=1000"
  },
  {
    id: 4,
    title: "Pro Training Camp",
    date: "June 20-22, 2024",
    time: "8:00 AM - 4:00 PM",
    location: "Bandung Sports Complex",
    participants: 12,
    maxParticipants: 15,
    level: "Advanced",
    status: "upcoming" as const,
    communitySlug: "pro-players-club",
    fee: 500000,
    coverUrl: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?q=80&w=1000"
  },
];

const DashboardCommunity = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"community" | "event">("community");
  const [searchTerm, setSearchTerm] = useState("");
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [selectedCommunityForEvent, setSelectedCommunityForEvent] = useState<string | null>(null);
  const [showLevelFilter, setShowLevelFilter] = useState(false);
  const [selectedLevel, setSelectedLevel] = useState<string>("All");
  
  // Filter communities user is leader of (for event creation)
  const userLeaderCommunities = communities.filter(c => 
    ["Bandung Padel Elite", "Weekend Warriors"].includes(c.name)
  );

  const filteredCommunities = communities.filter(c =>
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLevel === "All" || c.level === selectedLevel)
  );

  const filteredEvents = events.filter(e =>
    e.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (selectedLevel === "All" || e.level === selectedLevel)
  );

  const handleCreateCommunity = () => {
    navigate("/create-community");
  };

  const handleCreateEvent = (communitySlug?: string) => {
    if (communitySlug) {
      navigate(`/create-event/${communitySlug}`);
    } else {
      // Show modal to select community
      setSelectedCommunityForEvent(null);
      navigate("/create-event");
    }
  };

  const handleCreateVenue = () => {
    navigate("/create-venue");
  };

  const handleJoinCommunity = (communitySlug: string) => {
    // Navigate to community detail page
    navigate(`/community/${communitySlug}`);
  };

  const handleViewEvent = (eventId: number) => {
    // Navigate to event detail page
    navigate(`/event/${eventId}`);
  };

  const levels = ["All", "Beginner", "Intermediate", "Advanced", "Professional"];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-blue-50">
      <Navbar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
      />

      <div className="flex">
        <LeftSidebar />

        {/* Main Content */}
        <main className="flex-1 p-6 lg:p-8 max-w-6xl mx-auto">
          {/* Header Section */}
          <div className="mb-8 animate-fade-in">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
              <div>
                <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                  {activeTab === "community" ? "🎾 Padel Communities" : "📅 Upcoming Events"}
                </h1>
                <p className="text-gray-600 text-lg">
                  {activeTab === "community"
                    ? "Discover and join padel communities in Bandung"
                    : "Find exciting padel events and tournaments"}
                </p>
              </div>

              {/* Create Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowCreateMenu(!showCreateMenu)}
                  className="flex items-center gap-2 bg-gradient-to-r from-[#006989] to-[#00A6A6] text-white px-6 py-3 rounded-xl font-medium hover:opacity-90 transition-all shadow-lg hover:shadow-xl"
                >
                  <Plus size={20} />
                  Create New
                  <ChevronDown size={16} className={`transition-transform ${showCreateMenu ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {showCreateMenu && (
                  <>
                    <div 
                      className="fixed inset-0 z-40" 
                      onClick={() => setShowCreateMenu(false)}
                    />
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 z-50 overflow-hidden animate-fade-in">
                      <div className="p-2">
                        <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Create New
                        </div>
                        
                        <button
                          onClick={() => {
                            handleCreateCommunity();
                            setShowCreateMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50 rounded-lg transition"
                        >
                          <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="text-blue-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Community</div>
                            <div className="text-sm text-gray-500">Create a new sports community</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            handleCreateEvent();
                            setShowCreateMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-purple-50 rounded-lg transition"
                        >
                          <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                            <Calendar className="text-purple-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Event</div>
                            <div className="text-sm text-gray-500">Organize an event for your community</div>
                          </div>
                        </button>

                        <button
                          onClick={() => {
                            handleCreateVenue();
                            setShowCreateMenu(false);
                          }}
                          className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-emerald-50 rounded-lg transition"
                        >
                          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                            <MapPin className="text-emerald-600" size={20} />
                          </div>
                          <div>
                            <div className="font-medium text-gray-900">Venue</div>
                            <div className="text-sm text-gray-500">Add a new sports venue in Bandung</div>
                          </div>
                        </button>
                      </div>
                      
                      <div className="border-t border-gray-200 p-3 bg-gray-50">
                        <div className="text-xs text-gray-500">
                          You must be a community leader to create events
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Stats and Filters */}
            <div className="flex flex-col lg:flex-row gap-4 mb-6">
              {/* Stats Cards */}
              <div className="flex gap-4 overflow-x-auto pb-2">
                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 min-w-max">
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Users className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {activeTab === "community" 
                        ? communities.reduce((sum, c) => sum + c.memberCount, 0).toLocaleString() 
                        : events.reduce((sum, e) => sum + e.participants, 0).toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeTab === "community" ? "Total Members" : "Total Participants"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 min-w-max">
                  <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Calendar className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {activeTab === "community" ? communities.length : events.length}
                    </div>
                    <div className="text-sm text-gray-600">
                      {activeTab === "community" ? "Communities" : "Events"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 min-w-max">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <TrendingUp className="text-green-600" size={20} />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      {communities.filter(c => c.trending).length}
                    </div>
                    <div className="text-sm text-gray-600">Trending Now</div>
                  </div>
                </div>
              </div>

              {/* Search and Filter */}
              <div className="flex-1 flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder={`Search ${activeTab === "community" ? "communities" : "events"}...`}
                    className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#006989] focus:border-transparent transition"
                  />
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowLevelFilter(!showLevelFilter)}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition"
                  >
                    <Filter size={18} />
                    {selectedLevel}
                    <ChevronDown size={16} className={`transition-transform ${showLevelFilter ? 'rotate-180' : ''}`} />
                  </button>

                  {showLevelFilter && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setShowLevelFilter(false)}
                      />
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-40">
                        {levels.map((level) => (
                          <button
                            key={level}
                            onClick={() => {
                              setSelectedLevel(level);
                              setShowLevelFilter(false);
                            }}
                            className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition ${selectedLevel === level ? 'bg-blue-50 text-[#006989]' : ''}`}
                          >
                            {level}
                          </button>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          {activeTab === "community" ? (
            <>
              {/* Trending Communities */}
              {communities.filter(c => c.trending).length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="text-yellow-500" size={20} />
                    <h2 className="text-xl font-bold text-gray-900">Trending Now</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {communities
                      .filter(c => c.trending)
                      .map((community, index) => (
                        <div key={community.name} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <CommunityCard 
                            {...community}
                            onJoin={() => handleJoinCommunity(community.slug)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* All Communities */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {filteredCommunities.length} Communities Found
                </h2>
                {filteredCommunities.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Search className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No communities found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or filter</p>
                    <button
                      onClick={handleCreateCommunity}
                      className="inline-flex items-center gap-2 bg-[#006989] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
                    >
                      <Plus size={18} />
                      Create Community
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredCommunities.map((community, index) => (
                      <div key={community.name} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <CommunityCard 
                          {...community}
                          onJoin={() => handleJoinCommunity(community.slug)}
                          onQuickEvent={() => handleCreateEvent(community.slug)}
                          showQuickEvent={userLeaderCommunities.some(c => c.name === community.name)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {/* Featured Events */}
              {events.filter(e => e.status === "open" && e.participants < e.maxParticipants * 0.8).length > 0 && (
                <div className="mb-8">
                  <div className="flex items-center gap-2 mb-4">
                    <Trophy className="text-amber-500" size={20} />
                    <h2 className="text-xl font-bold text-gray-900">Featured Events</h2>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {events
                      .filter(e => e.status === "open" && e.participants < e.maxParticipants * 0.8)
                      .slice(0, 2)
                      .map((event, index) => (
                        <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                          <EventCard 
                            {...event}
                            onView={() => handleViewEvent(event.id)}
                          />
                        </div>
                      ))}
                  </div>
                </div>
              )}

              {/* All Events */}
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {filteredEvents.length} Events Found
                </h2>
                {filteredEvents.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Calendar className="text-gray-400" size={24} />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No events found</h3>
                    <p className="text-gray-600 mb-6">Try adjusting your search or create a new event</p>
                    <button
                      onClick={() => handleCreateEvent()}
                      className="inline-flex items-center gap-2 bg-[#006989] text-white px-6 py-2 rounded-lg font-medium hover:opacity-90 transition"
                    >
                      <Plus size={18} />
                      Create Event
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredEvents.map((event, index) => (
                      <div key={event.id} className="animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                        <EventCard 
                          {...event}
                          onView={() => handleViewEvent(event.id)}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Quick Create Section */}
          <div className="mt-12 p-6 bg-gradient-to-r from-[#006989] to-[#00A6A6] rounded-2xl text-white">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div>
                <h3 className="text-xl font-bold mb-2">Ready to Build Your Community?</h3>
                <p className="opacity-90">
                  Create a community, organize events, or add venues to grow the sports scene in Bandung
                </p>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleCreateCommunity}
                  className="px-6 py-3 bg-white text-[#006989] rounded-lg font-medium hover:bg-opacity-90 transition"
                >
                  Create Community
                </button>
                <button
                  onClick={() => handleCreateEvent()}
                  className="px-6 py-3 bg-white/20 backdrop-blur-sm rounded-lg font-medium hover:bg-white/30 transition border border-white/30"
                >
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </main>

        <RightSidebar />
      </div>

      {/* Community Selection Modal for Event Creation */}
      {selectedCommunityForEvent !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Select Community</h3>
            <p className="text-gray-600 mb-6">
              Choose which community you want to create an event for
            </p>
            <div className="space-y-3 mb-6">
              {userLeaderCommunities.map(community => (
                <button
                  key={community.name}
                  onClick={() => handleCreateEvent(community.slug)}
                  className="w-full flex items-center gap-3 p-4 border border-gray-200 rounded-xl hover:border-[#006989] hover:bg-blue-50 transition"
                >
                  <img 
                    src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${community.name}`}
                    alt={community.name}
                    className="w-12 h-12 rounded-lg"
                  />
                  <div className="text-left">
                    <div className="font-medium text-gray-900">{community.name}</div>
                    <div className="text-sm text-gray-500">{community.memberCount} members</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedCommunityForEvent(null)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateCommunity}
                className="flex-1 px-4 py-2 bg-[#006989] text-white rounded-lg hover:opacity-90 transition"
              >
                Create New Community
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardCommunity;