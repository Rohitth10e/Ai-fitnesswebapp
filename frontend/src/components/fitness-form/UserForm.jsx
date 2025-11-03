import { useRef, useState } from "react";
import { motion } from 'framer-motion';
import { Loader2, Sparkles, User, Target, Dumbbell, MapPin, Utensils, Heart } from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';

export const UserForm = ({ onPlanGenerated, theme }) => {
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const [formData, setFormData] = useState({
        name: "",
        age: "",
        gender: "",
        weight: "",
        height: "",
        fitnessGoals: {
            primaryGoal: "",
            currentFitnessLevel: ""
        },
        workoutPreferences: {
            workoutLocation: ""
        },
        dietaryPreferences: {
            type: "",
            restrictions: []
        },
        additionalInformation: {
            medicalConditions: "",
            stressLevel: ""
        }
    });

    const updateField = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsGenerating(true);
        setError(null);
        setSuccess(null);

        if (
            !formData.name || !formData.age || !formData.gender || !formData.weight || !formData.height ||
            !formData.fitnessGoals.primaryGoal || !formData.fitnessGoals.currentFitnessLevel ||
            !formData.workoutPreferences.workoutLocation || !formData.dietaryPreferences.type
        ) {
            setError("Please fill in all required (*) fields.");
            setIsGenerating(false);
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/apiv1/users/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Something went wrong');
            }

            console.log('Generated Plan:', result);
            setSuccess('Plan generated successfully! Check your console.');
            onPlanGenerated(result);

        } catch (err) {
            console.error('Error generating plan:', err);
            setError(err.message || 'Failed to generate plan.');
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={
                theme === 'dark'
                    ? 'bg-gray-900 border-gray-800'
                    : 'bg-white border-gray-200' // <--- ADD THIS CLASS
            }>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-purple-500" />
                        <div>
                            Create Your Personalized Plan
                        </div>
                    </CardTitle>
                    <CardDescription>
                        Tell us about yourself and your goals to get a customized workout and diet plan
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-8">
                        <div className="space-y-4">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="w-5 h-5 text-blue-500" />
                                <h3>Personal Information</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                        id="name"
                                        placeholder="John Doe"
                                        value={formData.name}
                                        onChange={(e) => updateField('name', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="age">Age *</Label>
                                    <Input
                                        id="age"
                                        type="number"
                                        placeholder="25"
                                        value={formData.age}
                                        onChange={(e) => updateField('age', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="gender">Gender *</Label>
                                    <Select value={formData.gender} onValueChange={(value) => updateField('gender', value)} required>
                                        <SelectTrigger
                                            id="gender"
                                            className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring"
                                        >
                                            <SelectValue placeholder="Select gender" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="height">Height (cm) *</Label>
                                    <Input
                                        id="height"
                                        type="number"
                                        placeholder="175"
                                        value={formData.height}
                                        onChange={(e) => updateField('height', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="weight">Weight (kg) *</Label>
                                    <Input
                                        id="weight"
                                        type="number"
                                        placeholder="70"
                                        value={formData.weight}
                                        onChange={(e) => updateField('weight', e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-4">
                                    <Target className="w-5 h-5 text-green-500" />
                                    <h3>Fitness Goals</h3>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="fitnessGoal">Primary Goal *</Label>
                                    <Select
                                        value={formData.fitnessGoals.primaryGoal}
                                        onValueChange={(value) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                fitnessGoals: { ...prev.fitnessGoals, primaryGoal: value }
                                            }))
                                        }
                                        required
                                    >
                                        <SelectTrigger id="fitnessGoal" className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring">
                                            <SelectValue placeholder="Select your goal" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Values must match schema enum */}
                                            <SelectItem value="Weight Loss">Weight Loss</SelectItem>
                                            <SelectItem value="Muscle Gain">Muscle Gain</SelectItem>
                                            <SelectItem value="General Fitness">General Fitness</SelectItem>
                                            <SelectItem value="Build Strength">Build Strength</SelectItem>
                                            <SelectItem value="Improve Endurance">Improve Endurance</SelectItem>
                                            <SelectItem value="Increase Flexibility">Increase Flexibility</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="currentLevel">Current Fitness Level *</Label>
                                    <Select
                                        value={formData.fitnessGoals.currentFitnessLevel}
                                        onValueChange={(value) =>
                                            setFormData(prev => ({
                                                ...prev,
                                                fitnessGoals: { ...prev.fitnessGoals, currentFitnessLevel: value }
                                            }))
                                        }
                                        required
                                    >
                                        <SelectTrigger id="currentLevel" className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring">
                                            <SelectValue placeholder="Select your level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {/* Values must match schema enum */}
                                            <SelectItem value="Beginner">Beginner</SelectItem>
                                            <SelectItem value="Intermediate">Intermediate</SelectItem>
                                            <SelectItem value="Advanced">Advanced</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Dumbbell className="w-5 h-5 text-orange-500" />
                                        <h3>Workout Preferences</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="workoutLocation">Workout Location *</Label>
                                        <Select
                                            value={formData.workoutPreferences.workoutLocation}
                                            onValueChange={(value) => {
                                                setFormData((prev) => ({
                                                    ...prev,
                                                    workoutPreferences: { ...prev.workoutPreferences, workoutLocation: value }
                                                }))
                                            }}
                                            required
                                        >
                                            <SelectTrigger id="workoutLocation" className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring">
                                                <SelectValue placeholder="Where will you work out?" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {/* Values must match schema enum */}
                                                <SelectItem value="Gym">Gym</SelectItem>
                                                <SelectItem value="Home">Home</SelectItem>
                                                <SelectItem value="Outdoor">Outdoor</SelectItem>
                                                <SelectItem value="Hybrid">Hybrid (Mix)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Utensils className="w-5 h-5 text-red-500" />
                                        <h3>Dietary Preferences</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dietaryPreference">Dietary Preference *</Label>
                                        <Select
                                            value={formData.dietaryPreferences.type}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    dietaryPreferences: { ...prev.dietaryPreferences, type: value }
                                                }))
                                            }
                                            required
                                        >
                                            <SelectTrigger id="dietaryPreference" className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring">
                                                <SelectValue placeholder="Select your diet type" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Non-Vegetarian">Non-Vegetarian</SelectItem>
                                                <SelectItem value="Vegetarian">Vegetarian</SelectItem>
                                                <SelectItem value="Vegan">Vegan</SelectItem>
                                                <SelectItem value="Keto">Keto</SelectItem>
                                                <SelectItem value="Pescatarian">Pescatarian</SelectItem>
                                                <SelectItem value="Other">Other</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="dietaryRestrictions">Dietary Restrictions (Optional)</Label>
                                        <Textarea
                                            id="dietaryRestrictions"
                                            placeholder="e.g., Peanuts, Gluten, Shellfish (comma-separated)"
                                            value={formData.dietaryPreferences.restrictions.join(', ')}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    dietaryPreferences: {
                                                        ...prev.dietaryPreferences,
                                                        restrictions: e.target.value
                                                            .split(',')
                                                            .map(s => s.trim())
                                                            .filter(Boolean)
                                                    }
                                                }))
                                            }
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Heart className="w-5 h-5 text-pink-500" />
                                        <h3>Additional Information (Optional)</h3>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="medicalConditions">Medical History or Injuries</Label>
                                        <Textarea
                                            id="medicalConditions"
                                            placeholder="Any medical conditions, injuries, or limitations we should know about..."
                                            value={formData.additionalInformation.medicalConditions}
                                            onChange={(e) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    additionalInformation: { ...prev.additionalInformation, medicalConditions: e.target.value }
                                                }))
                                            }
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stressLevel">Current Stress Level</Label>
                                        <Select
                                            value={formData.additionalInformation.stressLevel}
                                            onValueChange={(value) =>
                                                setFormData(prev => ({
                                                    ...prev,
                                                    additionalInformation: { ...prev.additionalInformation, stressLevel: value }
                                                }))
                                            }
                                        >
                                            <SelectTrigger id="stressLevel" className="w-full h-10 border border-input bg-background rounded-md px-3 text-sm focus:ring-2 focus:ring-ring">
                                                <SelectValue placeholder="Select stress level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Low">Low</SelectItem>
                                                <SelectItem value="Medium">Medium</SelectItem>
                                                <SelectItem value="High">High</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    {error && <div className="text-red-500 font-medium">{error}</div>}
                                    {success && <div className="text-green-500 font-medium">{success}</div>}

                                    <Button
                                        type="submit"
                                        size="lg"
                                        className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                                        disabled={isGenerating}
                                    >
                                        {isGenerating ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                Generating Your Plan...
                                            </>
                                        ) : (
                                            <>
                                                <Sparkles className="w-5 h-5 mr-2" />
                                                Generate My Plan
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </motion.div>
    )
}
