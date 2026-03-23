import { SidebarProps } from '../../constants/types';

export function Sidebar({
  activeTab,
  telemetry,
  flightplanData,
  setFlightplans,
  onSelectFlightPlan,
  onDeleteFlightPlan,
  drawRef
}: SidebarProps) {
  return (
    <div className="w-80 bg-white border-r border-gray-200 p-6 flex flex-col h-full overflow-hidden">
      
      {/* Scrollable Content Area */}
      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {activeTab === 'planning' || activeTab === 'sensor' ? (
          <>
            {/* Drone Status */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Drone Status</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm">Active - Field Monitoring</span>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-gray-500">Battery</span>
                    <div className="font-semibold">{telemetry.battery ?? "---"}%</div>
                  </div>
                  <div>
                    <span className="text-gray-500">Altitude</span>
                    <div className="font-semibold">{telemetry.altitude ?? "---"} ft</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Live Feed */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Live Feed</h3>
              <div className="h-32 bg-gray-900 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-mono tracking-tighter">● LIVE FEED</span>
              </div>
            </div>

            {/* System Telemetry */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">System Telemetry</h3>
              <div className="space-y-2 text-sm">
                <TelemetryRow label="Satellites Visible" value={telemetry.satellitesVisible ?? "---"} color="text-green-600" />
                <TelemetryRow label="GPS HDOP" value={telemetry.hdop ?? "---"} color="text-green-600" />
                <TelemetryRow label="Heading" value={telemetry.heading ?? "---"} />
                <TelemetryRow label="VX" value={telemetry.velocity?.[0] ?? "---"} />
                <TelemetryRow label="VY" value={telemetry.velocity?.[1] ?? "---"} />
                <TelemetryRow label="VZ" value={telemetry.velocity?.[2] ?? "---"} />
              </div>
            </div>
          </>
        ) : (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Flight Plan History ({flightplanData?.["flightplans"]?.length || 0})</h3>
            <div className="space-y-2">
              {flightplanData?.["flightplans"]?.map((fp: any) => (
                <div className="flex" key={fp.missionId}>
                <button
                  onClick={() => onSelectFlightPlan(fp, drawRef)}
                  className="w-full text-left p-3 border rounded hover:bg-blue-50 transition-all group border-gray-100 hover:border-blue-200 flex justify-between items-center"
                >
                  <div className="flex-1">
                  <div className="font-medium text-sm text-blue-600 group-hover:text-blue-800">
                    ID: {fp.missionId.slice(0, 8)}
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(fp.createdAt).toLocaleString()}
                  </div>
                  </div>
                  <div className={`rounded-full ${fp.missionId === flightplanData["metadata"].currentFlightPlan ? 'w-3 h-3 bg-green-500 animate-pulse' : 'w-3 h-3 bg-gray-400'}`}>
                  </div>
                </button>
                <button
                    onClick={(e)=> {
                      e.stopPropagation();
                      onDeleteFlightPlan(fp, flightplanData["flightplans"], drawRef, setFlightplans);
                    }}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                    >
                      X
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Emergency Controls at Bottom */}
      <div className="pt-6 border-t border-gray-100 mt-auto">
        <h2 className="text-lg font-semibold mb-3 text-red-800 uppercase text-xs tracking-wider">Emergency Controls</h2>
        <div className="space-y-2">
          <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-bold transition-all active:scale-95">
            ABORT FLIGHT
          </button>
          <button className="w-full bg-red-50 text-red-600 py-2 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold">
            Emergency Land
          </button>
        </div>
      </div>
    </div>
  );
}

// Helper for clean telemetry rows
function TelemetryRow({ label, value, color = "text-gray-900" }: { label: string, value: string, color?: string }) {
  return (
    <div className="flex justify-between border-b border-gray-50 pb-1">
      <span className="text-gray-500">{label}</span>
      <span className={`font-semibold ${color}`}>{value}</span>
    </div>
  );
}