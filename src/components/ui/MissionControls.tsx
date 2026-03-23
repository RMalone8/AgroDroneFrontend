import { TabType } from '../../constants/types.ts';
import { saveFlightPlan } from '../map/FlightPlans.tsx';

interface MissionControlsProps {
  activeTab: TabType;
  drawRef: React.RefObject<any>;
  onGetFlightPlans: () => void;
}

export function MissionControls({ activeTab, drawRef, onGetFlightPlans }: MissionControlsProps) {
  if (activeTab === 'planning') {
    return (
      <button
        onClick={() => {
          saveFlightPlan(drawRef);
          console.log(drawRef.current.getSelected());
        }}
        className="absolute top-1 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
      >
        Save Mission
      </button>
    );
  }

  if (activeTab === 'flights') {
    return (
      <div className="absolute top-1 right-1 z-50 flex flex-col gap-1">
        <button
          onClick={onGetFlightPlans}
          className="bg-red-600 text-white px-4 py-2 rounded shadow hover:bg-red-700"
        >
          Get Flight Plans
        </button>
        <button
          onClick={() => {
            //setFlightplans();
          }}
          className="bg-green-600 text-white px-4 py-2 rounded shadow hover:bg-green-700"
        >
          Set Active
        </button>
      </div>
    );
  }

  return null;
}
