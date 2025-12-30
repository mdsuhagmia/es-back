const mongoose = require("mongoose");
const { mongodbURL } = require("../secret");

const connectDatabase = async (options = {})=>{
    try {
        await mongoose.connect(mongodbURL, options);
         console.log("MongoDB connection established successfully");
        
        mongoose.connection.on('error', (err)=>{
            console.log("DB connection error", err.message);
        })
    } catch (error) {
        console.log("DB is not connected", error.toString());
        process.exit(1);
    }
}

module.exports = connectDatabase;