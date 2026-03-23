import { useState, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useDroneData } from './hooks/useDroneData.ts';
import { Sidebar } from './components/ui/Sidebar.tsx';
import { Header } from './components/ui/Header.tsx';
import { TabNavigation } from './components/ui/TabNavigation.tsx';
import { MissionControls } from './components/ui/MissionControls.tsx';
import { getAllFlightPlans, selectFlightPlan, deleteFlightPlan } from './components/map/FlightPlans.tsx';
import { AgroDroneMap } from './components/map/AgroDroneMap.tsx';
import { TabType } from './constants/types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('planning');
  const drawRef = useRef<any>(null);
  const [flightplanData, setFlightplanData] = useState({
    flightplans: [],
    metadata: { currentFlightPlan: null }
  });

  const droneData = useDroneData();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header imageURL={droneData.imageURL} />

      <div className="flex h-[calc(100vh-80px)]">
        <Sidebar
          activeTab={activeTab}
          telemetry={droneData}
          flightplanData={flightplanData}
          setFlightplans={setFlightplanData}
          onSelectFlightPlan={selectFlightPlan}
          onDeleteFlightPlan={deleteFlightPlan}
          drawRef={drawRef}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

          <div className="flex-1 relative z-0">
            <MissionControls
              activeTab={activeTab}
              drawRef={drawRef}
              onGetFlightPlans={async () => setFlightplanData(await getAllFlightPlans())}
            />
            <AgroDroneMap
              activeTab={activeTab}
              droneData={droneData}
              drawRef={drawRef}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
