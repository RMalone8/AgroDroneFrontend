import { MutableRefObject } from 'react';

export const saveFlightPlan = async (drawRef: MutableRefObject<any>) => {
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
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/flightplan`, {
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

export async function getAllFlightPlans() {
  try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/flightplan/all`, {
          headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` }
        });

        if (!response.ok) return {flightplans: [], metadata: {}};

        return await response.json();
        
  } catch (e) {
      console.log("Error Retrieving All Flight Plans: ", e);
      return {flightplans: [], metadata: {}};
  }
};

export async function selectFlightPlan(fp: any, drawRef: MutableRefObject<any>) {
  const geojsonFeature = {
    id: fp.missionId, // Set the ID so we can track it
    type: 'Feature',
    properties: {
      createdAt: fp.createdAt
    },
    geometry: {
      type: 'Polygon',
      coordinates: [fp.vertices.map((v: any) => [v.lng, v.lat])] // Polygons require nested arrays
    }
  };
  drawRef.current.deleteAll();
  drawRef.current.add(geojsonFeature);
}

export async function activateFlightPlan(missionId: string) {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/flightplan/${missionId}/activate`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` }
    });

    if (response.ok) {
      console.log("Flight plan activated:", missionId);
      return true;
    } else {
      console.error("Error activating flight plan. Status:", response.status);
      return false;
    }
  } catch (e) {
    console.error("Error activating flight plan:", e);
    return false;
  }
}

export async function deleteFlightPlan(fp: any, _flightplans: any, drawRef: MutableRefObject<any>, setFlightPlans: any) {
  try {
    if (drawRef.current) {
      drawRef.current.delete(fp.missionId);
    }

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/flightplan/${fp.missionId}`, {
      method: 'DELETE',
      headers: { 
        'Authorization': `Bearer ${import.meta.env.VITE_DEVICE_TOKEN}` 
      }
    });

    if (response.ok) {
      setFlightPlans((prev: any) => ({ ...prev, flightplans: prev.flightplans.filter((plan: { missionId: any }) => plan.missionId !== fp.missionId) }));
      console.log("Successfully deleted flight plan ", fp.missionId);
    } else {
      console.log("Response Code not OK: ", response.status);
    }

  } catch (e) {
    console.log("Error deleting flight plan: ", e);
  }

}