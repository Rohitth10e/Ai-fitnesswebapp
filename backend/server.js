const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/routes.js');
dotenv.config();

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const connectDB = async() => {
    try {
        await mongoose.connect(MONGO_URI);
        console.log("MongoDB connected successfully");
    } catch (error) {
        console.error("MongoDB connection failed:", error);
        process.exit(1);
    }
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use('/apiv1/users', routes);

app.listen(PORT, () => {
    connectDB()   
    console.log(`Server is running on port ${PORT}`);
})