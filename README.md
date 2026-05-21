# Autism Elopement Tracker
 
A real-time geofencing and tracking system designed to help caregivers monitor children with autism who are at risk of elopement (wandering away from safe areas). Caregivers draw custom geofence boundaries on a map, and the system alerts them when a tracked device moves outside the defined zone.
 
Built as a capstone engineering project at Academic City University, Ghana.
 
## Screenshots
 
**Dashboard with geofence drawn over Richmond, VA**
 
![Homepage](https://raw.githubusercontent.com/Maame-Yaa/Autism-Elopement-Tracker/master/screenshots/Homepage.png)
 
**Geofence view (satellite)**
 
![View Map](https://raw.githubusercontent.com/Maame-Yaa/Autism-Elopement-Tracker/master/screenshots/View%20Map.png)
 
**Breach detection alert when child leaves the geofence**
 
![Child Outside Geofence](https://raw.githubusercontent.com/Maame-Yaa/Autism-Elopement-Tracker/master/screenshots/Child%20Outside%20Geofence.png)
 
## How it works
 
1. A caregiver enters a region name (e.g. "Accra Central"). The app geocodes the location using the Google Maps Geocoding API.
2. The caregiver draws a polygon geofence on the map using Google Maps Drawing Tools. The geofence coordinates are saved to MySQL.
3. A GPS tracker device (LoRaWAN-based) sends location data to The Things Network. The backend subscribes to the MQTT feed and receives coordinates in real time.
4. The backend pushes tracker coordinates to the frontend via Socket.IO. The tracker position appears as a marker on the map.
5. A ray-casting point-in-polygon algorithm checks whether the tracker is inside or outside the active geofence and triggers an alert if the child leaves the boundary.
## Tech stack
 
**Frontend:** React, Google Maps API (@react-google-maps/api), Socket.IO Client, React Router, React Bootstrap
 
**Backend:** Node.js, Express, Socket.IO, MQTT (connected to The Things Network)
 
**Database:** MySQL
 
**Hardware (separate repo):** LoRaWAN GPS tracker with Arduino. See [tracker-arduino-code](https://github.com/Maame-Yaa/tracker-arduino-code) for the device firmware.
 
**Testing:** GPS simulator script (`simulate-tracker.js`) for demo and development without physical hardware
 
## Features
 
- Draw, edit, and delete polygon geofences on Google Maps
- Color-code geofences for visual organization
- Set an active geofence for monitoring
- Real-time tracker position updates via Socket.IO and MQTT
- Point-in-polygon geofence breach detection (ray-casting algorithm)
- GPS simulator for testing without a physical tracker device
- View all geofences on a single map overview
## Project structure
 
```
Autism-Elopement-Tracker/
├── frontend/
│   ├── src/
│   │   ├── Components/
│   │   │   ├── Home.js            # Main dashboard with region input and geofence table
│   │   │   ├── Map1.js            # Geofence card with actions, tracker socket, breach detection
│   │   │   ├── GeoMap.js          # Google Maps with polygon drawing tools
│   │   │   ├── AddGeoMap.js       # Create and save a new geofence for a region
│   │   │   ├── EditMap.js         # Edit existing geofence coordinates and color
│   │   │   ├── ViewMap.js         # View geofence with live tracker marker
│   │   │   ├── ViewAllMaps.js     # Overview of all geofences on one map
│   │   │   └── Header.js          # Navigation bar
│   │   └── App.js                 # Routes and Google Maps script loader
│   └── package.json
├── server/
│   ├── controllers/
│   │   └── mapController.js       # All geofence and tracker CRUD logic
│   ├── routes/
│   │   └── mapRoute.js            # API route definitions
│   ├── db.js                      # MySQL connection
│   ├── index.js                   # Express server, Socket.IO, MQTT subscription
│   └── package.json
└── simulate-tracker.js            # GPS simulator for testing without hardware
```
 
## API endpoints
 
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/addName | Add a new region with geocoded coordinates |
| POST | /api/getMapInfo | Get region details by name |
| GET | /api/getAllMaps | List all saved regions |
| POST | /api/addMap | Save a geofence polygon for a region |
| POST | /api/allGeoMapInfo | Get geofence data for a specific region |
| POST | /api/updateGeoMap | Update geofence coordinates and color |
| DELETE | /api/deleteMap/:id | Delete a geofence polygon |
| DELETE | /api/deleteMapName/:id | Delete a region |
| GET | /api/getAllCoordinateMaps | Get all geofence coordinate data |
| GET | /api/viewAllMaps | Get all geofence coordinates and colors |
| POST | /api/receiveTrackerData | Receive GPS coordinates from tracker/simulator |
| POST | /api/setActiveGeofence | Set a geofence as the active monitoring zone |
 
## Running locally
 
**Prerequisites:** Node.js, MySQL, a Google Maps API key with Maps JavaScript API and Geocoding API enabled
 
1. Clone the repo
```bash
git clone https://github.com/Maame-Yaa/Autism-Elopement-Tracker.git
cd Autism-Elopement-Tracker
```
 
2. Set up the database. Create a MySQL database and two tables:
```sql
CREATE DATABASE FINAL_YEAR_PROJECT;
USE FINAL_YEAR_PROJECT;
 
CREATE TABLE store (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255),
  latitude DOUBLE,
  longitude DOUBLE
);
 
CREATE TABLE store2 (
  id INT AUTO_INCREMENT PRIMARY KEY,
  parentId INT,
  coordinates TEXT,
  color VARCHAR(50),
  isActive BOOLEAN DEFAULT FALSE
);
```
 
3. Configure environment variables
Backend (`server/.env`):
```
PORT=2000
MQTT_USERNAME=your_ttn_app_id
MQTT_PASSWORD=your_ttn_api_key
```
 
Frontend (`frontend/.env`):
```
REACT_APP_GOOGLEAPI=your_google_maps_api_key
```
 
4. Install dependencies and start
```bash
# Backend
cd server
npm install
npm start
 
# Frontend (in a new terminal)
cd frontend
npm install
npm start
```
 
5. (Optional) Run the GPS simulator to test without hardware
```bash
node simulate-tracker.js
```
 
The simulator sends GPS coordinates to the backend every 2 seconds, moving a virtual tracker inside and then outside a geofence boundary.
 
## Hardware companion
 
The physical tracker uses a LoRaWAN-enabled GPS module that transmits location data to The Things Network. The backend subscribes to the MQTT topic and relays coordinates to the frontend in real time.
 
Arduino firmware for the tracker device: [tracker-arduino-code](https://github.com/Maame-Yaa/tracker-arduino-code)
