
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu } from 'lucide-react';
import UserMenu from '@/components/auth/UserMenu';

interface NavbarProps {
  title?: string;
}

export default function Navbar({ title = "BTP Document" }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const closeSheet = () => {
    setIsOpen(false);
  };

  return (
    <header className="border-b bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] sm:w-[400px]">
              <nav className="flex flex-col gap-4 mt-8">
                <Link to="/" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Accueil
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Tableau de bord
                  </Button>
                </Link>
                <Link to="/marches" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Marchés
                  </Button>
                </Link>
                <Link to="/questions-reponses" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Questions/Réponses
                  </Button>
                </Link>
                <Link to="/formulaires" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Formulaires
                  </Button>
                </Link>
                <Link to="/parametres" onClick={closeSheet}>
                  <Button variant="ghost" className="w-full justify-start" size="lg">
                    Paramètres
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">{title}</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-5">
          <Link to="/">
            <Button variant="ghost">Accueil</Button>
          </Link>
          <Link to="/dashboard">
            <Button variant="ghost">Tableau de bord</Button>
          </Link>
          <Link to="/marches">
            <Button variant="ghost">Marchés</Button>
          </Link>
          <Link to="/questions-reponses">
            <Button variant="ghost">Questions/Réponses</Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <UserMenu />
        </div>
      </div>
    </header>
  );
}
