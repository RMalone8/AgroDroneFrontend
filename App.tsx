import { useState, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useDroneData } from './src/hooks/useDroneData.ts';
import { Sidebar } from './src/components/ui/Sidebar.tsx';
import { saveMission } from './src/components/map/SaveMission.tsx';
import { AgroDroneMap } from './src/components/map/AgroDroneMap.tsx';

type TabType = 'sensor' | 'flights' | 'planning';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sensor');
  const drawRef = useRef<any>(null);

  const { battery, altitude, baseStationPos, imageURL } = useDroneData();

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 flex items-center gap-4">
        <img src={imageURL}
            alt="Logo"
            className="h-20 w-auto object-contain">
          </img>
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">AgroDrone Control System</h1>
            <p className="text-gray-600">Semi-autonomous agricultural monitoring</p>
          </div>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
        <Sidebar
            battery={battery}
            altitude={altitude}
        />

        {/* Main Content */}
        <div className="flex-1  flex flex-col min-h-0">
          {/* Tab Navigation */}

          <div className="bg-white border-b border-gray-200 z-20">
            <div className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('sensor')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'sensor'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Sensor Data
              </button>
              <button
                onClick={() => setActiveTab('flights')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'flights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Flight Logs
              </button>
              <button
                onClick={() => setActiveTab('planning')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'planning'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Flight Planning
              </button>
            </div>
          </div>
          <div className="flex-1 relative z-0"> {/* The Map container */}
            {/* Mission Buttons */}
              {activeTab === 'planning' && (<button
              onClick={() => saveMission(drawRef)}
              className="absolute top-1 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Save Mission
              </button>)}
              <AgroDroneMap
                activeTab={activeTab} 
                baseStationPos={baseStationPos}
                drawRef={drawRef}
              />
          </div>
        </div>
      </div>
    </div>
  );
}
