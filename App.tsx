import { useState, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useDroneData } from './src/hooks/useDroneData.ts';
import { Sidebar } from './src/components/ui/Sidebar.tsx';
import { saveFlightPlan, getAllFlightPlans, selectFlightPlan, deleteFlightPlan } from './src/components/map/FlightPlans.tsx';
import { AgroDroneMap } from './src/components/map/AgroDroneMap.tsx';

type TabType = 'planning' | 'flights' | 'sensor';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('planning');
  const drawRef = useRef<any>(null);
  const [flightplanData, setFlightplanData] = useState({});

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
            activeTab={activeTab}
            battery={battery}
            altitude={altitude}
            flightplanData={flightplanData}
            setFlightplans={setFlightplanData}
            onSelectFlightPlan={selectFlightPlan}
            onDeleteFlightPlan={deleteFlightPlan}
            drawRef={drawRef}
        />

        {/* Main Content */}
        <div className="flex-1  flex flex-col min-h-0">
          {/* Tab Navigation */}

          <div className="bg-white border-b border-gray-200 z-20">
            <div className="flex space-x-8 px-6">
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
              <button
                onClick={() => setActiveTab('flights')}
                className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === 'flights'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                Flight Plan History
              </button>
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
            </div>
          </div>
          <div className="flex-1 relative z-0"> {/* The Map container */}
            {/* Mission Buttons */}
              {activeTab === 'planning' && (<button
              onClick={() => {saveFlightPlan(drawRef),
                console.log(drawRef.current.getSelected());
              }}
              className="absolute top-1 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Save Mission
              </button>)}
              {activeTab === 'flights' && (
                <div className='absolute top-1 right-1 z-50 flex flex-col gap-1'>
                <button
                onClick={ async () => {
                  setFlightplanData(await getAllFlightPlans());
                }}
                className=" top-1 right-1 z-50 bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
                >
                  Get Flight Plans
                </button>
                <button
                onClick={ async () => {
                  //setFlightplans();
                }}
                className="top-1 right-1 z-50 bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
                >
                  Set Active
                </button>
                </div>
              )}
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
