const mongoose = require('mongoose');

const userSchema = new Mongoose.Schema({
    name: { typeof: String, required: true },
    age: { typeof: Number, required: true },
    gender: { typeof: String, required: true },
    weight: { typeof: Number, required: true },
    height: { typeof: Number, required: true },
    fitnessGoals: {
        primaryGoal: {
            typeof: String, enum: [
                "Weight Loss", "Muscle Gain", "General Fitness", "Build Strength", "Improve Endurance", "Increase Flexibility"],
            required: true
        },
        currentFitnessLevel: {
            typeof: String, enum: [
                "Beginner", "Intermediate", "Advanced"],
            required: true
        }
    },
    workoutPreferences: {
        workoutlocation: {
            typeof: String, enum: [
                "Home", "Gym", "Outdoor", "hybrid",
            ],
            required: true
        },
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

    createdAt: { type: Date, default: Date.now }
})

export const UserData = mongoose.model('UserData', userSchema);