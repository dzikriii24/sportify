import { useState, useEffect } from "react";
import { User, LogOut, Settings, MapPin, Gamepad2, Zap } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const RightSidebar = () => {
    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<any>(null);
    const [friends, setFriends] = useState<any[]>([]); 
    const navigate = useNavigate();

    // Fetch Profile Data
    useEffect(() => {
        const fetchProfile = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return; // DashboardCommunity sudah handle redirect, disini cukup return

            const { data } = await supabase
                .from('profile_user_fixs')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
            }

            // Mock Data Friends
            setFriends([
                { id: 1, name: "Sarah Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", status: "Online" },
                { id: 2, name: "Mike Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", status: "In Game" },
                { id: 3, name: "Budi Santoso", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi", status: "Offline" },
            ]);
        };

        fetchProfile();
    }, []);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        toast.success("Berhasil keluar");
        navigate('/login');
    };

    if (!profile) return null; 

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="md:hidden fixed right-4 bottom-6 z-50 bg-[#006989] text-white p-3 rounded-full shadow-lg"
            >
                <User className="w-5 h-5" />
            </button>

            {open && (
                <div
                    className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 md:hidden"
                    onClick={() => setOpen(false)}
                ></div>
            )}

            <aside
                className={`fixed md:sticky top-0 right-0 h-screen md:h-[calc(100vh)] bg-white border-l border-gray-200 z-50 md:z-0
                    transition-transform duration-300 overflow-hidden md:overflow-y-auto w-80 pt-20
                    ${open ? "translate-x-0" : "translate-x-full md:translate-x-0"}
                `}
            >
                <div className="p-6 flex flex-col h-full">
                    
                    {/* PROFILE CARD */}
                    <div className="relative overflow-hidden rounded-2xl shadow-lg bg-white group border border-gray-100">
                        <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-r from-[#006989] to-[#009ab5]"></div>
                        
                        <div className="relative px-6 pt-12 pb-6 flex flex-col items-center text-center">
                            <div className="w-24 h-24 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200">
                                <img 
                                    src={profile.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${profile.full_name}`} 
                                    alt="Avatar" 
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            <div className="mt-3">
                                <h3 className="font-bold text-lg text-gray-900">{profile.full_name}</h3>
                                <p className="text-sm text-gray-500">@{profile.username}</p>
                                
                                {profile.location && (
                                    <div className="flex items-center justify-center gap-1 mt-1 text-xs text-gray-400">
                                        <MapPin size={12} /> {profile.location}
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-3 gap-4 w-full mt-6 border-t border-gray-100 pt-4">
                                <div>
                                    <span className="block font-bold text-gray-900 text-lg">{profile.level || 1}</span>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Level</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-gray-900 text-lg">12</span>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">Events</span>
                                </div>
                                <div>
                                    <span className="block font-bold text-gray-900 text-lg">{profile.xp || 0}</span>
                                    <span className="text-[10px] uppercase text-gray-400 font-bold tracking-wider">XP</span>
                                </div>
                            </div>

                            <button 
                                className="w-full mt-6 py-2 px-4 border border-gray-300 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition"
                                onClick={() => toast("Fitur edit profile segera hadir!")}
                            >
                                <Settings className="w-3 h-3" /> Edit Profile
                            </button>
                        </div>
                    </div>

                    {/* FRIENDS LIST */}
                    <div className="flex-1 mt-8">
                        <div className="flex items-center justify-between mb-4 px-1">
                            <h3 className="font-bold text-gray-900 text-sm">Friends</h3>
                            <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600">{friends.length}</span>
                        </div>

                        <div className="space-y-2">
                            {friends.map((friend) => (
                                <div
                                    key={friend.id}
                                    className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 cursor-pointer transition group"
                                >
                                    <div className="relative">
                                        <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-100">
                                            <img src={friend.avatar} alt={friend.name} className="w-full h-full" />
                                        </div>
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 border-2 border-white rounded-full 
                                            ${friend.status === 'Online' ? 'bg-green-500' : 
                                              friend.status === 'In Game' ? 'bg-purple-500' : 'bg-gray-300'}`} 
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 text-left">
                                        <p className="text-sm font-semibold text-gray-800 truncate">{friend.name}</p>
                                        <p className={`text-xs truncate flex items-center gap-1 ${
                                            friend.status === 'Online' ? 'text-green-600' : 
                                            friend.status === 'In Game' ? 'text-purple-600' : 'text-gray-400'
                                        }`}>
                                            {friend.status === 'In Game' && <Gamepad2 size={10} />}
                                            {friend.status === 'Online' && <Zap size={10} />}
                                            {friend.status}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t border-gray-100">
                        <button 
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 text-red-500 hover:bg-red-50 py-2.5 rounded-xl transition text-sm font-medium"
                        >
                            <LogOut size={16} /> Sign Out
                        </button>
                    </div>

                </div>
            </aside>
        </>
    );
};

export default RightSidebar;