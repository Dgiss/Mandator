
import React, { ReactNode, useState } from 'react';
import { 
  SidebarProvider, 
  Sidebar, 
  SidebarHeader, 
  SidebarContent, 
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
  SidebarInset
} from "@/components/ui/sidebar";
import { Link, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Home, 
  LayoutDashboard, 
  MessageSquare, 
  FormInput, 
  Settings, 
  LogOut, 
  Users 
} from 'lucide-react';
import { toast } from 'sonner';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = () => {
    // Since we've removed authentication, this is just a placeholder
    // that shows a toast notification
    toast.success("Déconnexion réussie");
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-gray-50">
        <Sidebar>
          <SidebarHeader className="flex items-center border-b px-4 py-4">
            <Link to="/" className="flex items-center">
              <FileText className="h-6 w-6 text-btp-blue mr-2" />
              <span className="text-xl font-bold">MandataireBTP</span>
            </Link>
          </SidebarHeader>
          
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/home')} tooltip="Accueil" asChild>
                  <Link to="/">
                    <Home className="size-4" />
                    <span>Accueil</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/dashboard')} tooltip="Tableau de bord" asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="size-4" />
                    <span>Tableau de bord</span>
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
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/formulaires')} tooltip="Formulaires" asChild>
                  <Link to="/formulaires">
                    <FormInput className="size-4" />
                    <span>Formulaires</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton isActive={isActive('/clients')} tooltip="Clients" asChild>
                  <Link to="/clients">
                    <Users className="size-4" />
                    <span>Clients</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          
          <SidebarFooter className="border-t">
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
            <div className="p-4 flex items-center justify-between border-b bg-white md:hidden">
              <div className="flex items-center">
                <SidebarTrigger />
                <Link to="/" className="flex items-center ml-2">
                  <FileText className="h-5 w-5 text-btp-blue mr-2" />
                  <span className="text-lg font-bold">MandataireBTP</span>
                </Link>
              </div>
            </div>
            
            <main className="flex-1">
              {children}
            </main>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default MainLayout;
