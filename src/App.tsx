import { useState, useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import { useDroneData } from './hooks/useDroneData.ts';
import { Sidebar } from './components/ui/Sidebar.tsx';
import { Header } from './components/ui/Header.tsx';
import { TabNavigation } from './components/ui/TabNavigation.tsx';
import { MissionControls } from './components/ui/MissionControls.tsx';
import { getAllFlightPlans, saveFlightPlan, selectFlightPlan, deleteFlightPlan, activateFlightPlan } from './components/map/FlightPlans.tsx';
import { AgroDroneMap } from './components/map/AgroDroneMap.tsx';
import { TabType } from './constants/types.ts';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('planning');
  const drawRef = useRef<any>(null);
  const [flightplanData, setFlightplanData] = useState({
    flightplans: [],
    metadata: { currentFlightPlan: null }
  });
  const hasLoadedFlightPlans = useRef(false);

  const droneData = useDroneData();

  const handleTabChange = async (tab: TabType) => {
    setActiveTab(tab);
    if (tab === 'flights' && !hasLoadedFlightPlans.current) {
      setFlightplanData(await getAllFlightPlans());
      hasLoadedFlightPlans.current = true;
    }
  };

  const handleSaveMission = async () => {
    await saveFlightPlan(drawRef);
    setFlightplanData(await getAllFlightPlans());
    hasLoadedFlightPlans.current = true;
  };

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
          onActivateFlightPlan={async (missionId: string) => {
            const ok = await activateFlightPlan(missionId);
            if (ok) {
              setFlightplanData((prev: any) => ({
                ...prev,
                metadata: { ...prev.metadata, currentFlightPlan: missionId }
              }));
            }
          }}
          drawRef={drawRef}
        />

        <div className="flex-1 flex flex-col min-h-0">
          <TabNavigation activeTab={activeTab} onTabChange={handleTabChange} />

          <div className="flex-1 relative z-0">
            <MissionControls
              activeTab={activeTab}
              onSaveMission={handleSaveMission}
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
