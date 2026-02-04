
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
    Sheet,
    SheetContent,
    SheetTrigger,
} from '@/components/ui/sheet';
import { useState } from 'react';

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <nav className="rounded-full bg-slate-200 mt-5 w-[95%] md:w-[60%] mx-auto drop-shadow-xl relative z-50 flex items-center justify-between px-6 py-4 max-w-7xl">
            <div className="flex items-center gap-2">
                <img src="" alt="Logo_Boo" className="hidden" /> {/* Hidden empty image */}
                <span className="text-2xl font-bold text-gradient-electric">Boo</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex gap-4">
                <Link to="/admin">
                    <Button className="text-white font-bold bg-[#0091FF] hover:bg-[#7daaff]" variant="outline" size="sm">
                        Área Admin
                    </Button>
                </Link>
                <Link to="/perfil">
                    <Button className="bg-gradient-electric text-white hover:bg-gradient-deep font-bold hover:bg-muted" variant="ghost" size="sm">
                        Perfil
                    </Button>
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
                            <Link to="/perfil" onClick={() => setIsOpen(false)}>
                                <Button className="w-full bg-gradient-electric text-white hover:bg-gradient-deep font-bold" variant="ghost">
                                    Perfil
                                </Button>
                            </Link>
                        </div>
                    </SheetContent>
                </Sheet>
            </div>
        </nav>
    );
};
