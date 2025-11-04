const UserData = require('../models/userModel');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Readable } = require('stream');
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
    !fitnessGoals.primaryGoal ||
    !fitnessGoals.currentFitnessLevel ||
    !workoutPreferences ||
    !workoutPreferences.workoutLocation ||
    !dietaryPreferences ||
    !dietaryPreferences.type
  ) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const userDetailsForPrompt = {
    name,
    age,
    gender,
    weight,
    height,
    fitnessGoals,
    workoutPreferences,
    dietaryPreferences,
    additionalInformation,
  };

  try {
    const prompt = `
You are a professional AI fitness and nutrition planner. Your task is to generate a comprehensive, personalized plan based on the user's details.

### USER DETAILS
${JSON.stringify(userDetailsForPrompt, null, 2)}

---

### OUTPUT REQUIREMENTS
You must return **valid JSON only**. Do not include any markdown, comments, or any text outside of the single, valid JSON object.

Follow **exactly this structure**, including all specified keys.

{
  "workoutPlan": {
    "overview": "A brief, encouraging overview of the 7-day workout plan and its philosophy, tailored to the user's goal.",
    "days": [
      {
        "day": "Day 1",
        "focus": "Full Body Strength",
        "exercises": [
          { "name": "Squats", "sets": "3", "reps": "8-10", "rest": "60s" },
          { "name": "Push-ups", "sets": "3", "reps": "As many as possible", "rest": "60s" }
        ]
      },
      { "day": "Day 2", "focus": "Cardio & Core", "exercises": [] },
      { "day": "Day 3", "focus": "Upper Body Focus", "exercises": [] },
      { "day": "Day 4", "focus": "Lower Body Focus", "exercises": [] },
      { "day": "Day 5", "focus": "Active Recovery or Rest", "exercises": [] },
      { "day": "Day 6", "focus": "Full Body Circuit", "exercises": [] },
      { "day": "Day 7", "focus": "Rest Day", "exercises": [] }
    ]
  },
  "dietPlan": {
    "overview": "A short summary of the nutritional strategy, including its main goals (e.g., 'This plan creates a sustainable calorie deficit for fat loss...').",
    "dailyCalories": "2200 kcal",
    "macros": {
      "protein": "150g",
      "carbs": "250g",
      "fats": "60g"
    },
    "hydration": "Drink at least 3 liters (approx. 10-12 glasses) of water per day, increasing on workout days.",
    "supplements": ["Whey Protein (post-workout)", "Vitamin D", "Omega-3 Fish Oil"],
    "meals": [
      {
        "meal": "Breakfast",
        "time": "7:00 AM - 8:00 AM",
        "options": [
          {
            "name": "Protein Oats with Berries",
            "ingredients": "1/2 cup rolled oats, 1 scoop whey protein, 1 cup mixed berries, 1 tbsp chia seeds.",
            "calories": "450", "protein": "35g", "carbs": "60g", "fats": "10g"
          },
          {
            "name": "Scrambled Eggs on Toast",
            "ingredients": "3 large eggs, 2 slices whole-wheat toast, 1/2 avocado, handful of spinach.",
            "calories": "500", "protein": "30g", "carbs": "35g", "fats": "28g"
          }
        ]
      },
      {
        "meal": "Lunch",
        "time": "12:00 PM - 1:00 PM",
        "options": [
          {
            "name": "Grilled Chicken Salad",
            "ingredients": "150g grilled chicken breast, 2 cups mixed greens, 1/2 cup quinoa, assorted vegetables, light vinaigrette.",
            "calories": "550", "protein": "45g", "carbs": "40g", "fats": "20g"
          }
        ]
      },
      {
        "meal": "Dinner",
        "time": "6:00 PM - 7:00 PM",
        "options": [
          {
            "name": "Salmon with Roasted Vegetables",
            "ingredients": "150g salmon fillet, 1 cup broccoli, 1 cup sweet potato (roasted).",
            "calories": "600", "protein": "40g", "carbs": "50g", "fats": "25g"
          }
        ]
      },
      {
        "meal": "Snack",
        "time": "3:00 PM or Post-Workout",
        "options": [
          {
            "name": "Greek Yogurt with Almonds",
            "ingredients": "1 cup plain Greek yogurt, 1/4 cup almonds, 1 tsp honey.",
            "calories": "300", "protein": "25g", "carbs": "20g", "fats": "15g"
          }
        ]
      }
    ]
  }
}

### CRITICAL INSTRUCTIONS
1.  **Fill All 7 Days:** The \`workoutPlan.days\` array must contain 7 objects, one for each day of the week. For "Rest" or "Active Recovery" days, set the \`focus\` appropriately and leave the \`exercises\` array empty.
2.  **Provide Exercise Rest:** Every exercise object **must** include a \`rest\` key with a time string (e.g., "60s", "90s").
3.  **Multiple Meal Options:** For each object in the \`dietPlan.meals\` array, you **must** provide at least one (1) or two (2) different meal choices in its \`options\` array.
4.  **Complete Meal Info:** Every single meal \`option\` must include its \`name\`, \`ingredients\` (as a string), \`calories\`, \`protein\`, \`carbs\`, and \`fats\`.
5.  **Adhere to Preferences:** Strictly follow the user's nested \`fitnessGoals\`, \`workoutPreferences\`, and \`dietaryPreferences\` (e.g., vegetarian, gluten-free) when generating all content.
6.  **JSON Only:** The entire output must be a single, perfectly valid JSON object, starting with \`{\` and ending with \`}\`. No extra text.
7. **Restrictions(Diet): **Focus on Indian cuisine as most of the target audience is from India or as per user preference.
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
      console.error('Raw AI Output:', text);
      return res.status(500).json({
        message: 'Error parsing AI response. The model did not return valid JSON.',
        rawText: text,
      });
    }

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
      aiPlan: plan,
    });

    await userData.save();

    res.status(201).json({
      message: 'User data saved and AI plan generated successfully.',
      userData,
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

const generateNarration = async (req, res) => {
  const { text } = req.body;
  const ELEVEN_LABS_API_KEY = process.env.ELEVEN_LABS_API_KEY;
  const VOICE_ID = '21m00Tcm4TlvDq8ikWAM';

  if (!text) {
    return res.status(400).json({ message: 'Please provide text to narrate.' });
  }

  if (!ELEVEN_LABS_API_KEY) {
    console.error('Eleven Labs API key is not set in .env');
    return res.status(500).json({ message: 'Server configuration error: Missing narration API key.' });
  }

  const apiUrl = `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}/stream`;

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'xi-api-key': ELEVEN_LABS_API_KEY,
      'Accept': 'audio/mpeg',
    },
    body: JSON.stringify({
      text: text,
      model_id: 'eleven_multilingual_v2',
      voice_settings: {
        stability: 0.5,
        similarity_boost: 0.75,
      },
    }),
  };

  try {
    const response = await fetch(apiUrl, options);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('Eleven Labs API error:', response.status, errorBody);
      return res.status(response.status).json({ message: 'Failed to generate speech.', details: errorBody });
    }

    // --- 🚀 STREAMING FIX ---

    // 1. Set the header so the browser knows to play the audio
    res.setHeader('Content-Type', 'audio/mpeg');

    // 2. Get the Web Stream from the fetch response
    const webStream = response.body;

    // 3. Convert it to a Node.js Readable stream
    const nodeStream = Readable.fromWeb(webStream);

    // 4. Pipe the audio stream directly to the client's response
    //    This sends audio data immediately as it arrives.
    nodeStream.pipe(res);

    // 5. Handle stream errors
    nodeStream.on('error', (err) => {
      console.error('Error piping stream:', err);
      if (!res.headersSent) {
        res.status(500).json({ message: 'Error streaming audio' });
      }
    });

  } catch (error) {
    console.error('Error in generateNarration controller:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

const PEXELS_KEY = process.env.PEXELS_API_KEY;
const API_URL = 'https://api.pexels.com/v1/search';

const generateImage = async (req, res) => {
    const { query } = req.body;

    if (!query) {
        return res.status(400).json({ message: 'Please provide an image query.' });
    }

    if (!PEXELS_KEY) {
        console.error('Pexels API key is not set.');
        return res.status(500).json({ message: 'Server configuration error: Missing image API key.' });
    }

    try {
        const response = await fetch(`${API_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`, {
            method: 'GET',
            headers: {
                'Authorization': PEXELS_KEY,
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error('Pexels API error:', errorData);
            throw new Error(errorData.error || 'Failed to fetch image.');
        }

        const data = await response.json();

        if (!data.photos || data.photos.length === 0) {
            return res.status(404).json({ message: 'No image found for that query.' });
        }

        const image = data.photos[0];

        res.status(200).json({ 
            imageUrl: image.src.large,
            altText: image.alt,
            sourceName: image.photographer,
            sourceUrl: image.photographer_url 
        });

    } catch (error) {
        console.error('Error in generateImage controller:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
};

module.exports = { generatePlan, showPlans, generateNarration, generateImage };