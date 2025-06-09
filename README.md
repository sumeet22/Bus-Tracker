Here's a comprehensive `README.md` file for your project that includes all operations, testing instructions, and Docker integration:

```markdown
# Bus Tracking System

A real-time bus tracking system with driver, passenger, and admin functionalities.

## Features

- Real-time bus location tracking
- Trip management
- Bus fleet management
- Wheelchair availability tracking
- Upcoming trip notifications

## API Endpoints

### Bus Endpoints
- `GET /buses` - List all buses
- `GET /buses/:id` - Get bus details
- `POST /buses` - Create new bus
- `PUT /buses/:id` - Update bus
- `DELETE /buses/:id` - Delete bus

### Trip Endpoints
- `GET /trips` - List all trips
- `GET /trips/:id` - Get trip details
- `GET /trips/:id/status` - Get trip status
- `GET /trips/route/:routeId` - Get trips by route
- `GET /trips/:routeId/upcoming` - Get upcoming trips
- `POST /trips` - Create new trip
- `PUT /trips/:id/progress` - Update trip progress
- `PUT /trips/:id/wheelchair` - Update wheelchair availability

## Testing Utilities

The project includes a test script (`bus-tracking-test.js`) with multiple modes:

### Modes of Operation

1. **Driver Mode**:
   ```bash
   node bus-tracking-test.js driver <tripId>
   ```
   - Update to next stop
   - Mark wheelchair occupied/available
   - Refresh trip details

2. **Passenger Mode**:
   ```bash
   node bus-tracking-test.js passenger <routeId>
   ```
   - View upcoming trips
   - Subscribe to route updates

3. **Search Mode**:
   ```bash
   node bus-tracking-test.js search
   ```
   - Search routes by destination

4. **Bus CRUD Mode**:
   ```bash
   node bus-tracking-test.js bus-crud
   ```
   - List all buses
   - Get bus details
   - Create new bus
   - Update bus
   - Delete bus

5. **Trip CRUD Mode**:
   ```bash
   node bus-tracking-test.js trip-crud
   ```
   - List all trips
   - Get trip details
   - Create new trip
   - Update trip
   - Delete trip

## Docker Integration

The project includes Docker support for easy deployment:

### Build the Docker Image
```bash
docker build -t bus-tracking-system .
```

### Run the Container
```bash
docker run -p 3000:3000 -d bus-tracking-system
```

### Docker Compose
A `docker-compose.yml` file is provided for development:

```bash
docker-compose up --build
```

## Environment Variables

Create a `.env` file based on `.env.example`:

```
PORT=3000
NODE_ENV=development
# Add other required variables
```

## Development Setup

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run start:dev
```

3. Run tests:
```bash
npm test
```

## Testing Scenarios

### Bus Operations
1. Create a new bus
2. List all buses
3. Update bus details
4. Delete a bus

### Trip Operations
1. Create a new trip
2. List all trips
3. Update trip progress
4. Change wheelchair availability
5. Delete a trip

### Real-time Testing
1. Start a trip in driver mode
2. Monitor the trip in passenger mode
3. Verify real-time updates

## Monitoring

The API includes health check endpoints:
- `GET /health` - Basic health check
- `GET /metrics` - Application metrics (if configured)

## License

[MIT License](LICENSE)
```

This README includes:

1. **All API endpoints** for both buses and trips
2. **Testing utilities** with all available modes
3. **Docker integration** instructions
4. **Development setup** guide
5. **Testing scenarios** covering all CRUD operations
6. **Environment configuration**
7. **Monitoring** information

The structure follows standard GitHub README best practices and provides clear instructions for both development and production deployment. You can customize the license section and add any additional project-specific details as needed.
