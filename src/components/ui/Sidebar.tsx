interface SidebarProps {
    battery: string;
    altitude: string;
  }

export function Sidebar({
    battery, 
    altitude
  }: SidebarProps) { return (
<div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
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
                  <div className="font-semibold">{battery}%</div>
                </div>
                <div>
                  <span className="text-gray-500">Altitude</span>
                  <div className="font-semibold">{altitude} ft</div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Feed */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Live Feed</h3>
            <div className="h-32 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">● LIVE FEED</span>
            </div>
          </div>

          {/* System Telemetry */}
          <div>
            <h3 className="text-lg font-semibold mb-3">System Telemetry</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Satellites Visible </span>
                <span className="font-semibold text-green-600">21</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">GPS HDOP</span>
                <span className="font-semibold text-green-600">0.15</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Heading</span>
                <span className="text-black-600">180.57</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VX</span>
                <span className="text-black-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VY</span>
                <span className="text-black-600">0</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">VZ</span>
                <span className="text-black-600">0</span>
              </div>
            </div>
          </div>

          {/* Emergency Controls */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">Emergency Controls</h3>
            <div className="space-y-2">
              <button className="w-full bg-red-600 text-white py-3 rounded-lg hover:bg-red-700 font-semibold transition-colors">
                ABORT FLIGHT
              </button>
              <button className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-600 transition-colors">
                Emergency Land
              </button>
            </div>
          </div>
        </div>
  );
}