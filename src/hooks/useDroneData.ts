import { useState, useEffect } from 'react';
import mqtt from 'mqtt';

const client = mqtt.connect('ws://localhost:9001', {
  clean: true
});

export function useDroneData() {
  const [battery, setBattery] = useState("...");
  const [altitude, setAltitude] = useState("...");
  const [baseStationPos, setBaseStationPos] = useState<[number, number]>([0, 0]);
  const [imageURL, setImageURL] = useState("");
  const [hdop, setHdop] = useState("");
  const [satellitesVisible, setSatellitesVisible] = useState("");
  const [droneLat, setDroneLat] = useState("1");
  const [droneLng, setDroneLng] = useState("1");
  const [velocity, setVelocity] = useState<[string, string, string]>(["", "", ""]);
  const [heading, setHeading] = useState("");

  useEffect(() => {

    const handleConnect = () => {
      console.log("Connected to Broker");
      client.subscribe('telemetry');
    };

    const handleMessage = (topic: string, payload: Buffer) => {
      if (topic === "telemetry") {
        try {
          const data = payload.toString('utf8')
          const telemetry = JSON.parse(data);
          console.log("PAYLOAD:", telemetry);
          setBattery(telemetry.battery_remaining);
          setAltitude(telemetry.alt_msl);
          setBaseStationPos(telemetry.base_station_position);
          setHdop(telemetry.gps_hdop);
          setHeading(telemetry.heading);
          setSatellitesVisible(telemetry.satellites_visible);
          setDroneLat(telemetry.lat);
          setDroneLng(telemetry.lon);
          setVelocity([telemetry.vx, telemetry.vy, telemetry.vz]);
        } catch (e) {
          console.error("Parse error", e);
        }
      }
    };

    if (client.connected) {
      handleConnect();
    }

    client.on('connect', handleConnect);

    client.on('message', handleMessage);

    client.on('error', (err) => {
      console.error('Connection error: ', err);
      client.end();
    });
    /*
    const fetchMosaic = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/mosaic`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` }
        });
        const imageBlob = await response.blob();
        setImageURL(URL.createObjectURL(imageBlob));
      } catch (e) { console.log(e); }
    };

    fetchMosaic();
    */

    return () => {
      console.log("Cleaning up the connection");
      client.off('connect', handleConnect);
      client.off('message', handleMessage);
    };

  }, []);

  

  return { battery, altitude, baseStationPos, imageURL, hdop, heading, satellitesVisible, droneLat, droneLng, velocity } as DroneTelemetry;
}