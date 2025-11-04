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
    /^http:\/\/localhost:\d{4,5}$/, // Matches http://localhost:1234, etc.
    /\.netlify\.app$/  // Matches any subdomain ending in .netlify.app
];

const connectDB = async () => {
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
        // Allow requests with no origin (like Postman, mobile apps)
        if (!origin) return callback(null, true);

        const isAllowed = allowedOrigins.some((allowed) => {
            if (typeof allowed === 'string') {
                return allowed === origin;
            }
            if (allowed instanceof RegExp) {
                return allowed.test(origin); // Test the regex
            }
            return false;
        });

        if (isAllowed) {
            callback(null, true);
        } else {
            callback(new Error('CORS policy does not allow access from this origin.'));
        }
    }
}));
app.use('/apiv1/users', routes);

connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    })
}).catch(err => {
    console.log("Failed to start server due to MongoDB connection error.", err);
});