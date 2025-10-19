import { useState } from "react";
import { Search, MapPin, Menu, X } from "lucide-react";
import { Input } from "./ui/input";
import { Link, useLocation } from "react-router-dom";
import { cn } from "./lib/utils";
import "../../src/assets/sportify-logo-dark.svg"


interface NavbarProps {
    activeTab: "community" | "event";
    onTabChange: (tab: "community" | "event") => void;
    searchTerm: string;
    setSearchTerm: (value: string) => void;
}



const Navbar = ({ activeTab, onTabChange, searchTerm, setSearchTerm }: NavbarProps) => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const isDashboard = location.pathname.startsWith("/dashboard");

    return (
        <nav className="border-b sticky top-0 z-50 backdrop-blur-sm bg-white/80">
            <div className="max-w-[1600px] mx-auto px-6 py-4 flex items-center justify-between gap-4">

                {/* Logo */}
                <Link to="/dashboard-community" className="flex items-center gap-2 group">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105">
                        <img src="/src/assets/sportify-logo-dark.svg" alt="Sportify Logo" />
                    </div>
                </Link>

                {/* Search */}
                <div className="flex-1 max-w-md sm:block">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#006989]" />
                        <Input
                            placeholder="Search..."
                            className="pl-10 border border-[#006989]/50 focus-visible:ring-[#EAEBED]/10"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Desktop Tabs */}
                <div className="hidden md:flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
                    {isDashboard && (
                        <>
                            <button
                                onClick={() => onTabChange("community")}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all duration-300",
                                    activeTab === "community"
                                        ? "shadow-md text-[#006989]"
                                        : "text-gray-600 hover:text-[#006989]"
                                )}
                            >
                                Community
                            </button>
                            <button
                                onClick={() => onTabChange("event")}
                                className={cn(
                                    "px-6 py-2 rounded-lg font-medium transition-all duration-300",
                                    activeTab === "event"
                                        ? "shadow-md text-[#006989]"
                                        : "text-gray-600 hover:text-[#006989]"
                                )}
                            >
                                Event
                            </button>
                        </>
                    )}
                    <Link
                        to="/courts"
                        className={cn(
                            "px-6 py-2 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 shadow-sm",
                            location.pathname === "/courts"
                                ? "bg-white text-[#006989]"
                                : "text-[#006989] hover:text-[#005b78]"
                        )}
                    >
                        <MapPin className="w-4 h-4 text-[#006989]" />
                        Padel Courts
                    </Link>
                </div>

                {/* Mobile Menu Button */}
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="md:hidden flex items-center justify-center p-2 rounded-lg text-[#006989] hover:bg-gray-100 transition"
                >
                    {isOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Dropdown */}
            {isOpen && (
                <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 shadow-md">
                    <div className="flex flex-col items-start gap-2 p-4">
                        {isDashboard && (
                            <>
                                <button
                                    onClick={() => {
                                        onTabChange("community");
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                        activeTab === "community"
                                            ? "bg-gray-100 text-[#006989]"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-[#006989]"
                                    )}
                                >
                                    Community
                                </button>
                                <button
                                    onClick={() => {
                                        onTabChange("event");
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full text-left px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                        activeTab === "event"
                                            ? "bg-gray-100 text-[#006989]"
                                            : "text-gray-600 hover:bg-gray-100 hover:text-[#006989]"
                                    )}
                                >
                                    Event
                                </button>
                            </>
                        )}
                        <Link
                            to="/courts"
                            onClick={() => setIsOpen(false)}
                            className={cn(
                                "w-full flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200",
                                location.pathname === "/courts"
                                    ? "bg-gray-100 text-[#006989]"
                                    : "text-[#006989] hover:bg-gray-100"
                            )}
                        >
                            <MapPin className="w-4 h-4" />
                            Padel Courts
                        </Link>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
