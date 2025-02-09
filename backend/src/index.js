const express = require("express");
const { MongoClient } = require('mongodb');
const authMiddleware = require('./middlewares/authMiddlewares');
const productRoute = require('./routes/product.route');
const authRoute = require('./routes/authRoutes');
const userRoute = require('./routes/userRoutes');
const expenseRoute = require('./routes/expenseRoutes');
const categoryExpenseRoute = require('./routes/categoryExpenseRoutes');
const currencyRoute = require('./routes/currencyRoutes');
const ReportRoutes = require('./routes/ReportRoutes');
const SettingRoute = require('./routes/settingRoute');
const dbConnect = require("./config/dbConnect");
const dotenv = require('dotenv').config();
const app = express();
const cors = require('cors');

// Connect to the database
dbConnect();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // allow requests from the frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allow specific HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allow specific headers
}));
// app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true}));

// Routes
app.use("/api/products", productRoute);
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/expense",authMiddleware, expenseRoute);
app.use("/api/category_expense",authMiddleware, categoryExpenseRoute);
app.use("/api/currency",authMiddleware, currencyRoute);
app.use("/api/expense_report",authMiddleware, ReportRoutes);
app.use("/api/setting",authMiddleware, SettingRoute);

// app.get("/", (req, res) => {
//   res.send("<h1>Hello World</h1>");
// });

// *********** sync data
// Database names
const sourceDbName = 'NodeAPI';
const destDbName = 'NodeJS';

// Collection names
const collections = ['categoryexpenses', 'currencies', 'expenses', 'users'];

// MongoDB client setup
const sourceClient = new MongoClient(process.env.CONNECTION_SERVER1);
const destClient = new MongoClient(process.env.CONNECTION_SERVER2);

async function syncData() {
  await sourceClient.connect();
  await destClient.connect();

  const db1 = sourceClient.db(sourceDbName);
  const db2 = destClient.db(destDbName);

  // Loop through the collections and create a change stream for each collection
  collections.forEach((collectionName) => {
    const collection1 = db1.collection(collectionName);
    const collection2 = db2.collection(collectionName);

    // Create a Change Stream on collection1 to watch for changes
    const changeStream = collection1.watch();

    changeStream.on('change', (change) => {
      // console.log('Change detected:', change); 
      const { operationType, documentKey, fullDocument } = change;

      // Depending on the operation type, sync the data to server2
      if (operationType === 'insert') {
        if(fullDocument)
          collection2.insertOne(fullDocument);
      } else if (operationType === 'update') {
        if (fullDocument) {
          collection2.updateOne(
            { _id: documentKey._id },
            { $set: fullDocument }
          );
        }
      } else if (operationType === 'delete') {
        if(documentKey._id)
          collection2.deleteOne({ _id: documentKey._id });
      }
    });
  });
}

syncData().catch(console.error);

app.get("/health-check", (req, res) => {
  res.status(200).send("Server is healthy!");
});

// Start the server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log("Server running on localhost:3000");
});
