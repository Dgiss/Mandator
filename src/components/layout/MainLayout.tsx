
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
  useSidebar
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
  
  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
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
        
        <SidebarHeader className="flex items-center border-b px-4 py-4">
          <Link to="/" className="flex items-center">
            <FileText className="h-6 w-6 text-btp-blue mr-2" />
            <span className="text-xl font-bold">MandataireBTP</span>
          </Link>
          
          <SidebarTrigger className="ml-auto lg:hidden">
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </SidebarTrigger>
        </SidebarHeader>
        
        <SidebarContent>
          {user && (
            <div className="px-4 py-3 border-b">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-btp-blue rounded-full flex items-center justify-center text-white font-medium">
                  {profile?.prenom?.charAt(0) || profile?.nom?.charAt(0) || user.email?.charAt(0) || 'U'}
                </div>
                <div className="flex-1 truncate">
                  <p className="text-sm font-medium">{profile?.prenom && profile?.nom ? `${profile.prenom} ${profile.nom}` : user.email}</p>
                  <p className="text-xs text-gray-500 truncate">{profile?.entreprise || 'Compte personnel'}</p>
                </div>
              </div>
            </div>
          )}
          
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive('/home') || isActive('/')} tooltip="Accueil" asChild>
                <Link to="/">
                  <Home className="size-4" />
                  <span>Accueil</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive('/marches')} tooltip="Marchés" asChild>
                <Link to="/marches">
                  <FileText className="size-4" />
                  <span>Marchés</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive('/questions-reponses')} tooltip="Questions/Réponses" asChild>
                <Link to="/questions-reponses">
                  <MessageSquare className="size-4" />
                  <span>Questions/Réponses</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/admin')} tooltip="Administration" asChild>
                  <Link to="/admin">
                    <Shield className="size-4" />
                    <span>Administration</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        
        <SidebarFooter className="border-t mt-auto">
          <div className="flex flex-col gap-2 p-4">
            <SidebarMenuItem>
              <SidebarMenuButton isActive={isActive('/parametres')} tooltip="Paramètres" asChild>
                <Link to="/parametres">
                  <Settings className="size-4" />
                  <span>Paramètres</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full justify-start text-sm mt-2"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <SidebarInset>
        <div className="flex flex-col min-h-screen w-full">
          <div className="p-4 flex items-center justify-between border-b bg-white sticky top-0 z-20">
            <div className="flex items-center">
              <SidebarTrigger className="mr-2">
                {open ? (
                  <PanelLeft className="h-5 w-5 transition-transform" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </SidebarTrigger>
              <Link to="/" className="flex items-center">
                <FileText className="h-5 w-5 text-btp-blue mr-2" />
                <span className="text-lg font-bold">MandataireBTP</span>
              </Link>
            </div>
          </div>
          
          <main className="flex-1 relative overflow-auto">
            {children}
          </main>
        </div>
      </SidebarInset>
    </div>
  );
};

export default MainLayout;
