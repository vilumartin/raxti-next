"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Logo } from "@/components/Logo";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSignUp = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: `${window.location.origin}/auth/confirm`,
        },
      });

      if (error) {
        // Handle specific error cases
        if (
          error.message.includes("User already registered") ||
          error.message.includes("already registered") ||
          error.message.includes("already exists")
        ) {
          toast.error(
            "An account with this email already exists. Please try signing in instead."
          );
        } else if (error.message.includes("Password should be at least")) {
          toast.error("Password should be at least 6 characters long.");
        } else if (error.message.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else {
          toast.error(error.message);
        }
      } else if (data.user) {
        // Check if this is an existing user (they already have email_confirmed_at)
        if (data.user.email_confirmed_at) {
          toast.error(
            "An account with this email already exists. Please try signing in instead."
          );
        } else {
          // This is a new user who needs to confirm their email
          toast.success(
            "Signup successful! Check your email to verify your account."
          );
          // Clear form
          setEmail("");
          setPassword("");
          setFullName("");
        }
      } else {
        toast.error("An unexpected error occurred during signup.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });
      if (error) {
        // Handle specific login errors
        if (error.message.includes("Invalid login credentials")) {
          toast.error(
            "Invalid email or password. Please check your credentials."
          );
        } else if (error.message.includes("Email not confirmed")) {
          toast.error(
            "Please check your email and click the confirmation link before signing in."
          );
        } else {
          toast.error(error.message);
        }
      } else {
        toast.success("Signed in!");
        router.push("/");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
      <Link href="/" className="mb-6">
        <Logo variant="full" />
      </Link>

      <Card className="w-full max-w-md border-0 shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Authentication</CardTitle>
          <CardDescription className="text-muted-foreground text-center">
            Sign in or create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="m@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSignIn}
                disabled={loading}
                className="w-full bg-steno-blue hover:bg-steno-darkBlue"
              >
                {loading ? "Loading" : "Sign In"}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  placeholder="m@example.com"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <Button
                onClick={handleSignUp}
                disabled={loading}
                className="w-full bg-steno-blue hover:bg-steno-darkBlue"
              >
                {loading ? "Creating Account" : "Sign Up"}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
