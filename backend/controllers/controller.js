const UserData = require('../models/userDataModel');

export const getUserData = async(req,res) => {
    const {name, age, gender, weight, height, fitnessGoals, workoutPreferences, dietaryPreferences, additionalInformation } = req.body;
    try {
        if (!name || !age || !gender || !weight || !height || !fitnessGoals || !workoutPreferences || !dietaryPreferences) {
           return res.json({ message: "Please provide all required fields." }).status(400);
        }

        const userData = UserData({
            name, age, gender, weight, height, fitnessGoals, workoutPreferences, dietaryPreferences, additionalInformation  
        })
        await userData.save();
        res.status(201).json({ message: "User data received successfully", data: userData });
    } catch(error) {
        console.error("Error receiving user data:", error);
        res.status(500).json({ message: "Internal server error" });
    }
}