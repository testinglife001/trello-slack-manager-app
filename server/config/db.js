// server/config/db.js
const mongoose = require("mongoose");

const dbConnect = async () => {
    try {
        const response = await mongoose.connect(
             process.env.MONGO_URI
        );
        console.log("!! << ... >> ... << ... >> !!");
        console.log(`MongoDB Connected: ${response.connection.host}`);
    } catch (error) {
        console.log(error);
    }
}

module.exports = dbConnect;