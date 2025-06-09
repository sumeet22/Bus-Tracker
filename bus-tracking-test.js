import readline from "readline";
import axios from "axios";
import { io } from "socket.io-client";
import chalk from "chalk";
import { mockDB } from './src/db/mock-db.js';

// Config
const API_BASE = 'http://localhost:3000';
const [,, mode, tripIdOrRouteId] = process.argv;

if (!['driver', 'passenger', 'search', 'admin-bus', 'admin-trip'].includes(mode)) {
  console.log(chalk.yellow('Usage: node bus-tracking-test.js <driver|passenger|search|admin-bus|admin-trip> <tripId|routeId>'));
  process.exit(1);
}

// WebSocket connection
const socket = io(API_BASE, {
  transports: ['websocket'],
  reconnection: true
});

// CLI interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Clear screen and display header
function clearScreen() {
  process.stdout.write('\x1Bc');
  console.log(chalk.blue.bold('=== Bus Tracking System ==='));
  console.log(chalk.gray(`Mode: ${mode.toUpperCase()} | ID: ${tripIdOrRouteId}\n`));
}

// Format trip data for display
function formatTrip(trip) {
  const bus = mockDB.buses.find(b => b.id === trip.busId);
  const currentStop = trip.stops[trip.currentStopIndex];
  const nextStop = trip.stops[trip.currentStopIndex + 1];
  
  const etaText = nextStop && bus?.speed
    ? chalk.green(`${Math.round((nextStop.distanceFromPrev / bus.speed) * 60)} mins`)
    : chalk.red('Arrived');
    
  const progressBar = trip.stops.length > 0
    ? `Progress: [${'='.repeat(trip.currentStopIndex)}>${' '.repeat(trip.stops.length - trip.currentStopIndex - 1)}] ` +
      `${trip.currentStopIndex + 1}/${trip.stops.length} stops`
    : '';
  
  return `
${chalk.bold('Trip ID:')} ${trip.id}
${chalk.bold('Route:')} ${trip.routeId}
${chalk.bold('Bus:')} ${bus?.name || trip.busId}
${chalk.bold('Start Time:')} ${trip.startTime}
${chalk.bold('Current Stop:')} ${currentStop?.name || 'N/A'} 
${chalk.bold('Next Stop:')} ${nextStop?.name || chalk.red('End of route')}
${chalk.bold('Distance to Next:')} ${nextStop?.distanceFromPrev.toFixed(1) || '0'} km
${chalk.bold('ETA:')} ${etaText}
${chalk.bold('Wheelchair:')} ${trip.wheelchairAvailable ? chalk.green('Available') : chalk.red('Occupied')}
${progressBar}
${chalk.gray('Last updated: ' + new Date(trip.lastUpdated).toLocaleTimeString())}
`;
}


async function updateBusSpeed(busId) {
  try {
    rl.question('Enter new speed (km/h): ', async (speed) => {
      const updateData = { speed: parseInt(speed) };
      const res = await axios.put(`${API_BASE}/buses/${busId}`, updateData);
      console.log(chalk.green(`✓ Speed updated to ${res.data.speed} km/h`));
      console.log(formatBus(res.data));
      showBusAdminMenu();
    });
  } catch (err) {
    console.error(chalk.red('Error updating bus speed:', err.response?.data?.message || err.message));
  }
}
async function updateTripProgress(tripId) {
  try {
    const res = await axios.put(`${API_BASE}/trips/${tripId}/progress`);
    console.log(chalk.green(`✓ Progress updated to stop ${res.data.currentStopIndex + 1}`));
    console.log(formatTrip(res.data));
  } catch (err) {
    console.error(chalk.red('Error updating trip progress:', err.response?.data?.message || err.message));
  }
}
// Format bus data for display
function formatBus(bus) {
  const wheelchairStatus = bus.currentWheelchairAvailability > 0 
    ? chalk.green(`${bus.currentWheelchairAvailability} available`) 
    : chalk.red('Full');

  return `
${chalk.bold('Bus ID:')} ${bus.id}
${chalk.bold('Name:')} ${bus.name}
${chalk.bold('Capacity:')} ${bus.capacity} passengers
${chalk.bold('Wheelchair Slots:')} ${bus.wheelchairSlots} (${wheelchairStatus})
${chalk.bold('Current Speed:')} ${bus.speed} km/h
${chalk.bold('Status:')} ${bus.speed > 0 ? chalk.green('Moving') : chalk.yellow('Stopped')}
`;
}

