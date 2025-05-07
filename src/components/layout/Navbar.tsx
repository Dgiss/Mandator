
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Menu, Home, FileText, MessageSquare, Settings, FormInput, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const closeSheet = () => {
    setIsOpen(false);
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-white shadow-sm">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[280px] p-0">
              <div className="border-b p-4">
                <Link to="/" className="flex items-center" onClick={closeSheet}>
                  <FileText className="h-5 w-5 text-btp-blue mr-2" />
                  <span className="text-xl font-bold">MandataireBTP</span>
                </Link>
              </div>
              <nav className="flex flex-col gap-1 p-2">
                <Link to="/" onClick={closeSheet}>
                  <Button variant={isActive('/home') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <Home className="mr-2 h-4 w-4" />
                    Accueil
                  </Button>
                </Link>
                <Link to="/dashboard" onClick={closeSheet}>
                  <Button variant={isActive('/dashboard') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Tableau de bord
                  </Button>
                </Link>
                <Link to="/marches" onClick={closeSheet}>
                  <Button variant={isActive('/marches') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <FileText className="mr-2 h-4 w-4" />
                    Marchés
                  </Button>
                </Link>
                <Link to="/questions-reponses" onClick={closeSheet}>
                  <Button variant={isActive('/questions-reponses') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Questions/Réponses
                  </Button>
                </Link>
                <Link to="/formulaires" onClick={closeSheet}>
                  <Button variant={isActive('/formulaires') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <FormInput className="mr-2 h-4 w-4" />
                    Formulaires
                  </Button>
                </Link>
                <Link to="/parametres" onClick={closeSheet}>
                  <Button variant={isActive('/parametres') ? "secondary" : "ghost"} className="w-full justify-start" size="sm">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <Link to="/" className="flex items-center">
            <FileText className="h-5 w-5 text-btp-blue mr-2 hidden sm:block" />
            <span className="text-xl font-bold">MandataireBTP</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-2">
          <Link to="/">
            <Button variant={isActive('/home') ? "secondary" : "ghost"} size="sm">
              <Home className="mr-2 h-4 w-4" />
              Accueil
            </Button>
          </Link>
          <Link to="/dashboard">
            <Button variant={isActive('/dashboard') ? "secondary" : "ghost"} size="sm">
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
          </Link>
          <Link to="/marches">
            <Button variant={isActive('/marches') ? "secondary" : "ghost"} size="sm">
              <FileText className="mr-2 h-4 w-4" />
              Marchés
            </Button>
          </Link>
          <Link to="/questions-reponses">
            <Button variant={isActive('/questions-reponses') ? "secondary" : "ghost"} size="sm">
              <MessageSquare className="mr-2 h-4 w-4" />
              Questions/Réponses
            </Button>
          </Link>
          <Link to="/formulaires">
            <Button variant={isActive('/formulaires') ? "secondary" : "ghost"} size="sm">
              <FormInput className="mr-2 h-4 w-4" />
              Formulaires
            </Button>
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Link to="/parametres">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
