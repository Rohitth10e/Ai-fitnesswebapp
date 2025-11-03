import { useState } from "react"
import { UserForm } from "./components/fitness-form/UserForm.jsx"
import { motion } from 'framer-motion'
import MotivationSection from "./components/banner/MotivationSection.jsx"
import PlanDisplay  from "./components/plans/PlanDisplay.jsx"
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs.tsx'
import { Button } from './components/ui/button.tsx'
import { Sparkles, Moon, Sun } from "lucide-react"

function App() {
  const [theme, setTheme] = useState('light')
  const [currentPlan, setCurrentPlan] = useState(null)
  const [activeTab, setActiveTab] = useState('form')

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const handlePlanGenerated = (plan) => {
    setCurrentPlan(plan);
    setActiveTab('plan');
  };

  const handleLoadPlan = (plan) => {
    setCurrentPlan(plan);
    setActiveTab('plan');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme === 'dark' ? 'bg-gray-950 text-white' : 'bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50'
      }`}>
      <header className={`sticky top-0 z-50 backdrop-blur-lg border-b ${theme === 'dark' ? 'bg-gray-900/80 border-gray-800' : 'bg-white/80 border-gray-200'
        }`}>
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className={theme === 'dark' ? 'text-white' : 'text-gray-900'}>
                AI Fitness Coach
              </h1>
              <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
                Your Personal Health & Wellness Guide
              </p>
            </div>
          </motion.div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5" />
            ) : (
              <Sun className="w-5 h-5" />
            )}
          </Button>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <MotivationSection theme={theme} />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-8">
          <TabsList className={`grid w-full grid-cols-3 ${theme === 'dark' ? 'bg-gray-900' : 'bg-white'
            }`}>
            <TabsTrigger value="form">Create Plan</TabsTrigger>
            <TabsTrigger value="plan" disabled={!currentPlan}>
              View Plan
            </TabsTrigger>
            <TabsTrigger value="saved">Saved Plans</TabsTrigger>
          </TabsList>
          <TabsContent value="form" className="mt-6">
            <UserForm onPlanGenerated={handlePlanGenerated} theme={theme} />
          </TabsContent>
          <TabsContent value="plan" className="mt-6">
            {currentPlan && (
              <PlanDisplay plan={currentPlan} theme={theme} />
            )}
          </TabsContent>

          <TabsContent value="saved" className="mt-6">
            {/* <SavedPlans onLoadPlan={handleLoadPlan} theme={theme} /> */}
          </TabsContent>
        </Tabs>
      </main>
      <footer className={`mt-16 border-t ${theme === 'dark' ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        <div className="container mx-auto px-4 py-6 text-center">
          <p className={`text-sm ${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}`}>
            © 2025 AI Fitness Coach.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default App