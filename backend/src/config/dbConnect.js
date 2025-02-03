const mongoose = require('mongoose');

const dbConnect = async () =>{
    try {
        const connect = await mongoose.connect(process.env.CONNECTION_STRING);
        console.log(`Database connected: ${connect.connection.host}, ${connect.connection.name}`);
    } catch (error) {
        console.log(error.message);
        const connect = await mongoose.connect('mongodb://localhost:27017/NodeJS');
        console.log(`Connected to the local database: ${connect.connection.host}, ${connect.connection.name}`);
        // process.exit(1);
    }
}

module.exports = dbConnect;
