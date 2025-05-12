import React, { ReactNode, useEffect } from 'react';
import { 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset,
  SidebarRail,
  useSidebar,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Home, 
  MessageSquare, 
  Settings, 
  LogOut,
  Shield,
  PanelLeft,
  Menu,
  X
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { useUserRole } from '@/hooks/useUserRole';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { isAdmin } = useUserRole();
  const { open, setOpen, isMobile } = useSidebar();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  // Updated logout handler to avoid multiple calls and properly handle navigation
  const handleLogout = async () => {
    try {
      // Disable any UI interaction during logout
      // First navigate to auth page
      navigate('/auth');
      // Then perform the signout
      await signOut();
    } catch (error) {
      console.error('Error during logout:', error);
      toast.error("Erreur lors de la déconnexion");
    }
  };

  // Close sidebar on mobile when navigating to a new page
  useEffect(() => {
    if (isMobile) {
      setOpen(false);
    }
  }, [location.pathname, isMobile, setOpen]);

  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <Sidebar 
        variant="inset" 
        className="border-r border-gray-200 shadow-sm z-30"
      >
        <SidebarRail />
        
        <SidebarHeader className="flex items-center border-b px-6 py-4">
          <Link to="/" className="flex items-center">
            <FileText className="h-6 w-6 text-btp-blue mr-3" />
            <span className="text-xl font-bold">MandataireBTP</span>
          </Link>
          
          <SidebarTrigger className="ml-auto lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </SidebarTrigger>
        </SidebarHeader>
        
        <SidebarContent>
          {user && (
            <div className="px-6 py-4 border-b">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-btp-blue rounded-full flex items-center justify-center text-white font-medium text-lg">
                  {profile?.prenom?.charAt(0) || profile?.nom?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : user.email}</p>
                  <p className="text-sm text-gray-500">{profile?.entreprise || 'Compte personnel'}</p>
                </div>
              </div>
            </div>
          )}
          
          <div className="px-3 py-4">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/home') || isActive('/')} tooltip="Accueil" asChild>
                  <Link to="/" className="w-full">
                    <Home className="size-5 mr-3" />
                    <span>Accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/marches')} tooltip="Marchés" asChild>
                  <Link to="/marches" className="w-full">
                    <FileText className="size-5 mr-3" />
                    <span>Marchés</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/questions-reponses')} tooltip="Questions/Réponses" asChild>
                  <Link to="/questions-reponses" className="w-full">
                    <MessageSquare className="size-5 mr-3" />
                    <span>Questions/Réponses</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              {isAdmin && (
                <SidebarMenuItem>
                  <SidebarMenuButton isActive={isActive('/admin')} tooltip="Administration" asChild>
                    <Link to="/admin" className="w-full">
                      <Shield className="size-5 mr-3" />
                      <span>Administration</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              )}
            </SidebarMenu>
          </div>
        </SidebarContent>
        
        <SidebarFooter className="border-t mt-auto">
          <div className="px-3 py-4">
            <SidebarSeparator className="mb-4" />
            
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/parametres')} tooltip="Paramètres" asChild>
                  <Link to="/parametres" className="w-full">
                    <Settings className="size-5 mr-3" />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full justify-start text-sm mt-4 px-4 py-2 h-10"
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              Déconnexion
            </Button>
            
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500">MandataireBTP © 2025</p>
              <p className="text-xs text-gray-400 mt-1">Les modeleurs</p>
            </div>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <div className="flex flex-col min-h-screen w-full">
          <div className="p-4 flex items-center justify-between border-b bg-white sticky top-0 z-20 shadow-sm">
            <div className="flex items-center">
              <SidebarTrigger className="mr-3 hover:bg-gray-100 rounded-md">
                {open ? (
                  <PanelLeft className="h-5 w-5 transition-transform" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </SidebarTrigger>
              <Link to="/" className="flex items-center md:hidden">
                <FileText className="h-5 w-5 text-btp-blue mr-2" />
                <span className="text-lg font-bold">MandataireBTP</span>
              </Link>
            </div>
          </div>
          
          <main className="flex-1 relative overflow-auto bg-gray-50">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  );
};

export default MainLayout;
