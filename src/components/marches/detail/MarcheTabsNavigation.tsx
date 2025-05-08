
import React from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileText, 
  Folder, 
  History, 
  ShieldCheck, 
  MessageSquare,
  ClipboardList,
  ClipboardCheck,
  DollarSign
} from 'lucide-react';

interface MarcheTabsNavigationProps {
  activeTab: string;
  onTabChange: (value: string) => void;
}

const MarcheTabsNavigation: React.FC<MarcheTabsNavigationProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="border-b overflow-x-auto">
      <TabsList className="bg-transparent h-auto p-0 w-full justify-start">
        <TabsTrigger 
          value="apercu" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("apercu")}
        >
          <FileText className="mr-2 h-4 w-4" /> Aperçu
        </TabsTrigger>
        <TabsTrigger 
          value="fascicules" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("fascicules")}
        >
          <Folder className="mr-2 h-4 w-4" /> Fascicules
        </TabsTrigger>
        <TabsTrigger 
          value="documents" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("documents")}
        >
          <FileText className="mr-2 h-4 w-4" /> Documents
        </TabsTrigger>
        <TabsTrigger 
          value="versions" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("versions")}
        >
          <History className="mr-2 h-4 w-4" /> Versions
        </TabsTrigger>
        <TabsTrigger 
          value="visas" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("visas")}
        >
          <ShieldCheck className="mr-2 h-4 w-4" /> Visas
        </TabsTrigger>
        <TabsTrigger 
          value="qr" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("qr")}
        >
          <MessageSquare className="mr-2 h-4 w-4" /> Q/R
        </TabsTrigger>
        <TabsTrigger 
          value="situations" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("situations")}
        >
          <ClipboardList className="mr-2 h-4 w-4" /> Situations
        </TabsTrigger>
        <TabsTrigger 
          value="ordres" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("ordres")}
        >
          <ClipboardCheck className="mr-2 h-4 w-4" /> Ordres de service
        </TabsTrigger>
        <TabsTrigger 
          value="prix" 
          className="flex items-center px-4 py-2 data-[state=active]:border-b-2 data-[state=active]:border-btp-blue rounded-none data-[state=active]:shadow-none"
          onClick={() => onTabChange("prix")}
        >
          <DollarSign className="mr-2 h-4 w-4" /> Prix nouveaux
        </TabsTrigger>
      </TabsList>
    </div>
  );
};

export default MarcheTabsNavigation;