// ======================
// BUS CRUD FUNCTIONS
// ======================

async function listAllBuses() {
  try {
    const res = await axios.get(`${API_BASE}/buses`);
    clearScreen();
    console.log(chalk.underline.bold('ALL BUSSES'));
    res.data.forEach((bus, index) => {
      console.log(chalk.yellow(`\nBus ${index + 1}:`));
      console.log(formatBus(bus));
    });
  } catch (err) {
    console.error(chalk.red('Error fetching buses:', err.response?.data?.message || err.message));
  }
}

async function getBusDetails(busId) {
  try {
    const res = await axios.get(`${API_BASE}/buses/${busId}`);
    clearScreen();
    console.log(chalk.underline.bold('BUS DETAILS'));
    console.log(formatBus(res.data));
  } catch (err) {
    console.error(chalk.red('Error fetching bus:', err.response?.data?.message || err.message));
  }
}

async function createBus() {
  try {
    const newBus = {};
    
    rl.question('Enter bus name: ', async (name) => {
      newBus.name = name;
      rl.question('Enter total capacity: ', async (capacity) => {
        newBus.capacity = parseInt(capacity);
        rl.question('Enter wheelchair slots: ', async (slots) => {
          newBus.wheelchairSlots = parseInt(slots);
          newBus.currentWheelchairAvailability = parseInt(slots);
          rl.question('Enter initial speed (km/h): ', async (speed) => {
            newBus.speed = parseInt(speed) || 40;
            
            const res = await axios.post(`${API_BASE}/buses`, newBus);
            console.log(chalk.green(`✓ Bus created with ID: ${res.data.id}`));
            console.log(formatBus(res.data));
            showBusAdminMenu();
          });
        });
      });
    });
  } catch (err) {
    console.error(chalk.red('Error creating bus:', err.response?.data?.message || err.message));
  }
}

async function updateBus(busId) {
  try {
    const res = await axios.get(`${API_BASE}/buses/${busId}`);
    const bus = res.data;
    
    console.log(chalk.yellow('Leave blank to keep current value'));
    
    rl.question(`Name [${bus.name}]: `, async (name) => {
      rl.question(`License Plate [${bus.licensePlate}]: `, async (licensePlate) => {
        rl.question(`Capacity [${bus.capacity}]: `, async (capacity) => {
          rl.question(`Wheelchair Slots [${bus.wheelchairSlots}]: `, async (wheelchairSlots) => {
            rl.question(`Status [${bus.status}]: `, async (status) => {
              const updateData = {
                name: name || bus.name,
                licensePlate: licensePlate || bus.licensePlate,
                capacity: capacity ? parseInt(capacity) : bus.capacity,
                wheelchairSlots: wheelchairSlots ? parseInt(wheelchairSlots) : bus.wheelchairSlots,
                status: status || bus.status
              };
              
              await axios.put(`${API_BASE}/buses/${busId}`, updateData);
              console.log(chalk.green('✓ Bus updated successfully'));
              showBusAdminMenu();
            });
          });
        });
      });
    });
  } catch (err) {
    console.error(chalk.red('Error updating bus:', err.response?.data?.message || err.message));
  }
}

async function deleteBus(busId) {
  try {
    await axios.delete(`${API_BASE}/buses/${busId}`);
    console.log(chalk.green('✓ Bus deleted successfully'));
  } catch (err) {
    console.error(chalk.red('Error deleting bus:', err.response?.data?.message || err.message));
  }
}

// ======================
// TRIP CRUD FUNCTIONS
// ======================

