import { Map, Marker, Popup } from '@vis.gl/react-maplibre';
import { DrawControl } from './DrawControl';
import GeocoderControl from './Geocoder';
import { ICON, drawProps, pinStyle } from '../../constants/mapStyles';
import { useState } from 'react';

interface MapViewerProps {
  activeTab: string;
  baseStationPos: number[];
  drawRef: React.MutableRefObject<any>;
}

export function AgroDroneMap({ activeTab, baseStationPos, drawRef }: MapViewerProps) {
  const [baseStationPopup, setBaseStationPopup] = useState<boolean>(false);

  return (
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
      {/* Draw Controls only active in Planning mode */}
      {activeTab === 'planning' && (
        <DrawControl
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
        />
      )}

      <GeocoderControl position="top-left" />

      {/* Base Station Marker */}
      <Marker
        longitude={baseStationPos[1]}
        latitude={baseStationPos[0]}
        anchor="bottom"
        onClick={(e) => {
          e.originalEvent.stopPropagation();
          setBaseStationPopup(true);
        }}
      >
        <svg height={20} viewBox="0 0 24 24" style={pinStyle}>
          <path d={ICON} />
        </svg>
      </Marker>

      {/* Base Station Popup */}
      {baseStationPopup && (
        <Popup
          anchor="top"
          longitude={baseStationPos[1]}
          latitude={baseStationPos[0]}
          onClose={() => setBaseStationPopup(false)}
        >
          <div className="p-1 font-sans text-sm font-semibold">Base Station</div>
        </Popup>
      )}
    </Map>
  );
}