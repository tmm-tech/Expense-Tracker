import { SignInButton } from "@/components/ui/signin";
import { Button } from "@/components/ui/button.jsx";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card.jsx";
import { Authenticated, Unauthenticated } from "convex/react";
import { ArrowRight, TrendingUp, PieChart, Wallet, Brain, Download, Upload, BarChart3, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
 
export default function App() {
  const navigate = useNavigate();
 
  const features = [
    {
      icon: Wallet,
      title: "Transaction Tracking",
      description: "Monitor every penny with detailed transaction categorization and insights"
    },
    {
      icon: PieChart,
      title: "Budget Management",
      description: "Set smart budgets and track spending across categories effortlessly"
    },
    {
      icon: TrendingUp,
      title: "Investment Portfolio",
      description: "Track your investments and watch your wealth grow over time"
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description: "Get instant insights into your net worth, liabilities, and spending patterns"
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description: "Receive intelligent financial recommendations powered by advanced AI"
    },
    {
      icon: Upload,
      title: "CSV Import/Export",
      description: "Easily migrate your data with seamless CSV file import and export"
    }
  ];
    return (
        <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-xl">Aurex</span>
          </div>
          <div className="flex items-center gap-4">
            <Authenticated>
              <Button onClick={() => navigate("/dashboard")}>Go to Dashboard</Button>
            </Authenticated>
            <Unauthenticated>
              <SignInButton />
            </Unauthenticated>
          </div>
        </div>
      </header>
 
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="text-center space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Shield className="w-4 h-4" />
            <span>Secure & Private Financial Management</span>
          </div>
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-balance leading-tight">
            Master Your Money with{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance">
            Track expenses, manage budgets, monitor investments, and get AI-powered insights—all in one powerful platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Unauthenticated>
              <SignInButton>
                <Button size="lg" className="text-lg px-8 gap-2">
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </SignInButton>
            </Unauthenticated>
            <Authenticated>
              <Button size="lg" className="text-lg px-8 gap-2" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Authenticated>
          </div>
        </div>
 
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary">100%</div>
            <div className="text-muted-foreground mt-2">Free Forever</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-accent">AI-Powered</div>
            <div className="text-muted-foreground mt-2">Smart Insights</div>
          </div>
          <div className="text-center">
            <div className="text-4xl font-bold text-secondary">Secure</div>
            <div className="text-muted-foreground mt-2">Bank-Level Security</div>
          </div>
        </div>
      </section>
 
      {/* Features Section */}
      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Succeed</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive financial tools designed to help you take control of your money
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
 
      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 max-w-7xl">
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center space-y-4 pb-8">
            <CardTitle className="text-3xl md:text-4xl font-bold">
              Ready to Transform Your Financial Future?
            </CardTitle>
            <CardDescription className="text-lg max-w-2xl mx-auto">
              Join thousands of users who've taken control of their finances with Aurex
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-8">
            <Unauthenticated>
              <SignInButton>
                <Button size="lg" className="text-lg px-8 gap-2">
                  Start Your Journey
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </SignInButton>
            </Unauthenticated>
            <Authenticated>
              <Button size="lg" className="text-lg px-8 gap-2" onClick={() => navigate("/dashboard")}>
                Go to Dashboard
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Authenticated>
          </CardContent>
        </Card>
      </section>
 
      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground max-w-7xl">
          <p>&copy; {new Date().getFullYear()} Aurex. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}