async function listAllTrips() {
  try {
    const res = await axios.get(`${API_BASE}/trips`);
    clearScreen();
    console.log(chalk.underline.bold('ALL TRIPS'));
    
    res.data.forEach((trip, index) => {
      console.log(chalk.yellow(`\nTrip ${index + 1}:`));
      console.log(formatTrip(trip));
    });
  } catch (err) {
    console.error(chalk.red('Error fetching trips:', err.response?.data?.message || err.message));
  }
}

async function getTripDetails(tripId) {
  try {
    const res = await axios.get(`${API_BASE}/trips/${tripId}`);
    clearScreen();
    console.log(chalk.underline.bold('TRIP DETAILS'));
    console.log(formatTrip(res.data));
  } catch (err) {
    console.error(chalk.red('Error fetching trip:', err.response?.data?.message || err.message));
  }
}

async function createTrip() {
  try {
    const newTrip = {
      busId: '',
      routeId: '',
      startTime: '',
      stops: [],
      currentStopIndex: 0,
      wheelchairAvailable: true
    };

    // Get basic trip info
    rl.question('Enter route ID: ', async (routeId) => {
      newTrip.routeId = routeId;
      rl.question('Enter bus ID: ', async (busId) => {
        newTrip.busId = busId;
        rl.question('Enter start time (HH:MM): ', async (startTime) => {
          newTrip.startTime = startTime;

          // Add stops interactively with clear exit option
          console.log(chalk.yellow('\nAdd stops (type "done" when finished adding stops)'));
          await addStopsInteractive(newTrip);
          
          // Verify at least one stop was added
          if (newTrip.stops.length === 0) {
            console.log(chalk.red('Error: At least one stop is required'));
            return showTripAdminMenu();
          }

          const res = await axios.post(`${API_BASE}/trips`, newTrip);
          console.log(chalk.green(`✓ Trip created with ID: ${res.data.id}`));
          console.log(formatTrip(res.data));
          showTripAdminMenu();
        });
      });
    });
  } catch (err) {
    console.error(chalk.red('Error creating trip:', err.response?.data?.message || err.message));
  }
}

async function addStopsInteractive(trip) {
  let stopNumber = 1;
  
  const addStop = async () => {
    rl.question(`Stop ${stopNumber} name (or "done" to finish): `, async (name) => {
      if (name.toLowerCase() === 'done') {
        if (stopNumber === 1) {
          console.log(chalk.yellow('You must add at least one stop'));
          return addStop();
        }
        return; // Exit stop addition
      }
      
      const stop = {
        id: `stop-${Date.now()}`,
        name,
        scheduledArrival: '',
        location: { lat: 0, lng: 0 },
        distanceFromPrev: 0
      };
      
      // Get stop details
      rl.question('Scheduled arrival (HH:MM): ', (time) => {
        stop.scheduledArrival = time;
        rl.question('Distance from previous stop (km): ', (distance) => {
          stop.distanceFromPrev = parseFloat(distance) || 0;
          rl.question('Latitude: ', (lat) => {
            stop.location.lat = parseFloat(lat);
            rl.question('Longitude: ', (lng) => {
              stop.location.lng = parseFloat(lng);
              
              trip.stops.push(stop);
              stopNumber++;
              addStop(); // Continue to next stop
            });
          });
        });
      });
    });
  };
  
  await addStop();
}

async function updateTrip(tripId) {
  try {
    const res = await axios.get(`${API_BASE}/trips/${tripId}`);
    const trip = res.data;
    
    console.log(chalk.yellow('Leave blank to keep current value'));
    
    rl.question(`Route ID [${trip.routeId}]: `, async (routeId) => {
      rl.question(`Bus ID [${trip.busId}]: `, async (busId) => {
        rl.question(`Start Time [${trip.startTime}]: `, async (startTime) => {
          rl.question(`Current Stop Index [${trip.currentStopIndex}]: `, async (currentStopIndex) => {
            const updateData = {
              routeId: routeId || trip.routeId,
              busId: busId || trip.busId,
              startTime: startTime || trip.startTime,
              currentStopIndex: currentStopIndex ? parseInt(currentStopIndex) : trip.currentStopIndex
            };
            
            await axios.put(`${API_BASE}/trips/${tripId}`, updateData);
            console.log(chalk.green('✓ Trip updated successfully'));
            showTripAdminMenu();
          });
        });
      });
    });
  } catch (err) {
    console.error(chalk.red('Error updating trip:', err.response?.data?.message || err.message));
  }
}

