import React from 'react';
import { Link } from 'react-router-dom';
import AIAssistantButton from '@/components/ai-assistant/AIAssistantButton';
import { useUserRole } from '@/hooks/userRole';
import { SquareM } from 'lucide-react';

// You may need to adjust this component based on your existing NavBar structure
const NavBar: React.FC = () => {
  const { role, loading } = useUserRole();

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
          </div>
        </div>
      </div>
    </nav>
  );
};

export default NavBar;
