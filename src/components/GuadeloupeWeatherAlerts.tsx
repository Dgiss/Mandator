
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface WeatherAlert {
  id: number;
  type: string;
  region: string;
  startDate: string;
  endDate: string;
  severity: string;
  description: string;
}

interface GuadeloupeWeatherAlertsProps {
  alerts: WeatherAlert[];
  onDelete?: (id: number) => void;
}

const GuadeloupeWeatherAlerts: React.FC<GuadeloupeWeatherAlertsProps> = ({ alerts, onDelete }) => {
  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getSeverityStyle = (severity: string) => {
    switch (severity.toLowerCase()) {
      case 'critique':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'modérée':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'faible':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString('fr-FR', options);
  };

  return (
    <div className="space-y-4">
      {alerts.map(alert => (
        <div key={alert.id} className={`border rounded-lg p-4 ${getSeverityStyle(alert.severity)}`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <div className="flex items-center space-x-2">
                  <h4 className="font-semibold">{alert.type}</h4>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 font-medium">
                    {alert.severity}
                  </span>
                </div>
                <p className="text-sm">{alert.description}</p>
                <div className="mt-2 text-xs">
                  <span className="font-medium">Région:</span> {alert.region} | 
                  <span className="font-medium"> Période:</span> {formatDate(alert.startDate)} - {formatDate(alert.endDate)}
                </div>
              </div>
            </div>
            
            {onDelete && (
              <button 
                onClick={() => onDelete(alert.id)} 
                className="text-gray-500 hover:text-gray-700"
                aria-label="Supprimer l'alerte"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default GuadeloupeWeatherAlerts;
