import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
    Download,
    Volume2,
    VolumeX,
    Dumbbell,
    Utensils,
    Calendar,
    Clock,
    Flame,
    TrendingUp,
    Save,
    Image as ImageIcon
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs.tsx';
import { Badge } from '../ui/badge.tsx';
// import { Progress } from '../ui/progress.tsx';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion.tsx';
import { toast } from 'sonner';

const generateNarrationText = (plan) => {
    if (!plan?.userData?.aiPlan) return "";
    const { aiPlan, fitnessGoals, age } = plan.userData;
    
    let text = `Hello. Here is your AI fitness plan. `;
    text += `You are ${age} years old and your primary goal is ${fitnessGoals.primaryGoal}. `;

    // Workout Plan
    text += "Let's review the workout plan. ";
    text += `${aiPlan.workoutPlan.overview}. `;
    
    (aiPlan.workoutPlan?.days || []).forEach(day => {
        text += `On ${day.day}, the focus is ${day.focus}. `;
        if (day.exercises && day.exercises.length > 0) {
            text += "You will perform: ";
            (day.exercises || []).forEach(ex => {
                text += `${ex.name}: ${ex.sets} sets of ${ex.reps} reps, with ${ex.rest} rest. `;
            });
        } else {
            text += "This is a rest or active recovery day. ";
        }
    });

    // Diet Plan
    text += "Now for the diet plan. ";
    text += `${aiPlan.dietPlan.overview}. `;
    text += `Your target is ${aiPlan.dietPlan.dailyCalories} calories. `;
    if (aiPlan.dietPlan.macros) {
        text += `Macros are: ${aiPlan.dietPlan.macros.protein} of protein, ${aiPlan.dietPlan.macros.carbs} of carbs, and ${aiPlan.dietPlan.macros.fats} of fats. `;
    }
    text += `For hydration, ${aiPlan.dietPlan.hydration}. `;

    text += "Here are your meal options: ";
    (aiPlan.dietPlan?.meals || []).forEach(meal => {
        text += `For ${meal.meal} around ${meal.time}: `;
        const options = (meal.options || []).map(opt => opt.name).join(', or ');
        text += options + ". ";
    });
    
    text += "Your plan narration is complete. Good luck!";
    return text;
};