// ======================
// ADMIN MENUS
// ======================

function showBusAdminMenu() {
  console.log(chalk.underline.bold('\nBUS ADMIN OPTIONS:'));
  console.log('1. List all buses');
  console.log('2. View bus details');
  console.log('3. Create new bus');
  console.log('4. Update bus');
  console.log('5. Delete bus');
  console.log('6. Exit');

  rl.question('\nSelect option: ', async (choice) => {
    switch (choice) {
      case '1':
        await listAllBuses();
        break;
      case '2':
        rl.question('Enter bus ID: ', async (busId) => {
          await getBusDetails(busId);
          showBusAdminMenu();
        });
        break;
      case '3':
        await createBus();
        break;
      case '4':
        rl.question('Enter bus ID to update: ', async (busId) => {
          await updateBus(busId);
        });
        break;
      case '5':
        rl.question('Enter bus ID to delete: ', async (busId) => {
          await deleteBus(busId);
          showBusAdminMenu();
        });
        break;
      case '6':
        rl.close();
        process.exit(0);
      default:
        console.log(chalk.yellow('Invalid choice'));
    }
    showBusAdminMenu();
  });
}

function showTripAdminMenu() {
  console.log(chalk.underline.bold('\nTRIP ADMIN OPTIONS:'));
  console.log('1. List all trips');
  console.log('2. View trip details');
  console.log('3. Create new trip');
  console.log('4. Update trip');
  console.log('5. Exit');

  rl.question('\nSelect option: ', async (choice) => {
    switch (choice) {
      case '1':
        await listAllTrips();
        break;
      case '2':
        rl.question('Enter trip ID: ', async (tripId) => {
          await getTripDetails(tripId);
          showTripAdminMenu();
        });
        break;
      case '3':
        await createTrip();
        break;
      case '4':
        rl.question('Enter trip ID to update: ', async (tripId) => {
          await updateTrip(tripId);
        });
        break;
      case '5':
        rl.close();
        process.exit(0);
      default:
        console.log(chalk.yellow('Invalid choice'));
    }
    showTripAdminMenu();
  });
}

// ======================
// EXISTING FUNCTIONS (unchanged)
// ======================

async function getUpcomingTrips(routeId) {
  try {
    const res = await axios.get(`${API_BASE}/trips/${routeId}/upcoming`);
    
    clearScreen();
    console.log(chalk.underline.bold('UPCOMING TRIPS'));
    
    if (res.data.length === 0) {
      console.log(chalk.yellow('No upcoming trips found'));
      return;
    }

    res.data.forEach((trip, index) => {
      console.log(chalk.yellow(`\nTrip ${index + 1}:`));
      console.log(`Departure: ${chalk.bold(trip.startTime)}`);
      console.log(formatTrip(trip));
    });
  } catch (err) {
    console.error(chalk.red('Error fetching trips:', err.message));
  }
}

async function searchRoutes(destination) {
  try {
    const res = await axios.get(`${API_BASE}/stops/search/${encodeURIComponent(destination)}`);
    
    clearScreen();
    console.log(chalk.underline.bold(`ROUTES TO ${destination.toUpperCase()}`));
    res.data.forEach((route, index) => {
      console.log(chalk.yellow(`\nOption ${index + 1}:`));
      console.log(`Route: ${route.name}`);
      console.log(`Next Bus: ${route.nextTrip?.busId || 'None'}`);
      console.log(`ETA: ${route.nextTrip?.eta || 'N/A'} mins`);
    });
  } catch (err) {
    console.error(chalk.red('Error searching routes:', err.response?.data?.message || err.message));
  }
}

async function updateStop(tripId) {
  try {
    await axios.put(`${API_BASE}/trips/${tripId}/progress`);
    console.log(chalk.green('✓ Stop updated to next location'));
  } catch (err) {
    console.error(chalk.red('✗ Error:', err.response?.data?.message || err.message));
  }
}

