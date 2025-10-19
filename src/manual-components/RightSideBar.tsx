import { useState } from "react";
import { Instagram, Edit2, UserPlus, User } from "lucide-react";
import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";

const friends = [
    { id: 1, name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", online: true },
    { id: 2, name: "Mike Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", online: true },
    { id: 3, name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", online: false },
    { id: 4, name: "Alex Wong", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex", online: true },
    { id: 5, name: "Lisa Park", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa", online: false },
];

const RightSidebar = () => {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* Tombol Toggle (muncul cuma di mobile) */}
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed right-4 bottom-6 z-50 bg-[#006989] text-white p-3 rounded-full shadow-lg"
            >
                <User className="w-5 h-5" />
            </button>

            {/* Overlay hitam pas sidebar muncul */}
            {open && (
                <div
                    className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            {/* Sidebar */}
            {/* Sidebar */}
            <aside
                className={`fixed md:static top-8 right-0 h-full md:h-[calc(100vh-73px)] bg-card border-l border-border z-50 md:z-0
    transition-transform duration-300 overflow-hidden md:overflow-y-auto
    ${open ? "translate-x-0" : "translate-x-full md:translate-x-0"}
  `}
                style={{ width: "20rem" }}
            >
                {/* Tombol Close (mobile only) */}

                <div className="p-6 flex flex-col h-full">
                    {/* Profile Section */}
                    <Card className="p-6 border-border bg-gradient-to-br from-card to-primary/5 flex-shrink-0">
                        <div className="flex flex-col items-center text-center">
                            <Avatar className="w-30 h-30 border-4 border-primary/20">
                                <AvatarImage src="https://i.pinimg.com/1200x/5c/2b/e1/5c2be1ef0a3e71298bc39308fd57a3aa.jpg" />
                                <AvatarFallback>JD</AvatarFallback>
                            </Avatar>

                            <h3 className="font-bold text-lg text-[#006989] mt-4">Jequeline Bensol</h3>

                            <div className="flex items-center gap-2 mt-2">
                                <span className="px-3 py-1 bg-[#006989]/50 text-[#EAEBED] rounded-full text-sm font-medium">
                                    Level 7
                                </span>
                            </div>

                            <a
                                href="https://www.instagram.com/sweswoz/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-[#006989]/70 hover:text-[#006989]/80 transition-colors mt-3"
                            >
                                <Instagram className="w-4 h-4" />
                                <span className="text-sm">jequeline_</span>
                            </a>

                            <Button className="w-full mt-4 bg-[#006989] hover:bg-[#006989]/90 text-[#EAEBED]">
                                <Edit2 className="w-4 h-4 mr-2" />
                                Edit Profile
                            </Button>
                        </div>

                        {/* Communities Joined */}
                        <div className="mt-6 pt-6 border-t border-[#006989]">
                            <h4 className="text-sm font-semibold text-[#006989] mb-3">Communities Joined</h4>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1 border border-[#006989]/80 text-[#006989] rounded-full text-xs">
                                    Padel Elite
                                </span>
                                <span className="px-3 py-1 border border-[#006989]/80 text-[#006989] rounded-full text-xs">
                                    Weekend Warriors
                                </span>
                                <span className="px-3 py-1 border border-[#006989]/80 text-[#006989] rounded-full text-xs">
                                    +2 more
                                </span>
                            </div>
                        </div>
                    </Card>

                    {/* Friends List (scrollable khusus HP) */}
                    <div className="flex-1 mt-6 md:overflow-visible overflow-y-auto">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-[#006989]/80">Friends</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 text-[#006989]/80 hover:text-[#006989] hover:bg-[#006989]/10"
                            >
                                <UserPlus className="w-4 h-4" />
                            </Button>
                        </div>

                        <div className="space-y-2 pb-24">
                            {friends.map((friend, index) => (
                                <Card
                                    key={friend.id}
                                    className="p-3 hover:shadow-sm transition-all duration-300 cursor-pointer border-[#006989]/50 hover:border-primary/30 animate-fade-in"
                                    style={{ animationDelay: `${index * 0.05}s` }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="relative">
                                            <Avatar className="w-10 h-10">
                                                <AvatarImage src={friend.avatar} />
                                                <AvatarFallback>
                                                    {friend.name.split(" ").map((n) => n[0]).join("")}
                                                </AvatarFallback>
                                            </Avatar>
                                            {friend.online && (
                                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-card" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-[#006989]/80 truncate">{friend.name}</p>
                                            <p className="text-xs text-[#006989]/50">
                                                {friend.online ? "Online" : "Offline"}
                                            </p>
                                        </div>
                                    </div>
                                </Card>
                            ))}
                        </div>
                    </div>
                </div>
            </aside>
        </>
    );
};

export default RightSidebar;
