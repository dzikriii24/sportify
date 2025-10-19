import { useState } from "react";
import { Users, TrendingUp } from "lucide-react";
import { Card } from "./ui/card";

const communities = [
  { id: 1, name: "Bandung Padel Elite", members: 142, level: "Advanced", color: "bg-primary/10" },
  { id: 2, name: "Weekend Warriors", members: 89, level: "Intermediate", color: "bg-accent/10" },
  { id: 3, name: "Padel Newbies BDG", members: 67, level: "Beginner", color: "bg-secondary/20" },
  { id: 4, name: "Pro Players Club", members: 156, level: "Professional", color: "bg-primary/10" },
];

const LeftSidebar = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Tombol Toggle Sidebar (Muncul di HP aja) */}
      <button
        onClick={() => setOpen(true)}
        className="md:hidden fixed left-4 bottom-6 z-50 bg-[#006989] text-white p-3 rounded-full shadow-lg"
      >
        <Users className="w-5 h-5"/>
      </button>

      {/* Overlay (buat close sidebar pas diklik luar) */}
      {open && (
        <div
          className="fixed inset-0 bg-white/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setOpen(false)}
        ></div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed md:static top-8 left-0 h-full md:h-[calc(100vh-73px)] bg-card border-r border-border z-50 md:z-0
          transition-transform duration-300 overflow-y-auto
          ${open ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
        style={{ width: "18rem" }}
      >
        {/* Tombol Close (HP only) */}
        <div className="md:hidden flex justify-end p-4">
          <button
            onClick={() => setOpen(false)}
            className="text-[#006989] hover:text-[#004f5f] transition"
          >
          </button>
        </div>

        {/* Konten Sidebar */}
        <div className="p-6">
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-[#006989] mb-1">Your Communities</h2>
            <p className="text-sm text-[#006989]/80">Groups you've joined</p>
          </div>

          <div className="space-y-3">
            {communities.map((community, index) => (
              <Card
                key={community.id}
                className="p-4 hover:shadow-md transition-all duration-300 cursor-pointer border-border hover:border-primary/50 animate-slide-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-xl ${community.color} flex items-center justify-center flex-shrink-0`}>
                    <Users className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm text-[#006989] truncate">{community.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-[#006989]/80">{community.members} members</span>
                    </div>
                    <div className="mt-2">
                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                        {community.level}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div className="mt-6 p-4 bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl border border-primary/20">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-[#006989]">Trending</span>
            </div>
            <p className="text-xs text-[#006989]/80">
              Join "Bandung Summer Cup 2024" - Registration closes in 3 days!
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default LeftSidebar;