async function updateWheelchair(tripId, available) {
  try {
    await axios.put(`${API_BASE}/trips/${tripId}/wheelchair`, { available });
    console.log(chalk.green(`✓ Wheelchair slots updated: ${available ? 'Available' : 'Occupied'}`));
  } catch (err) {
    console.error(chalk.red('✗ Error:', err.response?.data?.message || err.message));
  }
}

function subscribeToRoute(routeId) {
  socket.emit('subscribe-route', { routeId });
}

function showDriverMenu(tripId) {
  console.log(chalk.underline.bold('\nDRIVER OPTIONS:'));
  console.log('1. Update to next stop');
  console.log('2. Mark wheelchair occupied');
  console.log('3. Mark wheelchair available');
  console.log('4. Refresh trip details');
  console.log('5. Exit');

  rl.question('\nSelect option: ', async (choice) => {
    switch (choice) {
      case '1': await updateStop(tripId); break;
      case '2': await updateWheelchair(tripId, false); break;
      case '3': await updateWheelchair(tripId, true); break;
      case '4': await getTripDetails(tripId); break;
      case '5': rl.close(); process.exit(0);
      default: console.log(chalk.yellow('Invalid choice'));
    }
    showDriverMenu(tripId);
  });
}

function showPassengerMenu(routeId) {
  console.log(chalk.underline.bold('\nPASSENGER OPTIONS:'));
  console.log('1. Refresh upcoming trips');
  console.log('2. Exit');

  rl.question('\nSelect option: ', async (choice) => {
    switch (choice) {
      case '1': await getUpcomingTrips(routeId); break;
      case '2': rl.close(); process.exit(0);
      default: console.log(chalk.yellow('Invalid choice'));
    }
    showPassengerMenu(routeId);
  });
}

function showSearchMenu() {
  rl.question('\nEnter destination stop: ', async (destination) => {
    await searchRoutes(destination);
    showSearchMenu();
  });
}

// SOCKET CONNECTION
socket.on('connect', async () => {
  clearScreen();
  console.log(chalk.green('✓ Connected to realtime server'));
  
  if (mode === 'search') {
    console.log(chalk.bold('\nSEARCH MODE'));
    showSearchMenu();
  } else if (mode === 'passenger') {
    console.log(chalk.bold(`\nPASSENGER VIEW - ROUTE ${tripIdOrRouteId}`));
    subscribeToRoute(tripIdOrRouteId);
    await getUpcomingTrips(tripIdOrRouteId);
    showPassengerMenu(tripIdOrRouteId);
  } else if (mode === 'driver') {
    console.log(chalk.bold(`\nDRIVER VIEW - TRIP ${tripIdOrRouteId}`));
    await getTripDetails(tripIdOrRouteId);
    showDriverMenu(tripIdOrRouteId);
  } else if (mode === 'admin-bus') {
    console.log(chalk.bold('\nBUS ADMINISTRATION'));
    showBusAdminMenu();
  } else if (mode === 'admin-trip') {
    console.log(chalk.bold('\nTRIP ADMINISTRATION'));
    showTripAdminMenu();
  }
});

// REALTIME UPDATES
socket.on('route_update', (data) => {
  clearScreen();
  console.log(chalk.green.bold('=== REALTIME UPDATE ==='));
  
  if (mode === 'passenger') {
    console.log(chalk.bold(`\nROUTE ${tripIdOrRouteId} UPDATE:`));
    console.log(formatTrip(data));
    showPassengerMenu(tripIdOrRouteId);
  } else if (mode === 'driver') {
    console.log(chalk.bold(`\nTRIP ${tripIdOrRouteId} UPDATE:`));
    console.log(formatTrip(data));
    showDriverMenu(tripIdOrRouteId);
  }
});

socket.on('trip-update', (data) => {
  console.log(`Bus will arrive in ${data.etaToNextStop} minutes`);
});

// ERROR HANDLING
socket.on('connect_error', (err) => {
  console.error(chalk.red('✗ Socket connection failed:', err.message));
  process.exit(1);
});

process.on('SIGINT', () => {
  console.log(chalk.yellow('\nDisconnecting...'));
  socket.disconnect();
  process.exit();
});