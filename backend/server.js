const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const routes = require('./routes/routes.js');
dotenv.config();

const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

const allowedOrigins = [
    'http://localhost:5173',
    'https://ai-fitnesswebapp.netlify.app' 
];

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
app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy does not allow access from this origin.'));
        }
    }
}));
app.use('/apiv1/users', routes);

app.listen(PORT, () => {
    connectDB()   
    console.log(`Server is running on port ${PORT}`);
})