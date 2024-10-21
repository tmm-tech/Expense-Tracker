import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../Component/card";
import { Progress } from "../Component/progress";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "../Component/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Button } from "../Component/button";
import { ArrowUpRight, ArrowDownRight, DollarSign, Wallet, Target, PiggyBank, CreditCard, Building, Home, BarChart2, FileText, Settings, Menu, TrendingUp, TrendingDown } from "lucide-react";
import Sidebar from '../Component/Sidebar';
import HeaderNav from '../Component/HeaderNav';
// Mock data for demonstration
const accountData = [
  { name: "Checking", balance: 2500, icon: Wallet, type: "asset" },
  { name: "Savings", balance: 10000, icon: PiggyBank, type: "asset" },
  { name: "Credit Card", balance: -500, icon: CreditCard, type: "liability" },
  { name: "Investment", balance: 5000, icon: Building, type: "asset" },
  { name: "Mortgage", balance: -200000, icon: Home, type: "liability" },
]

const budgetData = [
  { category: "Groceries", spent: 300, budget: 400 },
  { category: "Entertainment", spent: 150, budget: 200 },
  { category: "Bills", spent: 800, budget: 1000 },
  { category: "Transportation", spent: 100, budget: 150 },
]

const goalData = [
  { name: "Vacation", current: 2000, target: 5000 },
  { name: "New Laptop", current: 800, target: 1500 },
]

const expenseDistribution = [
  { name: "Housing", value: 1200 },
  { name: "Food", value: 500 },
  { name: "Transportation", value: 300 },
  { name: "Utilities", value: 200 },
  { name: "Entertainment", value: 150 },
  { name: "Other", value: 250 },
]

const incomeTrend = [
  { month: "Jan", income: 4000 },
  { month: "Feb", income: 4200 },
  { month: "Mar", income: 4100 },
  { month: "Apr", income: 4400 },
  { month: "May", income: 4300 },
  { month: "Jun", income: 4550 },
]

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82ca9d']

export default function Dashboard() {
 const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const totalAssets = accountData.filter(account => account.type === "asset").reduce((sum, account) => sum + account.balance, 0)
  const totalLiabilities = accountData.filter(account => account.type === "liability").reduce((sum, account) => sum + Math.abs(account.balance), 0)
  const netWorth = totalAssets - totalLiabilities

  return (
    <div className="flex h-screen bg-gray-100 bg-[url('https://unsplash.com/photos/a-blurry-photo-of-a-white-background-GJKx5lhwU3M')] bg-cover bg-center bg-fixed">
        <Sidebar isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <HeaderNav/>

        {/* Dashboard content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-transparent">
          <div className="container mx-auto p-4">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {accountData.map((account) => (
                <Card key={account.name} className="bg-white bg-opacity-90">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium text-gray-700">{account.name}</CardTitle>
                    <account.icon className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className={`text-2xl font-bold ${account.type === 'asset' ? 'text-green-600' : 'text-red-600'}`}>
                      ${Math.abs(account.balance).toLocaleString()}
                    </div>
                    <p className="text-xs text-gray-500">
                      {account.type === 'asset' ? 'Asset' : 'Liability'}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-3">
              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Total Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600 flex items-center">
                    <TrendingUp className="h-6 w-6 mr-2 text-gray-600" />
                    ${totalAssets.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Total Liabilities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600 flex items-center">
                    <TrendingDown className="h-6 w-6 mr-2 text-gray-600" />
                    ${totalLiabilities.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Net Worth</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-3xl font-bold flex items-center ${netWorth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    <DollarSign className="h-6 w-6 mr-2 text-gray-600" />
                    {netWorth.toLocaleString()}
                    {netWorth > 0 ? (
                      <ArrowUpRight className="h-4 w-4 text-green-500 ml-2" />
                    ) : (
                      <ArrowDownRight className="h-4 w-4 text-red-500 ml-2" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Monthly Budget Progress</CardTitle>
                  <CardDescription className="text-gray-500">Track your spending across categories</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      spent: {
                        label: "Spent",
                        color: "hsl(var(--chart-1))",
                      },
                      budget: {
                        label: "Budget",
                        color: "hsl(var(--chart-2))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={budgetData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="category" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar dataKey="spent" fill="var(--color-spent)" name="Spent" />
                        <Bar dataKey="budget" fill="var(--color-budget)" name="Budget" />
                      </BarChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Financial Goals</CardTitle>
                  <CardDescription className="text-gray-500">Track your progress towards your goals</CardDescription>
                </CardHeader>
                <CardContent className="space-y-8">
                  {goalData.map((goal) => (
                    <div key={goal.name} className="space-y-2">
                      <div className="flex items-center">
                        <Target className="h-4 w-4 mr-2 text-gray-500" />
                        <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                        <span className="ml-auto text-sm text-gray-500">
                          ${goal.current} / ${goal.target}
                        </span>
                      </div>
                      <Progress value={(goal.current / goal.target) * 100} className="h-2 bg-gray-200">
                        <div className="h-full bg-gray-600 rounded-full" style={{ width: `${(goal.current / goal.target) * 100}%` }} />
                      </Progress>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="mt-6 grid gap-6 md:grid-cols-2">
              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Expense Distribution</CardTitle>
                  <CardDescription className="text-gray-500">Breakdown of your monthly expenses</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      expenses: {
                        label: "Expenses",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={expenseDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {expenseDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                  <div className="mt-4 flex flex-wrap justify-center">
                    {expenseDistribution.map((entry, index) => (
                      <div key={`legend-${index}`} className="flex items-center mr-4 mb-2">
                        <div className="w-3 h-3 mr-1" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        <span className="text-sm text-gray-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white bg-opacity-90">
                <CardHeader>
                  <CardTitle className="text-gray-700">Income Trend</CardTitle>
                  <CardDescription className="text-gray-500">Your income over the last 6 months</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer
                    config={{
                      income: {
                        label: "Income",
                        color: "hsl(var(--chart-1))",
                      },
                    }}
                    className="h-[300px]"
                  >
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={incomeTrend}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="income" stroke="var(--color-income)" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </div>
          
          </div>
        </main>
      </div>
    </div>
  )
}
