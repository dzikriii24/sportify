import { useState } from "react";
import Navbar from "../manual-components/NavbarComunity";
import LeftSidebar from "../manual-components/LeftSidebar";
import RightSidebar from "../manual-components/RightSideBar";
import CommunityCard from "../manual-components/CommunityCard";
import EventCard from "../manual-components/EventCard";


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
    },
    {
        name: "Bandung Youth Padel",
        sport: "Padel",
        memberCount: 93,
        members: [
            { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user17" },
            { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user18" },
            { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user19" },
            { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user20" },
        ],
        level: "Intermediate",
        description: "Young players under 25 building the future of padel in Bandung.",
    },
    {
        name: "Morning Padel Sessions",
        sport: "Padel",
        memberCount: 45,
        members: [
            { id: 1, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user21" },
            { id: 2, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user22" },
            { id: 3, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user23" },
            { id: 4, avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user24" },
        ],
        level: "All Levels",
        description: "Early birds who love to play padel before work. 6 AM sessions every weekday!",
    },
];

const events = [
    {
        title: "Bandung Summer Cup 2024",
        date: "June 15-17, 2024",
        time: "9:00 AM - 6:00 PM",
        location: "Padel Arena Bandung",
        participants: 32,
        maxParticipants: 64,
        level: "All Levels",
        status: "open" as const,
    },
    {
        title: "Weekend Social Match",
        date: "May 25, 2024",
        time: "2:00 PM - 5:00 PM",
        location: "Cihampelas Padel Club",
        participants: 16,
        maxParticipants: 16,
        level: "Intermediate",
        status: "full" as const,
    },
    {
        title: "Beginners Workshop",
        date: "June 1, 2024",
        time: "10:00 AM - 12:00 PM",
        location: "Dago Padel Courts",
        participants: 8,
        maxParticipants: 20,
        level: "Beginner",
        status: "open" as const,
    },
    {
        title: "Pro Training Camp",
        date: "June 20-22, 2024",
        time: "8:00 AM - 4:00 PM",
        location: "Bandung Sports Complex",
        participants: 12,
        maxParticipants: 15,
        level: "Advanced",
        status: "upcoming" as const,
    },
    {
        title: "Night League Finals",
        date: "July 5, 2024",
        time: "7:00 PM - 10:00 PM",
        location: "Setrasari Padel Center",
        participants: 24,
        maxParticipants: 32,
        level: "All Levels",
        status: "open" as const,
    },
    {
        title: "Women's Padel Day",
        date: "June 8, 2024",
        time: "1:00 PM - 5:00 PM",
        location: "Padel Arena Bandung",
        participants: 18,
        maxParticipants: 24,
        level: "All Levels",
        status: "open" as const,
    },
];

const DashboardCommunity = () => {
    const [activeTab, setActiveTab] = useState<"community" | "event">("community");

    const [searchTerm, setSearchTerm] = useState("");

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredEvents = events.filter(e =>
        e.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <Navbar
                activeTab={activeTab}
                onTabChange={setActiveTab}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
            />

            <div className="flex">
                <LeftSidebar />

                <main className="flex-1 p-8 max-w-5xl">
                    <div className="mb-8 animate-fade-in">
                        <h1 className="text-3xl font-bold text-[#006989] mb-2">
                            {activeTab === "community" ? "Padel Communities" : "Upcoming Events"}
                        </h1>
                        <p className="text-[#006989]/80">
                            {activeTab === "community"
                                ? "Discover and join padel communities in Bandung"
                                : "Find exciting padel events and tournaments"}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" key={activeTab}>
                        {activeTab === "community"
                            ? filteredCommunities.map((community, index) => (
                                <div key={community.name} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <CommunityCard {...community} />
                                </div>
                            ))
                            : filteredEvents.map((event, index) => (
                                <div key={event.title} style={{ animationDelay: `${index * 0.1}s` }}>
                                    <EventCard {...event} />
                                </div>
                            ))}
                    </div>

                </main>

                <RightSidebar />
            </div>
        </div>
    );
};

export default DashboardCommunity;
