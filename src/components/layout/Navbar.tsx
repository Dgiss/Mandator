
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  MessageSquare,
  Settings,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { logout } from '@/utils/authUtils';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);
  
  const toggleSidebar = () => setIsOpen(!isOpen);

  const handleLogout = () => {
    logout();
    toast({
      title: "Déconnexion réussie",
      description: "Vous avez été déconnecté avec succès",
      variant: "success",
    });
    navigate('/login');
  };

  const navItems = [
    { title: 'Tableau de bord', path: '/dashboard', icon: LayoutDashboard },
    { title: 'Marchés', path: '/marches', icon: FileText },
    { title: 'Questions/Réponses', path: '/questions-reponses', icon: MessageSquare },
    { title: 'Paramètres', path: '/parametres', icon: Settings },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') return true;
    if (path !== '/dashboard' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Mobile Navigation Toggle */}
      <div className="fixed top-4 left-4 z-50 md:hidden">
        <button 
          onClick={toggleSidebar} 
          className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50 transition-all active:scale-95"
          aria-label="Toggle navigation"
        >
          {isOpen ? <LogOut size={20} /> : <LayoutDashboard size={20} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        } md:relative md:translate-x-0 flex flex-col h-full`}
      >
        <div className="p-4 border-b border-gray-200 flex items-center">
          <FileText className="h-6 w-6 text-blue-600 mr-2" />
          <span className="text-lg font-bold text-gray-800">Mandator</span>
        </div>

        <nav className="flex-1 py-6 px-3 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center space-x-3 py-3 px-4 rounded-md transition-colors ${
                isActive(item.path) 
                  ? 'bg-blue-50 text-blue-600 font-medium' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <item.icon className={`h-5 w-5 ${isActive(item.path) ? 'text-blue-600' : 'text-gray-500'}`} />
              <span>{item.title}</span>
              
              {isActive(item.path) && (
                <ChevronRight className="h-4 w-4 text-blue-600 ml-auto" />
              )}
            </Link>
          ))}
        </nav>

        <div className="mt-auto p-4 border-t border-gray-200">
          <div className="flex items-center space-x-3 px-3 py-2">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">AD</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">Utilisateur</p>
              <p className="text-xs text-gray-500 truncate">admin@mandator.fr</p>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setIsOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Navbar;
