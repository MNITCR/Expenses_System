const { MongoClient } = require('mongodb');

async function watchChanges() {
    const client = new MongoClient('mongodb+srv://admin:svgC7rBimJRZTQV4@backenddb.j1gyv.mongodb.net/NodeAPI?retryWrites=true&w=majority&appName=BackendDB');
    await client.connect();
    const db = client.db('NodeAPI');

    // List of collections to watch
    const collectionsToWatch = ['categoryexpenses', 'currencies', 'expenses', 'users'];

    // Create an array to hold the change streams
    const changeStreams = collectionsToWatch.map(collectionName => {
        const collection = db.collection(collectionName);
        return collection.watch().on('change', async (change) => {
            console.log(`Change detected in ${collectionName}:`, change);

            // Replicate the change to the second server
            const client2 = new MongoClient('mongodb://localhost:27017');
            await client2.connect();
            const db2 = client2.db('NodeJs');
            const collection2 = db2.collection(collectionName);

            try {
                if (change.operationType === 'insert') {
                    await collection2.insertOne(change.fullDocument);
                } else if (change.operationType === 'update') {
                    await collection2.updateOne({ _id: change.documentKey._id }, { $set: change.updateDescription.updatedFields });
                } else if (change.operationType === 'delete') {
                    await collection2.deleteOne({ _id: change.documentKey._id });
                }
            } catch (error) {
                console.error(`Error replicating change to ${collectionName}:`, error);
            } finally {
                await client2.close();
            }
        });
    });

    // Wait for all change streams to be set up
    await Promise.all(changeStreams);
}

watchChanges().catch(console.error);
