const UserData = require('../models/userModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

const generatePlan = async (req, res) => {
    const {
        name,
        age,
        gender,
        weight,
        height,
        fitnessGoals,
        workoutPreferences,
        dietaryPreferences,
        additionalInformation,
    } = req.body;

    if (
        !name ||
        !age ||
        !gender ||
        !weight ||
        !height ||
        !fitnessGoals ||
        !workoutPreferences ||
        !dietaryPreferences
    ) {
        return res.status(400).json({ message: 'Please provide all required fields.' });
    }

    try {
        const userData = new UserData({
            name,
            age,
            gender,
            weight,
            height,
            fitnessGoals,
            workoutPreferences,
            dietaryPreferences,
            additionalInformation,
        });
        await userData.save();

        const prompt = `
You are a professional AI fitness and nutrition planner.

Generate a personalized plan based on the user details below.

### USER DETAILS
${JSON.stringify({
            name,
            age,
            gender,
            weight,
            height,
            fitnessGoals,
            workoutPreferences,
            dietaryPreferences,
            additionalInformation,
        }, null, 2)}

---

### OUTPUT REQUIREMENTS
You must return **valid JSON only**, no markdown, no comments, no extra text.

Follow **exactly this structure**:

{
  "workoutPlan": {
    "schedule": [
      { "day": "", "focus": "" }
    ],
    "routineDetails": [
      {
        "day": "",
        "focus": "",
        "warmUp": "",
        "exercises": [
          { "name": "", "sets": "", "reps": "", "notes": "" }
        ],
        "coolDown": ""
      }
    ],
    "generalNotes": ""
  },
  "dietPlan": {
    "calorieTarget": "",
    "macronutrientBreakdown": {
      "protein": "",
      "carbohydrates": "",
      "fats": ""
    },
    "notes": "",
    "dailyPlan": [
      {
        "meal": "",
        "time": "",
        "description": "",
        "items": [],
        "calories": "",
        "protein": "",
        "carbs": "",
        "fats": ""
      }
    ],
    "approxTotals": {
      "calories": "",
      "protein": "",
      "carbs": "",
      "fats": ""
    }
  },
  "tips": [
    {
      "category": "",
      "points": [""]
    }
  ]
}

Ensure:
- All meals include nutrients (calories, protein, carbs, fats).
- Adapt workouts based on fitness goal, level, and location.
- Respect dietary type & restrictions.
- Output must be 100% valid JSON — no markdown or text outside JSON.
`;

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

        const result = await model.generateContent(prompt);

        const text = result.response.text();
        const jsonText = text.replace(/```json|```/g, '').trim();

        let plan;
        try {
            plan = JSON.parse(jsonText);
        } catch (parseError) {
            console.error('JSON parsing error:', parseError);
            return res.status(200).json({
                message: 'Plan generated, but output was not valid JSON.',
                rawText: text,
            });
        }
        userData.aiPlan = plan;
        await userData.save();

        res.status(201).json({
            message: 'User data saved and AI plan generated successfully.',
            userData,
            aiPlan: plan,
        });

    } catch (error) {
        console.error('Error generating plan:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

const showPlans = async (req, res) => {
    try {
        const plans = await UserData.find({ aiPlan: { $ne: null } })
            .select('name age gender fitnessGoals aiPlan createdAt')
            .sort({ createdAt: -1 });
        res.status(200).json({ plans });
    } catch (error) {
        console.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
}

module.exports = { generatePlan, showPlans };
