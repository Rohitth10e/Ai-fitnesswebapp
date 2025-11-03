const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    weight: { type: Number, required: true },
    height: { type: Number, required: true },

    fitnessGoals: {
        primaryGoal: {
            type: String,
            enum: [
                "Weight Loss",
                "Muscle Gain",
                "General Fitness",
                "Build Strength",
                "Improve Endurance",
                "Increase Flexibility"
            ],
            required: true
        },
        currentFitnessLevel: {
            type: String,
            enum: ["Beginner", "Intermediate", "Advanced"],
            required: true
        }
    },

    workoutPreferences: {
        workoutLocation: {
            type: String,
            enum: ["Home", "Gym", "Outdoor", "Hybrid"],
            required: true
        }
    },

    dietaryPreferences: {
        type: {
            type: String,
            enum: ["Vegetarian", "Vegan", "Non-Vegetarian", "Keto", "Pescatarian", "Other"],
            required: true
        },
        restrictions: [{ type: String }]
    },

    additionalInformation: {
        medicalConditions: { type: String },
        stressLevel: { type: String, enum: ["Low", "Medium", "High"] }
    },
    aiPlan: {
        type: Object,
        default: null
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserData', userSchema);
