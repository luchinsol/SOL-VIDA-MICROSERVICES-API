import express from 'express';
import bodyParser from 'body-parser';
import * as turf from '@turf/turf';
import cors from 'cors';

const app = express();
app.use(bodyParser.json());
app.use(cors());

const port = 3000;

// Límites de la región
const regionBoundary = [
  [-72.00433666166178, -16.146343643298945],
  [-71.92534452748886, -16.162998705184098],
  [-71.85983885524789, -16.124134713832447],
  [-71.6496594192571, -15.992138326036311],
  [-71.69716268391205, -15.931242576423351],
  [-71.33523304844574, -15.935592886439624],
  [-71.20629561581089, -16.01170802475406],
  [-70.97104135275778, -15.97256671147678],
  [-70.84662804056624, -15.920366388926444],
  [-70.85793834167455, -16.050841666284285],
  [-70.89639336544285, -16.276796086824316],
  [-70.98008959364444, -16.302851088553567],
  [-70.96877929253611, -16.46778543385711],
  [-71.23796445891418, -16.450430505782684],
  [-71.3234374390305, -16.72933353422941],
  [-71.5601625331648, -16.66749467143327],
  [-71.75653675898073, -16.68810984991633],
  [-71.86951919027209, -16.775699524236252],
  [-71.8668291323842, -16.71902844799142],
  [-71.92063029014199, -16.670071690253284],
  [-72.00402208466657, -16.796303002756673],
  [-72.23267700513719, -16.657186249172693],
  [-72.27571793134342, -16.61079148599305]
];

const boundaryPolygon = turf.polygon([[...regionBoundary, regionBoundary[0]]]);

app.post('/api/verificar-punto', (req, res) => {
  const { longitud, latitud, points } = req.body;

  // Validar coordenadas
  if (typeof longitud !== 'number' || typeof latitud !== 'number') {
    return res.status(400).json({
      error: 'Se deben proporcionar coordenadas válidas (longitud y latitud).'
    });
  }

  // Validar points
  if (!Array.isArray(points) || points.length === 0) {
    return res.status(400).json({
      error: 'Se debe proporcionar un array válido de puntos Voronoi.'
    });
  }

  const point = turf.point([longitud, latitud]);

  // Verificar si el punto está dentro del boundary
  if (!turf.booleanPointInPolygon(point, boundaryPolygon)) {
    return res.json({
      mensaje: 'El punto está fuera de la región de estudio.'
    });
  }

  // Encontrar el punto Voronoi más cercano
  let minDistance = Infinity;
  let closestRegion = null;

  points.forEach(voronoiPoint => {
    if (!voronoiPoint.coordinates || !voronoiPoint.label) {
      return;
    }

    const distance = turf.distance(
      point,
      turf.point(voronoiPoint.coordinates)
    );

    if (distance < minDistance) {
      minDistance = distance;
      closestRegion = voronoiPoint.label;
    }
  });

  if (closestRegion) {
    return res.json({
      mensaje: `El punto está más cercano a ${closestRegion}`,
      region: closestRegion,
      distancia: minDistance
    });
  }

  res.json({ mensaje: 'No se pudo determinar la región más cercana.' });
});

app.listen(port, () => {
  console.log(`Servidor ejecutándose en http://localhost:${port}`);
});


/*json de prueba tipo POST

http://localhost:3000/api/verificar-punto


{
  "longitud": -71.5973,
  "latitud": -16.3539,
  "points": [
    {
      "coordinates": [-71.57331270629261, -16.404208662363892],
      "label": "Región 1"
    },
    {
      "coordinates": [-71.51168792775216, -16.36055222960009],
      "label": "Región 2"
    },
    {
      "coordinates": [-71.5973293205217, -16.353897593161935],
      "label": "Región 3"
    }
  ]
}*/