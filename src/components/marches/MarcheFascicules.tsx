
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableHeader, 
  TableRow, 
  TableHead, 
  TableBody, 
  TableCell 
} from '@/components/ui/table';
import { Folder, FileText, Plus, MoreHorizontal, Edit, Eye } from 'lucide-react';
import MarcheFasciculeForm from './MarcheFasciculeForm';

interface MarcheFasciculesProps {
  marcheId: string;
}

interface Fascicule {
  id: string;
  nom: string;
  nombreDocuments: number;
  dateMaj: string;
  progression: number;
}

const fasciculesMock: Fascicule[] = [
  {
    id: "f1",
    nom: "Lot 1 - Génie Civil",
    nombreDocuments: 12,
    dateMaj: "18/03/2024",
    progression: 75
  },
  {
    id: "f2",
    nom: "Lot 2 - Turbines",
    nombreDocuments: 8,
    dateMaj: "15/03/2024",
    progression: 40
  },
  {
    id: "f3",
    nom: "Lot 3 - Électricité",
    nombreDocuments: 15,
    dateMaj: "20/03/2024",
    progression: 60
  },
  {
    id: "f4",
    nom: "Lot 4 - Plomberie",
    nombreDocuments: 6,
    dateMaj: "12/03/2024",
    progression: 90
  },
  {
    id: "f5",
    nom: "Lot 5 - Aménagements extérieurs",
    nombreDocuments: 9,
    dateMaj: "22/03/2024",
    progression: 25
  }
];

export default function MarcheFascicules({ marcheId }: MarcheFasciculesProps) {
  const [editingFascicule, setEditingFascicule] = React.useState<Fascicule | null>(null);

  const handleEditFascicule = (fascicule: Fascicule) => {
    setEditingFascicule(fascicule);
  };

  const handleFasciculeCreated = () => {
    // In a real app, we would refresh the data from the server
    console.log("Fascicule created or updated");
  };

  return (
    <div className="pt-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold">Fascicules</h2>
        <MarcheFasciculeForm 
          marcheId={marcheId} 
          onFasciculeCreated={handleFasciculeCreated}
          editingFascicule={editingFascicule}
          setEditingFascicule={setEditingFascicule}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead className="hidden md:table-cell">Documents</TableHead>
                <TableHead className="hidden md:table-cell">Dernière maj.</TableHead>
                <TableHead>Progression</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {fasciculesMock.map((fascicule) => (
                <TableRow key={fascicule.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <Folder className="h-5 w-5 mr-2 text-btp-blue" />
                      <span className="font-medium">{fascicule.nom}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">
                    <div className="flex items-center">
                      <FileText className="h-4 w-4 mr-1 text-gray-400" />
                      <span>{fascicule.nombreDocuments}</span>
                    </div>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{fascicule.dateMaj}</TableCell>
                  <TableCell>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">{fascicule.progression}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-blue-600 h-2 rounded-full" 
                          style={{ width: `${fascicule.progression}%` }}
                        ></div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0"
                        onClick={() => handleEditFascicule(fascicule)}
                      >
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Modifier</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Voir</span>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Actions</span>
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
