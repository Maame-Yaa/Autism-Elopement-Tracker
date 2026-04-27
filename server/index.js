const express = require('express');
const app = express();
const env = require('dotenv').config();  // Make sure to call config to load environment variables
const cors = require('cors');
const db = require('./db');
const router = require('./routes/mapRoute');
const http = require('http');
const socketIo = require('socket.io');
const mqtt = require('mqtt');

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
    credentials: true
  }
});

// MQTT Client setup
const clientId = `mqtt_${Math.random().toString(16).slice(3)}`;
const host = 'mqtt://eu1.cloud.thethings.network:1883';
const options = {
  keepalive: 60,
  clientId: clientId,
  protocolId: 'MQTT',
  protocolVersion: 4,
  clean: true,
  reconnectPeriod: 1000,
  connectTimeout: 30 * 1000,
  username: process.env.MQTT_USERNAME,
  password: process.env.MQTT_PASSWORD,
  rejectUnauthorized: false
};

const mqttClient = mqtt.connect(host, options);

mqttClient.on('connect', () => {
    console.log('Connected to MQTT Broker');
    mqttClient.subscribe('v3/elopement-tracking-system@ttn/devices/+/up', (err) => {
        if (!err) {
            console.log('Subscription successful');
        } else {
            console.error('Subscription failed:', err);
        }
    });
});

mqttClient.on('message', (topic, message) => {
    const data = JSON.parse(message.toString());
    console.log('Received message:', data);
    io.emit('trackerUpdate', data);  // Emit to all connected Socket.IO clients
});

global.io = io; // Make io globally available if needed elsewhere

app.use(express.json());
app.use(cors());
app.use('/api', router);

server.listen(process.env.PORT || 3000, '0.0.0.0', () => {
  console.log(`Running on port ${process.env.PORT || 3000}`);
});

io.on('connection', (socket) => {
  console.log('A user connected');
  socket.on('disconnect', () => {
      console.log('User disconnected');
  });
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
});
