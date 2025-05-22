
import React from 'react';
import { Link } from 'react-router-dom';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';
import { useUserRole } from '@/hooks/userRole';
import { useAuth } from '@/contexts/AuthContext';
import { User as UserIcon, LogOut as LogOutIcon } from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuTrigger, 
  DropdownMenuContent, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuItem 
} from '@radix-ui/react-dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

// You may need to adjust this component based on your existing NavBar structure
const NavBar: React.FC = () => {
  const { role, loading } = useUserRole();
  const { user, profile, signOut } = useAuth();

  return (
    <nav className="bg-white border-b border-gray-200 fixed z-30 w-full">
      <div className="px-3 py-3 lg:px-5 lg:pl-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center justify-start">
            <Link to="/" className="text-xl font-bold flex items-center lg:ml-2.5">
              <div className="w-8 h-8 bg-gradient-to-br from-[#5743e9] to-[#7e69c5] flex items-center justify-center rounded-md mr-2">
                <span className="text-white font-bold">M</span>
              </div>
              <span className="self-center whitespace-nowrap">Mandator</span>
            </Link>
          </div>
          <div className="flex items-center">
            {/* Existing navbar items */}
            <AIAssistantButton />
            {/* User profile and other items */}
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{profile?.prenom?.charAt(0) || profile?.nom?.charAt(0) || user?.email?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{profile?.prenom} {profile?.nom}</p>
                      <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/profile" className="flex items-center">
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="flex items-center">
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Déconnexion</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
