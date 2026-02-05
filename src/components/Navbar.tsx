import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Pen, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import Logo from '@/Logo.png';
import Mascote from '@/Mascote_Boo.svg';

export const Navbar = () => {
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState("");

    // Mock Auth Check
    useEffect(() => {
        const checkAuth = () => {
            const mockSession = localStorage.getItem("mock_session");
            setIsLoggedIn(!!mockSession);
            setUserPhoto(localStorage.getItem("user_photo"));
        };

        checkAuth();

        window.addEventListener('storage', checkAuth);
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
            setIsOpen(false); // Close mobile sheet if open
        }
    };

    const ProfileTrigger = () => {
        if (isLoggedIn) {
            return (
                <div className="w-10 h-10 rounded-full bg-gradient-electric p-[2px] shadow-sm hover:shadow-glow transition-all cursor-pointer">
                    <div className="w-full h-full rounded-full bg-white flex items-center justify-center overflow-hidden">
                        {userPhoto ? (
                            <img src={userPhoto} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <span className="font-bold text-electric-blue">U</span>
                        )}
                    </div>
                </div>
            );
        }
        return (
            <Button className="bg-gradient-electric text-white hover:bg-gradient-deep font-bold hover:bg-muted" variant="ghost" size="sm">
                Perfil
            </Button>
        );
    };

    return (
        <nav className="rounded-full bg-slate-200 mt-5 w-[95%] md:w-[80%] mx-auto drop-shadow-xl relative z-50 flex items-center justify-between px-6 py-3 max-w-7xl">
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => navigate("/")}>
                <img src={Mascote} alt="Mascote Boo" className="h-10 w-auto -mr-2" />
                <img src={Logo} alt="Logo Boo" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-gradient-electric"></span>
            </div>

            {/* Scale up width to accommodate search bar */}

            {/* Search Bar - Desktop */}
            <div className="hidden md:flex flex-1 max-w-md mx-8">
                <form onSubmit={handleSearch} className="relative w-full">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Buscar estabelecimentos..."
                        className="pl-9 bg-white/50 border-transparent focus:bg-white transition-all rounded-full h-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </form>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
                <Link to="/dashboard">
                    <Button variant="ghost" className="font-semibold">
                        Dashboard
                    </Button>
                </Link>
                <Link to="/admin">
                    <Button className="text-white font-bold bg-[#0091FF] hover:bg-[#7daaff]" variant="outline" size="sm">
                        Área Admin
                    </Button>
                </Link>
                <Link to="/perfil">
                    <ProfileTrigger />
                </Link>
            </div>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center gap-2">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-transparent">
                            <Pen className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col gap-6 mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl font-bold text-gradient-electric">Boo</span>
                            </div>

                            <form onSubmit={(e) => { handleSearch(e); setIsOpen(false); }} className="relative w-full">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Buscar..."
                                    className="pl-9 bg-muted/50"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </form>

                            <Link to="/admin" onClick={() => setIsOpen(false)}>
                                <Button className="w-full text-white font-bold bg-[#0091FF] hover:bg-[#7daaff]" variant="outline">
                                    Área Admin
                                </Button>
                            </Link>
                            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
                                <Button className="w-full" variant="ghost">
                                    Dashboard
                                </Button>
                            </Link>
                            <Link to="/perfil" onClick={() => setIsOpen(false)} className="flex justify-center">
                                <ProfileTrigger />
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};
