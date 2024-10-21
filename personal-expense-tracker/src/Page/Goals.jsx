import { useState } from "react";
import { format, addMonths } from "date-fns";
import { AlertCircle, ChevronDown, Edit, PlusCircle, Trash2} from "lucide-react";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Target, PiggyBank, CreditCard, Building, Home, BarChart2, FileText, Settings, Menu, TrendingUp, TrendingDown } from "lucide-react";
import { Button } from "../Component/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Component/card";
import { Input } from "../Component/input";
import { Label } from "../Component/label";
import { Progress } from "../Component/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../Component/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "../Component/dialog";
import { Alert, AlertDescription, AlertTitle } from "../Component/alert";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../Component/chart";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { ScrollArea } from "../Component/scroll-area";
import Sidebar from '../Component/Sidebar';
import HeaderNav from '../Component/HeaderNav';
// Mock data for goals
const initialGoals = [
  { id: 1, name: "Emergency Fund", target: 10000, current: 5000, deadline: "2024-12-31" },
  { id: 2, name: "Down Payment", target: 50000, current: 20000, deadline: "2025-06-30" },
  { id: 3, name: "Vacation", target: 5000, current: 2000, deadline: "2024-08-15" },
  { id: 4, name: "New Car", target: 30000, current: 10000, deadline: "2025-03-31" },
]

// Mock data for goal progress over time
const goalProgressData = [
  { month: "Jan", "Emergency Fund": 1000, "Down Payment": 5000, "Vacation": 500, "New Car": 2000 },
  { month: "Feb", "Emergency Fund": 2000, "Down Payment": 8000, "Vacation": 1000, "New Car": 4000 },
  { month: "Mar", "Emergency Fund": 3000, "Down Payment": 12000, "Vacation": 1500, "New Car": 6000 },
  { month: "Apr", "Emergency Fund": 4000, "Down Payment": 16000, "Vacation": 1800, "New Car": 8000 },
  { month: "May", "Emergency Fund": 5000, "Down Payment": 20000, "Vacation": 2000, "New Car": 10000 },
]

