import axios from "axios";

const API_SERVERS = ["http://localhost:3000", "http://localhost:3004"]; // List of servers
const RETRY_LIMIT = 3; // Retry limit for each server

let currentServerIndex = 0; // Track the current server index

/**
 * Function to check connection to a server
 * @param {string} server - Server URL
 * @returns {Promise<boolean>} - True if connected, false otherwise
 */
const checkConnection = async (server) => {
  try {
    const response = await axios.get(`${server}/health-check`);
    return response.status === 200;
  } catch (error) {
    return false;
  }
};

/**
 * Function to connect to a server with retry logic
 * @returns {Promise<string>} - URL of the connected server
 */
const connectToServer = async () => {
  let attempts = 0;
  let success = false;

  while (attempts < RETRY_LIMIT && !success) {
    const currentServer = API_SERVERS[currentServerIndex];

    // console.log(`Attempting to connect to ${currentServer}... (Attempt ${attempts + 1})`);

    success = await checkConnection(currentServer);

    if (success) {
      // console.log(`Connected to ${currentServer}`);
      return currentServer;
    } else {
      // console.log(`Failed to connect to ${currentServer}`);
      attempts++;
    }
  }

  // If all attempts fail, switch to the next server
  currentServerIndex = (currentServerIndex + 1) % API_SERVERS.length;
  console.log(`Switching to the next server: ${API_SERVERS[currentServerIndex]}`);
  return connectToServer(); // Retry with the next server
};

/**
 * Function to monitor the connection to the current server
 * @param {string} server - Server URL
 */
const monitorConnection = (server) => {
  setInterval(async () => {
    const isConnected = await checkConnection(server);

    if (!isConnected) {
      console.log(`Lost connection to ${server}, retrying other servers...`);
      connectToServer();
    }
  }, 1000);
};

export default {
  connectToServer,
  monitorConnection,
};
