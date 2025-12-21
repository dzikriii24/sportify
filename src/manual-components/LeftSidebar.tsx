import { useState, useEffect } from "react";
import { Users, TrendingUp, Loader2, Plus, ArrowRight } from "lucide-react";
import { supabase } from "../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);
  const [communities, setCommunities] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchJoinedCommunities = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
          setIsLoading(false);
          return;
      }

      const { data, error } = await supabase
        .from('02_anggota')
        .select(`
          community:01_komunitas (
            id, name, slug, level, sport_type
          )
        `)
        .eq('user_id', user.id);

      if (!error && data) {
        const formatted = data.map((item: any) => ({
          id: item.community.id,
          name: item.community.name,
          slug: item.community.slug,
          level: item.community.level,
          sport: item.community.sport_type,
          color: ['bg-blue-100 text-blue-700', 'bg-orange-100 text-orange-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700'][Math.floor(Math.random() * 4)]
        }));
        setCommunities(formatted);
      }
      setIsLoading(false);
    };

    fetchJoinedCommunities();
  }, []);

  return (
    <>
      {/* Tombol Toggle (Mobile) */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 bottom-6 z-50 bg-[#006989] text-white p-3 rounded-full shadow-lg"
      >
        <Users className="w-5 h-5"/>
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 h-screen md:h-[calc(100vh)] bg-white border-r border-gray-200 z-50 md:z-0
          transition-transform duration-300 overflow-y-auto w-72 pt-20 pb-10
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        <div className="p-6">
          <div className="mb-6 flex justify-between items-end">
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Komunitas Saya</h2>
              <p className="text-xs text-gray-500">Grup yang kamu ikuti</p>
            </div>
            <button onClick={() => navigate('/create-community')} className="text-[#006989] hover:bg-blue-50 p-1 rounded-lg transition" title="Buat Komunitas">
                <Plus size={20} />
            </button>
          </div>

          <div className="space-y-3">
            {isLoading ? (
               <div className="flex justify-center py-4"><Loader2 className="animate-spin text-gray-400" /></div>
            ) : communities.length === 0 ? (
               <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50">
                  <p className="text-sm text-gray-500 mb-2">Belum gabung komunitas</p>
                  <button onClick={() => navigate('/explore')} className="text-xs font-bold text-[#006989] hover:underline">Cari Komunitas</button>
               </div>
            ) : (
              communities.map((community) => (
                <div
                  key={community.id}
                  onClick={() => navigate(`/community/${community.slug}`)}
                  className="p-3 bg-white border border-gray-100 rounded-xl hover:shadow-md transition-all duration-300 cursor-pointer hover:border-[#006989]/30 group flex items-center gap-3"
                >
                    <div className={`w-10 h-10 rounded-xl ${community.color} flex items-center justify-center flex-shrink-0 font-bold text-lg`}>
                      {community.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm text-gray-700 group-hover:text-[#006989] truncate transition-colors">
                        {community.name}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full capitalize">
                          {community.level}
                        </span>
                      </div>
                    </div>
                </div>
              ))
            )}
          </div>

          {/* Trending Box */}
          <div className="mt-8 p-4 bg-gradient-to-br from-[#006989] to-[#008ba3] rounded-xl text-white shadow-lg relative overflow-hidden">
            <div className="relative z-10">
                <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4" />
                <span className="text-sm font-bold">Trending Event</span>
                </div>
                <p className="text-xs opacity-90 mb-3 leading-relaxed">
                "Bandung Open 2025" akan segera dimulai. Daftar sekarang!
                </p>
                <button className="w-full py-2 bg-white/20 hover:bg-white/30 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1">
                Lihat Detail <ArrowRight size={10} />
                </button>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;