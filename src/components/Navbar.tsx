
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useState, useEffect } from 'react';
import Logo from '@/Logo.png';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [userPhoto, setUserPhoto] = useState<string | null>(null);

    // Mock Auth Check
    // Mock Auth Check
    useEffect(() => {
        const checkAuth = () => {
            const mockSession = localStorage.getItem("mock_session");
            setIsLoggedIn(!!mockSession);
            setUserPhoto(localStorage.getItem("user_photo"));
        };

        checkAuth();

        // Listen for storage events (e.g. login/logout in other tabs or components)
        window.addEventListener('storage', checkAuth);

        // Custom event for same-tab updates if we implemented that, but storage is good for now or manual reload
        return () => window.removeEventListener('storage', checkAuth);
    }, []);

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
        <nav className="rounded-full bg-slate-200 mt-5 w-[95%] md:w-[60%] mx-auto drop-shadow-xl relative z-50 flex items-center justify-between px-6 py-3 max-w-7xl">
            <div className="flex items-center gap-2">
                <img src={Logo} alt="Logo_Boo" className="h-8 w-auto" />
                <span className="text-2xl font-bold text-gradient-electric"></span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-4">
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
            <div className="md:hidden">
                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-primary hover:bg-transparent">
                            <Menu className="h-6 w-6" />
                        </Button>
                    </SheetTrigger>
                    <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                        <div className="flex flex-col gap-6 mt-8">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="text-2xl font-bold text-gradient-electric">Boo</span>
                            </div>
                            <Link to="/admin" onClick={() => setIsOpen(false)}>
                                <Button className="w-full text-white font-bold bg-[#0091FF] hover:bg-[#7daaff]" variant="outline">
                                    Área Admin
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
