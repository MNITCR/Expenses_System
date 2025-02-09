// import axios from "axios";

// const API_SERVERS = ["http://localhost:3000", "http://localhost:3004"]; // List of servers
// const RETRY_LIMIT = 3; // Retry limit for each server

// let currentServerIndex = 0; // Track the current server index

// /**
//  * Function to check connection to a server
//  * @param {string} server - Server URL
//  * @returns {Promise<boolean>} - True if connected, false otherwise
//  */
// const checkConnection = async (server) => {
//   try {
//     const response = await axios.get(`${server}/health-check`);
//     return response.status === 200;
//   } catch (error) {
//     return false;
//   }
// };

// /**
//  * Function to connect to a server with retry logic
//  * @returns {Promise<string>} - URL of the connected server
//  */
// const connectToServer = async () => {
//   let attempts = 0;
//   let success = false;

//   while (attempts < RETRY_LIMIT && !success) {
//     const currentServer = API_SERVERS[currentServerIndex];

//     // console.log(`Attempting to connect to ${currentServer}... (Attempt ${attempts + 1})`);

//     success = await checkConnection(currentServer);

//     if (success) {
//       // console.log(`Connected to ${currentServer}`);
//       return currentServer;
//     } else {
//       // console.log(`Failed to connect to ${currentServer}`);
//       attempts++;
//     }
//   }

//   // If all attempts fail, switch to the next server
//   currentServerIndex = (currentServerIndex + 1) % API_SERVERS.length;
//   console.log(`Switching to the next server: ${API_SERVERS[currentServerIndex]}`);
//   return connectToServer(); // Retry with the next server
// };

// /**
//  * Function to monitor the connection to the current server
//  * @param {string} server - Server URL
//  */
// const monitorConnection = (server) => {
//   setInterval(async () => {
//     const isConnected = await checkConnection(server);

//     if (!isConnected) {
//       console.log(`Lost connection to ${server}, retrying other servers...`);
//       connectToServer();
//     }
//   }, 1000);
// };

// export default {
//   connectToServer,
//   monitorConnection,
// };



// import axios from "axios";

// const API_SERVERS = ["http://localhost:3000", "http://localhost:3004"];
// // // const API_SERVERS = ["https://expenses-system-backend1.onrender.com","https://expenses-system-backend2.onrender.com"];
// const CHECK_INTERVAL = 5000; // Check connection every 5 seconds

// /**
//  * Function to check connection to a server
//  * @param {string} server - Server URL
//  * @returns {Promise<string | null>} - Returns server URL if successful, otherwise null
//  */
// const checkConnection = async (server) => {
//   try {
//     const response = await axios.get(`${server}/health-check`, { timeout: 2000 }); // Timeout to avoid long waits
//     return response.status === 200 ? server : null;
//   } catch {
//     return null;
//   }
// };

// /**
//  * Function to connect to the first available server
//  * @returns {Promise<string | null>} - Returns a working server URL or null if none are available
//  */
// const connectToServer = async () => {
//   try {
//     const availableServer = await Promise.any(API_SERVERS.map(checkConnection));
//     console.log(`Connected to: ${availableServer}`);
//     return availableServer;
//   } catch {
//     console.error("No available servers.");
//     return null;
//   }
// };

// /**
//  * Function to monitor the connection to the current server and switch if needed
//  * @param {string} server - Server URL
//  */
// const monitorConnection = (server) => {
//   setInterval(async () => {
//     const isConnected = await checkConnection(server);
//     if (!isConnected) {
//       console.warn(`Lost connection to ${server}, searching for another server...`);
//       const newServer = await connectToServer();
//       if (newServer) {
//         console.log(`Switched to: ${newServer}`);
//       }
//     }
//   }, CHECK_INTERVAL);
// };

// export default {
//   connectToServer,
//   monitorConnection,
// };


import axios from "axios";

const API_SERVERS = ["http://localhost:3000", "http://localhost:3004"];
const CHECK_INTERVAL = 5000; // Check connection every 5 seconds

let currentServer = null; // Stores the currently connected server

/**
 * Function to check connection to a server
 * @param {string} server - Server URL
 * @returns {Promise<boolean>} - Returns true if server is reachable, otherwise false
 */
const checkConnection = async (server) => {
  try {
    const response = await axios.get(`${server}/health-check`, { timeout: 2000 });
    return response.status === 200;
  } catch {
    return false;
  }
};

/**
 * Function to connect to the first available server
 * @returns {Promise<string | null>} - Returns a working server URL or null if none are available
 */
const connectToServer = async () => {
  for (const server of API_SERVERS) {
    if (await checkConnection(server)) {
      console.log(`Connected to: ${server}`);
      currentServer = server;
      return server;
    }
  }
  console.error("No available servers.");
  currentServer = null;
  return null;
};

/**
 * Function to monitor the current server and reload if necessary
 */
const monitorConnection = () => {
  setInterval(async () => {
    if (!currentServer) {
      console.warn("No active server. Trying to reconnect...");
      await connectToServer();
      return;
    }

    const isConnected = await checkConnection(currentServer);
    if (!isConnected) {
      console.warn(`Lost connection to ${currentServer}, switching server...`);
      await connectToServer(); // Find a new server
    } else {
      console.log(`Server ${currentServer} is still active.`);
    }
  }, CHECK_INTERVAL);
};

// Initialize connection on startup
(async () => {
  await connectToServer();
  monitorConnection();
})();

export default {
  connectToServer,
  monitorConnection,
};
