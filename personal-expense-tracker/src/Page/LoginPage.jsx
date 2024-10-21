import { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, Facebook, Github, Loader2, LockIcon, Mail, Twitter } from "lucide-react";
import { Button } from "../Component/button";
import { Input } from ../Component/input";
import { Label } from "../Component/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../Component/card";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsLoading(false)
  }

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 dark:from-gray-900 dark:to-gray-800">
      <div className="flex-1 hidden lg:block">
        <motion.div
          className="h-full bg-primary-500 dark:bg-primary-900"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-center h-full">
            <motion.svg
              className="w-2/3 h-2/3 text-white"
              viewBox="0 0 100 100"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 100, repeat: Infinity, ease: "linear" }}
            >
              <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="2" />
              <path
                d="M50 5 L50 95 M5 50 L95 50"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </motion.svg>
          </div>
        </motion.div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign in to ExpenseTracker</CardTitle>
            <CardDescription className="text-center">
              Enter your email and password to access your account
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="m@example.com"
                      type="email"
                      autoCapitalize="none"
                      autoComplete="email"
                      autoCorrect="off"
                      className="pl-10"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      className="pl-10"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">Toggle password visibility</span>
                    </Button>
                  </div>
                </div>
                <Button className="w-full" type="submit" disabled={isLoading}>
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Sign In
                </Button>
              </div>
            </form>
            <div className="mt-4">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Button variant="outline" className="w-full">
                  <Facebook className="mr-2 h-4 w-4" />
                  Facebook
                </Button>
                <Button variant="outline" className="w-full">
                  <Twitter className="mr-2 h-4 w-4" />
                  Twitter
                </Button>
                <Button variant="outline" className="w-full">
                  <Github className="mr-2 h-4 w-4" />
                  Github
                </Button>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2">
            <Button variant="link" className="w-full">Forgot password?</Button>
            <div className="text-center text-sm text-muted-foreground">
              Don&apos;t have an account?{" "}
              <Button variant="link" className="p-0">Sign up</Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