export default function Goals() {
  const [goals, setGoals] = useState(initialGoals)
  const [isAddingGoal, setIsAddingGoal] = useState(false)
  const [editingGoal, setEditingGoal] = useState("")

  const totalTargetAmount = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalCurrentAmount = goals.reduce((sum, goal) => sum + goal.current, 0)

  const handleAddGoal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const newGoal = {
      id: goals.length + 1,
      name: formData.get('name'),
      target: Number(formData.get('target')),
      current: Number(formData.get('current')),
      deadline: formData.get('deadline'),
    }
    setGoals([...goals, newGoal])
    setIsAddingGoal(false)
  }

  const handleEditGoal = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    const updatedGoal = {
      ...editingGoal,
      name: formData.get('name'),
      target: Number(formData.get('target')),
      current: Number(formData.get('current')),
      deadline: formData.get('deadline'),
    }
    setGoals(goals.map(goal => goal.id === updatedGoal.id ? updatedGoal : goal))
    setEditingGoal(null)
  }

  const handleDeleteGoal = (id: number) => {
    setGoals(goals.filter(goal => goal.id !== id))
  }

  return (
      <div className="flex h-screen bg-gray-100 bg-[url('https://unsplash.com/photos/a-blurry-photo-of-a-white-background-GJKx5lhwU3M')] bg-cover bg-center bg-fixed">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderNav/>
  <ScrollArea className="h-[calc(100vh-5rem)] md:h-[calc(100vh-7rem)]">
    <div className="container mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold">Financial Goals</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Goal Amount</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalTargetAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Progress</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalCurrentAmount.toFixed(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${(totalTargetAmount - totalCurrentAmount).toFixed(2)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Overall Progress */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Goal Progress</CardTitle>
          <CardDescription>You've achieved {((totalCurrentAmount / totalTargetAmount) * 100).toFixed(2)}% of your total goals</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={(totalCurrentAmount / totalTargetAmount) * 100} className="w-full" />
        </CardContent>
      </Card>

      {/* Financial Goals */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-semibold">Your Goals</h2>
          <Dialog open={isAddingGoal} onOpenChange={setIsAddingGoal}>
            <DialogTrigger asChild>
              <Button variant="black">
                <PlusCircle className="mr-2 h-4 w-4" />
                Add New Goal
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Goal</DialogTitle>
                <DialogDescription>Set a new financial goal here. Click save when you're done.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddGoal}>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">
                      Goal Name
                    </Label>
                    <Input id="name" name="name" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="target" className="text-right">
                      Target Amount
                    </Label>
                    <Input id="target" name="target" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="current" className="text-right">
                      Current Amount
                    </Label>
                    <Input id="current" name="current" type="number" className="col-span-3" required />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="deadline" className="text-right">
                      Deadline
                    </Label>
                    <Input id="deadline" name="deadline" type="date" className="col-span-3" required />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit">Save Goal</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
        {goals.map((goal) => (
          <Card key={goal.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{goal.name}</CardTitle>
              <div>
                <Button variant="ghost" size="icon" onClick={() => setEditingGoal(goal)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleDeleteGoal(goal.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between mb-2">
                <span>${goal.current.toFixed(2)} saved</span>
                <span>${goal.target.toFixed(2)} goal</span>
              </div>
              <Progress value={(goal.current / goal.target) * 100} className="w-full" />
              <div className="mt-2 text-sm text-gray-500">
                Deadline: {format(new Date(goal.deadline), "MMMM d, yyyy")}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Goal Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Progress Over Time</CardTitle>
          <CardDescription>Track your progress towards each goal</CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              goal: {
                label: "Goal Progress",
                color: "hsl(var(--chart-1))",
              },
            }}
            className="h-[300px]"
          >
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={goalProgressData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                {goals.map((goal, index) => (
                  <Line
                    key={goal.id}
                    type="monotone"
                    dataKey={goal.name}
                    stroke={`hsl(${index * 60}, 70%, 50%)`}
                    strokeWidth={2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Goal Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Goal Recommendations</CardTitle>
          <CardDescription>Personalized suggestions based on your spending habits</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>New Recommendation</AlertTitle>
            <AlertDescription>
              Based on your recent savings rate, you could increase your "Emergency Fund" goal by 10% and still meet your deadline.
            </AlertDescription>
          </Alert>
          <div className="mt-4">
            <Select>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select goal" />
              </SelectTrigger>
              <SelectContent>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id.toString()}>{goal.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button className="ml-2">
              <TrendingUp className="mr-2 h-4 w-4" />
              Optimize Goal
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Edit Goal Modal */}
      <Dialog open={!!editingGoal} onOpenChange={() => setEditingGoal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Goal</DialogTitle>
            <DialogDescription>Make changes to your financial goal here. Click save when you're done.</DialogDescription>
          </DialogHeader>
          {editingGoal && (
            <form onSubmit={handleEditGoal}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-name" className="text-right">
                    Goal Name
                  </Label>
                  <Input
                    id="edit-name"
                    name="name"
                    defaultValue={editingGoal.name}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-target" className="text-right">
                    Target Amount
                  </Label>
                  <Input
                    id="edit-target"
                    name="target"
                    type="number"
                    defaultValue={editingGoal.target}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-current" className="text-right">
                    Current Amount
                  </Label>
                  <Input
                    id="edit-current"
                    name="current"
                    type="number"
                    defaultValue={editingGoal.current}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="edit-deadline" className="text-right">
                    Deadline
                  </Label>
                  <Input
                    id="edit-deadline"
                    name="deadline"
                    type="date"
                    
                    defaultValue={editingGoal.deadline}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit">Save changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </ScrollArea>
        </div>
        </div>
    
  )
}
