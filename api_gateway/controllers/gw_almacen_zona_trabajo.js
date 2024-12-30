import axios from 'axios';
import * as turf from '@turf/turf';

const URLzona = 'http://localhost:4009/api/v1/zona';
const URLalmacen = 'http://localhost:5015/api/v1/almacen';

export const getAlmacenZona = async (req, res) => {
    try {
        const { longitud, latitud } = req.body;

        if (longitud === undefined || latitud === undefined) {
            return res.status(400).json({ 
                message: 'Se requieren las coordenadas (longitud y latitud) en el body' 
            });
        }

        const [responseZona, responseAlmacen] = await Promise.all([
            axios.get(URLzona),
            axios.get(URLalmacen)
        ]);

        if (!responseZona.data || !responseAlmacen.data) {
            return res.status(404).json({ message: 'Datos no encontrados' });
        }

        // Crear las regiones de zonas (polígonos)
        const warehouseRegions = responseZona.data.map((zona) => {
            try {
                // Las coordenadas ya vienen como array de arrays desde PostgreSQL
                let processedCoordinates = zona.poligono_coordenadas;
                
                // Verificar que las coordenadas son válidas
                if (!Array.isArray(processedCoordinates) || !processedCoordinates.every(coord => 
                    Array.isArray(coord) && coord.length === 2 && 
                    typeof coord[0] === 'number' && typeof coord[1] === 'number')) {
                    throw new Error(`Formato inválido de coordenadas para zona ${zona.id}`);
                }

                // Crear un feature de GeoJSON
                const polygon = {
                    type: "Feature",
                    properties: {
                        id: zona.id,
                        name: zona.nombre
                    },
                    geometry: {
                        type: "Polygon",
                        coordinates: [processedCoordinates]
                    }
                };

                console.log(`Polígono procesado para ${zona.nombre}:`, JSON.stringify(polygon));

                return {
                    warehouseId: zona.id,
                    name: zona.nombre,
                    polygon: polygon
                };
            } catch (error) {
                console.error(`Error procesando zona ${zona.id}:`, error);
                return null;
            }
        }).filter(region => region !== null);

        const warehouses = responseAlmacen.data.map((almacen) => ({
            id: almacen.id,
            name: almacen.nombre,
            location: [Number(almacen.longitud), Number(almacen.latitud)],
            departamento: almacen.departamento
        }));

        const coordinates = [Number(longitud), Number(latitud)];
        console.log('Punto a analizar:', coordinates);

        const analysis = analyzeLocation(warehouseRegions, coordinates, warehouses);

        res.status(200).json({
            coordenadas: {
                latitud,
                longitud
            },
            analysis
        });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({
            message: 'Error procesando la solicitud',
            error: error.message
        });
    }
};

function analyzeLocation(warehouseRegions, coordinates, warehouses) {
    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Formato de coordenadas inválido');
    }

    const point = turf.point(coordinates);
    console.log('Analizando punto:', coordinates);

    // Buscar la región que contiene el punto
    let containingRegion = null;
    for (const region of warehouseRegions) {
        try {
            console.log(`Verificando región ${region.name}`);
            
            const isInside = turf.booleanPointInPolygon(point, region.polygon);
            console.log(`Punto está dentro de ${region.name}:`, isInside);

            if (isInside) {
                containingRegion = {
                    warehouseId: region.warehouseId,
                    regionName: region.name,
                    area: turf.area(region.polygon),
                    boundaries: region.polygon.geometry.coordinates[0]
                };
                break;
            }
        } catch (error) {
            console.error(`Error procesando la región ${region.name}:`, error);
            console.error('Detalles del error:', error.message);
        }
    }

    // Calcular almacenes cercanos y distancias
    let nearestWarehouse = null;
    let minDistance = Infinity;
    let allWarehouses = [];

    for (const warehouse of warehouses) {
        try {
            const warehousePoint = turf.point(warehouse.location);
            const distance = turf.distance(point, warehousePoint, { units: 'kilometers' });

            const warehouseInfo = {
                id: warehouse.id,
                name: warehouse.name,
                distance: Math.round(distance * 100) / 100,
                location: warehouse.location,
                departamento: warehouse.departamento
            };

            allWarehouses.push(warehouseInfo);

            if (distance < minDistance) {
                minDistance = distance;
                nearestWarehouse = warehouseInfo;
            }
        } catch (error) {
            console.error(`Error procesando el almacén ${warehouse.id}:`, error);
        }
    }

    allWarehouses.sort((a, b) => a.distance - b.distance);

    // Si encontramos una región, buscar almacenes en esa región
    let warehousesInRegion = [];
    if (containingRegion) {
        warehousesInRegion = warehouses
            .filter(w => w.id.toString() === containingRegion.warehouseId.toString())
            .map(w => ({
                id: w.id,
                name: w.name,
                departamento: w.departamento,
                distance: Math.round(
                    turf.distance(
                        point, 
                        turf.point(w.location), 
                        { units: 'kilometers' }
                    ) * 100
                ) / 100
            }));
    }

    return {
        point: coordinates,
        region: containingRegion || 'El punto no está en ninguna región definida',
        nearestWarehouse,
        allWarehouses: allWarehouses,
        warehousesInRegion: warehousesInRegion.length > 0 ? warehousesInRegion : 'No hay almacenes en la región'
    };
}