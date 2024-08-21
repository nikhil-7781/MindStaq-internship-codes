const { MongoClient } = require('mongodb');
async function fetchData() {
  const uri = 'mongodb+srv://nikv7781:alpha7781@cluster0.ggpsptz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'; 
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to the database.');

    const database = client.db('travel'); 
    const collection = database.collection('railway'); 

    const stations = await collection.find().toArray();

    function findStation(stationId) {
        return stations.find(station => station.id === stationId.toString());
    }
    
    
    function findRoutes(startStationId) {
        const visited = new Set();
        const routeArr = [[startStationId]];
    
        const routes = [];
    
        while (routeArr.length > 0) {
            const currentRoute = routeArr.shift();
            const lastStationId = currentRoute[currentRoute.length - 1]; 
            const lastStation = findStation(lastStationId);
    
            if (lastStation && !visited.has(lastStationId)) {
                visited.add(lastStationId);
    
                for (const nextStationId of lastStation.to) {
                    if (findStation(nextStationId)) {
                        const newRoute = [...currentRoute, nextStationId];
                        routeArr.push(newRoute);
                        routes.push(newRoute);
                    }
                }
            }
        }
    
        return routes;
    }
    
    
    function printRoutes(startStationName) {
        const startStation = stations.find(station => station.name === startStationName);
    
        if (!startStation) {
            console.log(`Station ${startStationName} not found`);
            return;
        }
    
        const routes = findRoutes(startStation.id);
    
        routes.forEach((route, index) => {
            const routeNames = route.map(stationId => findStation(stationId).name);
            console.log(`Route ${index + 1}: ${routeNames.join(', ')}`);
        });
    }
    
    
    function main() {
        printRoutes("Chennai");
    }
    main();
} catch (error) {
    console.error('An error occurred while fetching data:', error);}

finally{
    await client.close();
}
}
fetchData();