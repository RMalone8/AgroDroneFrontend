import { useState, useEffect } from 'react';

export function useDroneData() {
  const [battery, setBattery] = useState("...");
  const [altitude, setAltitude] = useState("...");
  const [baseStationPos, setBaseStationPos] = useState([0, 0]);
  const [imageURL, setImageURL] = useState("");

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        const response = await fetch('http://localhost:8787/telemetry', {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` }
        });
        const data = await response.json();
        setBattery(data.battery_level);
        setAltitude(data.altitude);
        setBaseStationPos(data.base_station_position);
      } catch (e) { console.error(e); }
    };

    const fetchMosaic = async () => {
      try {
        const response = await fetch("http://localhost:8787/mosaic", {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` }
        });
        const imageBlob = await response.blob();
        setImageURL(URL.createObjectURL(imageBlob));
      } catch (e) { console.log(e); }
    };

    fetchTelemetry();
    fetchMosaic();
    //const interval = setInterval(fetchTelemetry, 10000);

    //return () => clearInterval(interval);
  }, []);

  return { battery, altitude, baseStationPos, imageURL };
}