import { MutableRefObject } from 'react';

export const saveMission = async (drawRef: MutableRefObject<any>) => {
    if (drawRef.current) {
      const coords = drawRef.current.getSelected().features[0].geometry.coordinates[0];

      const vertices = coords.map((coord: number[], index: number) => {
        return {"order": index, "lng": coord[0], "lat": coord[1]}
      });

      const content = {
        "missionId": crypto.randomUUID(),
        "createdAt": new Date().toISOString(),
        "totalVertices": vertices.length - 1, // one will be a duplicate, so really -> # - 1 unique vertices
        "vertices": vertices
      };

      try {
        const response = await fetch('http://localhost:8787/flightplan', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}`
          },
          body: JSON.stringify(content)
        });

        if (response.ok) {
          console.log("Flight Plan Sent!");
        } else {
          console.error("Error Sending Flight Plan. Status: ", response.status);
        }

      } catch (e) {
        console.error(e);
      }
      
    }
  };