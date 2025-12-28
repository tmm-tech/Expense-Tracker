import { SignInButton } from "../components/ui/signin.tsx";
import { Button } from "../components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card.tsx";
import { useAuth } from "../hooks/use-auth.ts";
import {
  ArrowRight,
  TrendingUp,
  PieChart,
  Wallet,
  Brain,
  Download,
  Upload,
  BarChart3,
  Shield,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function Index() {
  const navigate = useNavigate();
  const { session } = useAuth();
  const features = [
    {
      icon: Wallet,
      title: "Transaction Tracking",
      description:
        "Monitor every penny with detailed transaction categorization and insights",
    },
    {
      icon: PieChart,
      title: "Budget Management",
      description:
        "Set smart budgets and track spending across categories effortlessly",
    },
    {
      icon: TrendingUp,
      title: "Investment Portfolio",
      description:
        "Track your investments and watch your wealth grow over time",
    },
    {
      icon: BarChart3,
      title: "Real-time Analytics",
      description:
        "Get instant insights into your net worth, liabilities, and spending patterns",
    },
    {
      icon: Brain,
      title: "AI-Powered Insights",
      description:
        "Receive intelligent financial recommendations powered by advanced AI",
    },
    {
      icon: Upload,
      title: "CSV Import/Export",
      description:
        "Easily migrate your data with seamless CSV file import and export",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-muted/20">
      {/* Header */}
      <header className="border-b border-border/40 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-3 sm:py-4 flex justify-between items-center max-w-7xl">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 sm:w-5 sm:h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg sm:text-xl">Aurex</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {session ? (
                <><Button onClick={() => navigate("/dashboard")} size="sm" className="text-xs sm:text-sm" variant="ghost">
                Dashboard
              </Button><SignInButton size="sm" className="text-xs sm:text-sm" /></>
            ) : (
              <SignInButton />
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <div className="text-center space-y-6 sm:space-y-8 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-medium mb-4">
            <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Secure & Private Financial Management</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight text-balance leading-tight px-2">
            Master Your Money with{" "}
            <span className="bg-gradient-to-r from-primary via-accent to-secondary bg-clip-text text-transparent">
              Intelligence
            </span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto text-balance px-2">
            Track expenses, manage budgets, monitor investments, and get
            AI-powered insights—all in one powerful platform
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4 px-2">
            {session ? (
              <Button
                size="lg"
                className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 gap-2 w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            ) : (
              <SignInButton>
                <Button
                  size="lg"
                  className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 gap-2 w-full sm:w-auto"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </SignInButton>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 lg:mt-20 max-w-4xl mx-auto px-2">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary">
              100%
            </div>
            <div className="text-sm sm:text-base text-muted-foreground mt-2">
              Free Forever
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-accent">
              AI-Powered
            </div>
            <div className="text-sm sm:text-base text-muted-foreground mt-2">
              Smart Insights
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-secondary">
              Secure
            </div>
            <div className="text-sm sm:text-base text-muted-foreground mt-2">
              Bank-Level Security
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <div className="text-center mb-12 sm:mb-16 px-2">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4">
            Everything You Need to Succeed
          </h2>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
            Comprehensive financial tools designed to help you take control of
            your money
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="border-border/50 hover:border-primary/50 transition-colors"
            >
              <CardHeader>
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-3 sm:mb-4">
                  <feature.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                </div>
                <CardTitle className="text-lg sm:text-xl">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-sm sm:text-base">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-3 sm:px-4 lg:px-6 py-12 sm:py-16 lg:py-20 max-w-7xl">
        <Card className="bg-gradient-to-r from-primary/10 via-accent/10 to-secondary/10 border-primary/20">
          <CardHeader className="text-center space-y-3 sm:space-y-4 pb-6 sm:pb-8 px-3 sm:px-6">
            <CardTitle className="text-2xl sm:text-3xl md:text-4xl font-bold">
              Ready to Transform Your Financial Future?
            </CardTitle>
            <CardDescription className="text-base sm:text-lg max-w-2xl mx-auto">
              Join thousands of users who've taken control of their finances
              with Aurex
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center pb-6 sm:pb-8 px-3 sm:px-6">
            {session ? (
              <Button
                size="lg"
                className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 gap-2 w-full sm:w-auto"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
                <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            ) : (
              <SignInButton>
                <Button
                  size="lg"
                  className="text-sm sm:text-base lg:text-lg px-6 sm:px-8 gap-2 w-full sm:w-auto"
                >
                  Start Your Journey
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </Button>
              </SignInButton>
            )}
          </CardContent>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-6 sm:py-8">
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs sm:text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Aurex. All rights reserved.</p>
            <div className="flex items-center gap-4 sm:gap-6">
              <button
                onClick={() => navigate("/privacy")}
                className="hover:text-foreground transition-colors"
              >
                Privacy Policy
              </button>
              <button
                onClick={() => navigate("/terms")}
                className="hover:text-foreground transition-colors"
              >
                Terms & Conditions
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