export default function PlanDisplay({ theme, plan }) {
    const [isNarrating, setIsNarrating] = useState(false);
    const [selectedImage, setSelectedImage] = useState(null);

    const audioSourceRef = useRef(null);
    const audioContextRef = useRef(null);

    const handleNarration = async () => {
        // --- STOP NARRATION LOGIC ---
        if (isNarrating) {
            if (audioSourceRef.current) {
                try {
                    audioSourceRef.current.stop(); // Stop the sound
                } catch (e) {
                    console.warn("Audio stop error:", e.message);
                }
            }
            if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                audioContextRef.current.close().catch(console.warn); // Clean up context
            }
            setIsNarrating(false);
            toast.info('Narration stopped');
            return; // Exit function
        }

        // --- START NARRATION LOGIC ---
        setIsNarrating(true);
        toast.success('Starting narration...');

        try {
            const textToSpeak = generateNarrationText(plan);

            if (!textToSpeak) {
                throw new Error('Could not find plan text to narrate.');
            }

            // 1. Call your backend narration endpoint
            // IMPORTANT: Update '/api/generate-narration' to your actual route if it's different
            const response = await fetch('http://localhost:3000/apiv1/users/generate-narration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text: textToSpeak }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to fetch audio');
            }

            // 2. Get the audio data as an ArrayBuffer
            const audioData = await response.arrayBuffer();

            // 3. Use Web Audio API to play it
            audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
            const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);

            audioSourceRef.current = audioContextRef.current.createBufferSource();
            audioSourceRef.current.buffer = audioBuffer;
            audioSourceRef.current.connect(audioContextRef.current.destination);
            audioSourceRef.current.start(0);
            toast.dismiss(); // Dismiss "Starting..." toast
            toast.info("Narration playing...");

            // 4. Handle when the audio finishes playing
            audioSourceRef.current.onended = () => {
                setIsNarrating(false);
                toast.info('Narration completed');
                if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
                    audioContextRef.current.close().catch(console.warn);
                }
            };
        } catch (error) {
            console.error('Narration error:', error);
            setIsNarrating(false);
            toast.error(error.message || 'Failed to start narration.');
        }
    };

    const handleDownloadPDF = () => {
        try {
            const doc = new jsPDF();
            const { userData } = plan;
            const { aiPlan } = plan.userData;

            doc.setFontSize(20);
            doc.text('Your AI Fitness Plan', 105, 20, { align: 'center' });

            doc.setFontSize(14);
            doc.text('Your Profile', 14, 35);
            doc.setFontSize(10);
            doc.text(`Age: ${userData.age} years`, 14, 42);
            doc.text(`Weight: ${userData.weight} kg`, 14, 47);
            doc.text(`Height: ${userData.height} cm`, 14, 52);
            doc.text(`Goal: ${userData.fitnessGoals.primaryGoal}`, 14, 57);

            doc.addPage();
            doc.setFontSize(14);
            doc.text('7-Day Workout Schedule', 14, 20);
            doc.setFontSize(10);

            const overviewText = aiPlan.workoutPlan.overview;
            const overviewStartY = 27;
            doc.text(overviewText, 14, overviewStartY, { maxWidth: 180 });

            const textMetrics = doc.getTextDimensions(overviewText, { maxWidth: 180 });
            const textHeight = textMetrics.h;

            const tableStartY = overviewStartY + textHeight + 5;
            const workoutBody = [];
            aiPlan?.workoutPlan?.days.forEach(day => {
                const exercises = day.exercises
                    .map(ex => `${ex.name} (${ex.sets} sets x ${ex.reps} reps, ${ex.rest} rest)`)
                    .join('\n');
                workoutBody.push([day.day, day.focus, exercises]);
            });

            autoTable(doc, {
                startY: tableStartY,
                head: [['Day', 'Focus', 'Exercises']],
                body: workoutBody,
                styles: { cellPadding: 2 },
                headStyles: { fillColor: [22, 160, 133] },
            });

            // --- Diet Plan ---
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Daily Meal Plan', 14, 20);
            doc.setFontSize(10);
            doc.text(aiPlan.dietPlan.overview, 14, 27, { maxWidth: 180 });


            const mealBody = [];
            aiPlan.dietPlan.meals.forEach(meal => {
                const options = meal.options
                    .map(opt => `${opt.name} (${opt.calories} cal)\n${opt.ingredients}`)
                    .join('\n\n');
                mealBody.push([meal.meal, meal.time, options]);
            });

            autoTable(doc, {
                startY: tableStartY,
                head: [['Meal', 'Time', 'Options (Name, Calories, Ingredients)']],
                body: mealBody,
                styles: { cellPadding: 2, minCellHeight: 20 },
                headStyles: { fillColor: [41, 128, 185] },
            });

            doc.save('AI-Fitness-Plan.pdf');
            toast.success('PDF downloaded successfully!');

        } catch (error) {
            console.error('PDF Generation Error:', error);
            toast.error('Failed to generate PDF.');
        }
    };

    const handleSavePlan = () => {
        toast.success('Plan saved to your library!');
    };

    const handleImageClick = (type, name) => {
        setSelectedImage({ type, name });
        toast.info(`Showing image for ${type}: ${name}`);
    };

    if (!plan || !plan.userData || !plan.userData.aiPlan) {
        return (
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white'}>
                <CardContent className="pt-6 text-center">
                    <p>Loading plan...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
        >
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'}>
                <CardContent className="pt-6">
                    <div className="flex flex-wrap gap-3">
                        <Button
                            onClick={handleNarration}
                            variant={isNarrating ? 'default' : 'outline'}
                            className="gap-2"
                        >
                            {isNarrating ? (
                                <>
                                    <VolumeX className="w-4 h-4" />
                                    Stop Narration
                                </>
                            ) : (
                                <>
                                    <Volume2 className="w-4 h-4" />
                                    Read Plan Aloud
                                </>
                            )}
                        </Button>

                        <Button onClick={handleDownloadPDF} variant="outline" className="gap-2">
                            <Download className="w-4 h-4" />
                            Export PDF
                        </Button>

                        <Button onClick={handleSavePlan} variant="outline" className="gap-2">
                            <Save className="w-4 h-4" />
                            Save Plan
                        </Button>
                    </div>
                </CardContent>
            </Card>
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'}>
                <CardHeader>
                    <CardTitle>Your Profile</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Age
                            </p>
                            <p>{plan.userData.age} years</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Height
                            </p>
                            <p>{plan.userData.height} cm</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Weight
                            </p>
                            <p>{plan.userData.weight} kg</p>
                        </div>
                        <div>
                            <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                Goal
                            </p>
                            {/* --- FIX #1 --- */}
                            <p className="capitalize">{plan.userData.fitnessGoals.primaryGoal}</p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Tabs defaultValue="workout" className="w-full">
                <TabsList className={`grid w-full grid-cols-2 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white border-gray-300'}`}>
                    <TabsTrigger value="workout" className="gap-2">
                        <Dumbbell className="w-4 h-4" />
                        Workout Plan
                    </TabsTrigger>
                    <TabsTrigger value="diet" className="gap-2">
                        <Utensils className="w-4 h-4" />
                        Diet Plan
                    </TabsTrigger>
                </TabsList>

                {/* Workout Plan Tab */}
                <TabsContent value="workout" className="mt-6">
                    <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="w-5 h-5" />
                                7-Day Workout Schedule
                            </CardTitle>
                            {/* --- FIX #2 --- */}
                            <CardDescription>{plan.userData.aiPlan.workoutPlan.overview}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Accordion type="single" collapsible className="w-full">
                                {/* --- FIX #2 --- */}
                                {plan.userData.aiPlan.workoutPlan.days.map((day, index) => (
                                    <AccordionItem key={index} value={`day-${index}`}>
                                        <AccordionTrigger className="hover:no-underline">
                                            <div className="flex items-center justify-between w-full pr-4">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="outline" className="px-3 py-1">
                                                        {day.day}
                                                    </Badge>
                                                    <span>{day.focus}</span>
                                                </div>
                                                <Badge className="bg-blue-500 hover:bg-blue-600">
                                                    {day.exercises.length} exercises
                                                </Badge>
                                            </div>
                                        </AccordionTrigger>
                                        <AccordionContent>
                                            <div className="space-y-4 pt-4">
                                                {day.exercises.map((exercise, exIndex) => (
                                                    <motion.div
                                                        key={exIndex}
                                                        initial={{ opacity: 0, x: -20 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: exIndex * 0.1 }}
                                                        className={`p-4 rounded-lg border ${theme === 'dark'
                                                            ? 'bg-gray-800 border-gray-700'
                                                            : 'bg-gray-50 border-gray-200'
                                                            }`}
                                                    >
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 mb-2">
                                                                    <h4>{exercise.name}</h4>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="ghost"
                                                                        onClick={() => handleImageClick('exercise', exercise.name)}
                                                                        className="gap-1"
                                                                    >
                                                                        <ImageIcon className="w-4 h-4" />
                                                                    </Button>
                                                                </div>
                                                                <div className="flex flex-wrap gap-4 text-sm">
                                                                    <div className="flex items-center gap-1">
                                                                        <TrendingUp className={`w-4 h-4 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
                                                                            }`} />
                                                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                                                            {exercise.sets} sets
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Dumbbell className={`w-4 h-4 ${theme === 'dark' ? 'text-green-400' : 'text-green-600'
                                                                            }`} />
                                                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                                                            {exercise.reps} reps
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex items-center gap-1">
                                                                        <Clock className={`w-4 h-4 ${theme === 'dark' ? 'text-orange-400' : 'text-orange-600'
                                                                            }`} />
                                                                        <span className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                                                            {exercise.rest} rest
                                                                        </span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </div>
                                        </AccordionContent>
                                    </AccordionItem>
                                ))}
                            </Accordion>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Diet Plan Tab */}
                <TabsContent value="diet" className="mt-6 space-y-6">
                    <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'}>
                        <CardHeader>
                            <CardTitle>Daily Nutrition Goals</CardTitle>
                            <CardDescription>{plan.userData.aiPlan.dietPlan.overview}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-blue-50'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Flame className="w-5 h-5 text-orange-500" />
                                        <span className="text-sm">Daily Calories</span>
                                    </div>
                                    {/* --- FIX #2 --- */}
                                    <p className="text-2xl">{plan.userData.aiPlan.dietPlan.dailyCalories}</p>
                                </div>
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-green-50'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <TrendingUp className="w-5 h-5 text-green-500" />
                                        <span className="text-sm">Protein</span>
                                    </div>
                                    {/* --- FIX #2 --- */}
                                    <p className="text-2xl">{plan.userData.aiPlan.dietPlan.macros.protein}</p>
                                </div>
                                <div className={`p-4 rounded-lg ${theme === 'dark' ? 'bg-gray-800' : 'bg-purple-50'
                                    }`}>
                                    <div className="flex items-center gap-2 mb-2">
                                        <Utensils className="w-5 h-5 text-purple-500" />
                                        <span className="text-sm">Carbs / Fats</span>
                                    </div>
                                    {/* --- FIX #2 --- */}
                                    <p className="text-2xl">{plan.userData.aiPlan.dietPlan.macros.carbs} / {plan.userData.aiPlan.dietPlan.macros.fats}</p>
                                </div>
                            </div>

                            <div>
                                <h4 className="mb-2">Hydration</h4>
                                <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                                    {plan.userData.aiPlan.dietPlan.hydration}
                                </p>
                            </div>

                            <div>
                                <h4 className="mb-2">Recommended Supplements</h4>
                                <div className="flex flex-wrap gap-2">
                                    {plan.userData.aiPlan.dietPlan.supplements.map((supp, index) => (
                                        <Badge key={index} variant="secondary">
                                            {supp}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Meal Plan */}
                    <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-300'}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Utensils className="w-5 h-5" />
                                Daily Meal Plan
                            </CardTitle>
                            <CardDescription>Choose from multiple options for each meal</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* --- FIX #2 --- */}
                                {plan.userData.aiPlan.dietPlan.meals.map((mealTime, index) => (
                                    <div key={index} className={`p-4 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-gray-50 border-gray-200'
                                        }`}>
                                        <div className="flex items-center justify-between mb-4">
                                            <div>
                                                <h4>{mealTime.meal}</h4>
                                                <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                                                    {mealTime.time}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {mealTime.options.map((option, optIndex) => (
                                                <motion.div
                                                    key={optIndex}
                                                    initial={{ opacity: 0, scale: 0.95 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    transition={{ delay: optIndex * 0.1 }}
                                                    className={`p-4 rounded-lg border cursor-pointer transition-all hover:shadow-lg ${theme === 'dark'
                                                        ? 'bg-gray-900 border-gray-600 hover:border-purple-500'
                                                        : 'bg-white border-gray-300 hover:border-purple-500'
                                                        }`}
                                                    onClick={() => handleImageClick('meal', option.name)}
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <h5 className="flex-1">{option.name}</h5>
                                                        <ImageIcon className="w-4 h-4 text-purple-500" />
                                                    </div>
                                                    <p className={`text-sm mb-3 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                                        }`}>
                                                        {option.ingredients}
                                                    </p>
                                                    <div className="flex flex-wrap gap-2">
                                                        <Badge className="bg-orange-500 hover:bg-orange-600">
                                                            {option.calories} cal
                                                        </Badge>
                                                        <Badge variant="outline">P: {option.protein}</Badge>
                                                        <Badge variant="outline">C: {option.carbs}</Badge>
                                                        <Badge variant="outline">F: {option.fats}</Badge>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}