import express from 'express';
import bodyParser from 'body-parser';
import * as turf from '@turf/turf';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3001;

app.post('/api/analyze-location', (req, res) => {
  const { coordinates, warehouses, warehouseRegions } = req.body;

  // Validate input
  if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
    return res.status(400).json({
      error: 'Invalid coordinates format'
    });
  }

  if (!Array.isArray(warehouses) || !Array.isArray(warehouseRegions)) {
    return res.status(400).json({
      error: 'Invalid warehouses or regions format'
    });
  }

  const point = turf.point(coordinates);

  // Find region containing the point
  let containingRegion = null;
  for (const region of warehouseRegions) {
    try {
      // Ensure polygon is closed (first and last points match)
      let boundaries = [...region.boundaries];
      if (JSON.stringify(boundaries[0]) !== JSON.stringify(boundaries[boundaries.length - 1])) {
        boundaries.push(boundaries[0]);
      }

      const polygon = turf.polygon([boundaries]);
      
      if (turf.booleanPointInPolygon(point, polygon)) {
        containingRegion = {
          warehouseId: region.warehouseId,
          regionName: region.name,
          area: turf.area(polygon)
        };
        break;
      }
    } catch (error) {
      console.error(`Error processing region ${region.name}:`, error);
    }
  }

  // Find nearest warehouse
  let nearestWarehouse = null;
  let minDistance = Infinity;

  for (const warehouse of warehouses) {
    try {
      const warehousePoint = turf.point(warehouse.location);
      const distance = turf.distance(point, warehousePoint, { units: 'kilometers' });

      if (distance < minDistance) {
        minDistance = distance;
        nearestWarehouse = {
          id: warehouse.id,
          name: warehouse.name,
          distance: Math.round(distance * 100) / 100,
          location: warehouse.location
        };
      }
    } catch (error) {
      console.error(`Error processing warehouse ${warehouse.id}:`, error);
    }
  }

  // Get warehouses in the same region as the point
  let warehousesInRegion = [];
  if (containingRegion) {
    warehousesInRegion = warehouses
      .filter(w => w.id.startsWith(containingRegion.warehouseId.split('-')[0]))
      .map(w => ({
        id: w.id,
        name: w.name,
        distance: Math.round(turf.distance(point, turf.point(w.location), { units: 'kilometers' }) * 100) / 100
      }));
  }

  return res.json({
    point: coordinates,
    region: containingRegion || 'Point not in any defined region',
    nearestWarehouse,
    warehousesInRegion: warehousesInRegion.length > 0 ? warehousesInRegion : 'No warehouses in region'
  });
});

app.listen(port, () => console.log(`Server running on port ${port}`));