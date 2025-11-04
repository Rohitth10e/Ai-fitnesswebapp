import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Eye, Calendar, Target, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card.tsx';
import { Button } from '../ui/button.tsx';
import { Badge } from '../ui/badge.tsx';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '../ui/alert-dialog.tsx';
import { toast } from 'sonner';

export default function SavedPlans({ onLoadPlan, theme }) {
    const [savedPlans, setSavedPlans] = useState()
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/apiv1/users/plans}`, {
                    method: 'GET'
                })


                if (!response.ok) {
                    const errorData = await response.json();
                    return toast.error(errorData.message || 'Failed to fetch saved plans.')
                }

                const data = await response.json()
                console.log(data)
                setSavedPlans(data.plans)
            } catch (err) {
                console.error("Fetch plans error:", err);
                setError(err.message);
                toast.error(err.message);
            } finally {
                setIsLoading(false)
            }
        }

        fetchPlans();
    }, [])

    const handlePlan = () => {
        const completePlan = {
            userData: plan
        }
        onLoadPlan(completePlan)
        toast.success(`Loaded plan for ${plan.name}`);
    }

    const handleDeletePlan = async (planId, planName) => {
        try {
            const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/apiv1/users/plans/${planId}}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete plan.');
            }

            setSavedPlans(prev => prev.filter(p => p._id !== planId));
            toast.success(`Deleted plan for ${planName}`);

        } catch (err) {
            console.error('Delete plan error:', err);
            toast.error(err.message);
        }
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    if (isLoading) {
        return (
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center flex flex-col items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin mb-4" />
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Loading saved plans...
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                    <h3 className="mb-2 text-red-500">Error</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        {error}border-gray-200
                    </p>
                </CardContent>
            </Card>
        );
    }

    if (!isLoading && savedPlans.length === 0) {
        return (
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}>
                <CardContent className="py-12 text-center">
                    <div className={`mx-auto w-16 h-16 rounded-full flex items-center justify-center mb-4 ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'
                        }`}>
                        <Calendar className={`w-8 h-8 ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                            }`} />
                    </div>
                    <h3 className="mb-2">No Saved Plans</h3>
                    <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>
                        Create and save your first personalized fitness plan to see it here.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <Card className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}>
                <CardHeader>
                    <CardTitle>Your Saved Plans</CardTitle>
                    <CardDescription>
                        {savedPlans.length} {savedPlans.length === 1 ? 'plan' : 'plans'} saved
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {savedPlans.map((plan, index) => (
                            <motion.div
                                key={plan._id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.1 }}
                            >
                                <Card className={`h-full flex flex-col ${theme === 'dark'
                                        ? 'bg-gray-800 border-gray-700 hover:border-purple-500'
                                        : 'bg-gray-50 border-gray-200 hover:border-purple-500'
                                    } transition-all hover:shadow-lg`}>
                                    <CardHeader>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <CardTitle className="text-lg mb-2">{plan.name}</CardTitle>
                                                <div className="flex flex-wrap gap-2">
                                                    <Badge variant="outline" className="gap-1 capitalize">
                                                        {plan.fitnessGoals?.primaryGoal ?? 'N/A'}
                                                    </Badge>
                                                    <Badge variant="secondary" className="capitalize bg-gray-200 text-black">
                                                        {plan.fitnessGoals?.currentFitnessLevel ?? 'N/A'}
                                                    </Badge>
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="flex-1 flex flex-col justify-between space-y-4">
                                        <div className={`text-sm flex items-center gap-2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
                                            }`}>
                                            <Calendar className="w-4 h-4" />
                                            Saved {formatDate(plan.createdAt)}
                                        </div>

                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => onLoadPlan({ userData: plan })}
                                                className="flex-1 gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Load
                                            </Button>

                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button size="sm" variant="outline" className="gap-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent className={theme === 'dark' ? 'bg-gray-900 border-gray-800' : ''}>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Delete Plan?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            Are you sure you want to delete the plan for {plan.name}? This action cannot be undone.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction
                                                            onClick={() => handleDeletePlan(plan._id, plan.name)} 
                                                            className="bg-red-500 hover:bg-red-600"
                                                        >
                                                            Delete
                                                        </AlertDialogAction>
                                                    </AlertDialogFooter>
                                                </AlertDialogContent>
                                            </AlertDialog>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    )
}