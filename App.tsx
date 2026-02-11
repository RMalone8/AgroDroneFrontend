import { useState, useRef } from 'react';
import {Map, Marker, useControl, ControlPosition} from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import type { IControl } from 'maplibre-gl';
//import ControlPanel from './control-panel';
//import { MapProps } from '@vis.gl/react-maplibre';

type TabType = 'sensor' | 'flights' | 'planning';

const drawProps = [
  // ACTIVE (being drawn)
  // line stroke
  {
      "id": "gl-draw-line",
      "type": "line",
      "filter": ["all", ["==", "$type", "LineString"]],
      "layout": {
        "line-cap": "round",
        "line-join": "round"
      },
      "paint": {
        "line-color": "#D20C0C",
        "line-dasharray": [0.2, 2],
        "line-width": 2
      }
  },
  // polygon fill
  {
    "id": "gl-draw-polygon-fill",
    "type": "fill",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "paint": {
      "fill-color": "#D20C0C",
      "fill-outline-color": "#D20C0C",
      "fill-opacity": 0.1
    }
  },
  // polygon mid points
  {
    'id': 'gl-draw-polygon-midpoint',
    'type': 'circle',
    'filter': ['all',
      ['==', '$type', 'Point'],
      ['==', 'meta', 'midpoint']],
    'paint': {
      'circle-radius': 3,
      'circle-color': '#fbb03b'
    }
  },
  // polygon outline stroke
  // This doesn't style the first edge of the polygon, which uses the line stroke styling instead
  {
    "id": "gl-draw-polygon-stroke-active",
    "type": "line",
    "filter": ["all", ["==", "$type", "Polygon"]],
    "layout": {
      "line-cap": "round",
      "line-join": "round"
    },
    "paint": {
      "line-color": "#D20C0C",
      "line-dasharray": [0.2, 2],
      "line-width": 2
    }
  },
  // vertex point halos
  {
    "id": "gl-draw-polygon-and-line-vertex-halo-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    "paint": {
      "circle-radius": 5,
      "circle-color": "#FFF"
    }
  },
  // vertex points
  {
    "id": "gl-draw-polygon-and-line-vertex-active",
    "type": "circle",
    "filter": ["all", ["==", "meta", "vertex"], ["==", "$type", "Point"]],
    "paint": {
      "circle-radius": 3,
      "circle-color": "#D20C0C",
    }
  }
];

function DrawControl(props: any) {
  useControl(
    () => {
      const draw = new MapboxDraw(props) as unknown as IControl;
      
      if (props.onInstanceUpdate) {
        props.onInstanceUpdate(draw);
      }

      return draw;
    },
    ({ map }) => {
      map.on('draw.create', props.onCreate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
    },
    ({ map }) => {
      map.off('draw.create', props.onCreate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
    },
    {
      position: props.position
    }
  );

  return null;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('sensor');
  const [selectedFlight, setSelectedFlight] = useState<string | null>(null);
  const drawRef = useRef<any>(null);

  const flightPaths = [
    { id: 'north-survey', name: 'North Field Survey', date: 'Oct 2, 2024', status: 'completed', path: 'M 15% 20% L 40% 20% L 65% 20% L 65% 35% L 40% 35% L 15% 35% Z' },
    { id: 'south-check', name: 'South Field Check', date: 'Oct 1, 2024', status: 'aborted', path: 'M 15% 45% L 40% 45% L 65% 45% L 65% 60% L 40% 60% L 15% 60% Z' },
    { id: 'east-mapping', name: 'East Field Mapping', date: 'Sep 30, 2024', status: 'completed', path: 'M 15% 70% L 40% 70% L 65% 70% L 65% 85% L 40% 85% L 15% 85% Z' }
  ];

  const getSensorColor = (value: number) => {
    if (value > 0.8) return 'bg-green-500';
    if (value > 0.6) return 'bg-yellow-500';
    if (value > 0.4) return 'bg-orange-500';
    return 'bg-red-500';
  };

  const getFlightStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'stroke-green-500';
      case 'aborted': return 'stroke-red-500';
      case 'in-progress': return 'stroke-blue-500';
      default: return 'stroke-gray-400';
    }
  };

  const onUpdate = (e: any) => {
    console.log('Polygon coordinates:', e.features[0]);
  };

  const onCreate = (e: any) => {
    console.log('Created:', e.features);
  };

  const saveMission = () => {
    if (drawRef.current) {
      const coords = drawRef.current.getAll().features[0].geometry.coordinates[0];

      const vertices = coords.map((coord: number[], index: number) => {
        return {"order": index, "lng": coord[0], "lat": coord[1]}
      });

      const content = {
        "missionId": "uuid-1234-5678",
        "createdAt": "2026-02-05T16:45:00Z", 
        "totalVertices": vertices.length, // one will be a duplicate, so really -> # - 1 unique vertices
        "vertices": vertices
      };

      fetch('http://localhost:8787/flightplan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}`
        },
        body: JSON.stringify(content)
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">AgroDrone Control System</h1>
          <p className="text-gray-600">Semi-autonomous agricultural monitoring</p>
        </div>
      </header>

      <div className="flex h-[calc(100vh-80px)]">
        {/* Sidebar */}
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
                  <div className="font-semibold">78%</div>
                </div>
                <div>
                  <span className="text-gray-500">Altitude</span>
                  <div className="font-semibold">120 ft</div>
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

          {/* Flight Details */}
          {selectedFlight && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Flight Details</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Flight</span>
                  <span className="font-medium">{flightPaths.find(f => f.id === selectedFlight)?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Date</span>
                  <span className="font-medium">{flightPaths.find(f => f.id === selectedFlight)?.date}</span>
                </div>
                <div className="flex justify-between">
                  <span>Status</span>
                  <span className={`px-2 py-1 rounded text-xs ${
                    flightPaths.find(f => f.id === selectedFlight)?.status === 'completed' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {flightPaths.find(f => f.id === selectedFlight)?.status}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* System Health */}
          <div>
            <h3 className="text-lg font-semibold mb-3">System Health</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Overall Health</span>
                <span className="font-semibold text-green-600">85%</span>
              </div>
              <div className="flex justify-between">
                <span>Battery Health</span>
                <span className="text-green-600">Good</span>
              </div>
              <div className="flex justify-between">
                <span>Camera System</span>
                <span className="text-green-600">Excellent</span>
              </div>
              <div className="flex justify-between">
                <span>GPS Module</span>
                <span className="text-green-600">Good</span>
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
              onClick={saveMission}
              className="absolute top-1 right-1 z-50 bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700"
              >
                Save Mission
              </button>)}
            <Map
              initialViewState={{
                latitude: 42.35316,
                longitude: -71.11777,
                zoom: 12,
                pitch: 0
              }}
              style={{ width: '100%', height: '100%' }}
              mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
              >
                {activeTab === 'planning' && (<DrawControl
                  position="top-left"
                  styles={drawProps}
                  displayControlsDefault={false}
                  controls={{
                    polygon: true,
                    trash: true,
                  }}
                  onInstanceUpdate={(instance: any) => {
                    drawRef.current = instance;
                  }}
                  onCreate={onCreate}
                  onUpdate={onUpdate}
                />)}
            </Map>
          </div>
        </div>
      </div>
    </div>
  );
}
