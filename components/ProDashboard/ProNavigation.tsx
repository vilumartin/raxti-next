"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";

interface ProNavigationProps {
  onSignOut: () => void;
}

const ProNavigation = ({ onSignOut }: ProNavigationProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <Link href="/">
        <Logo variant="compact" />
      </Link>
      <nav className="flex items-center space-x-4">
        <Link href="/" className="text-primary hover:text-primary/80 transition-colors text-sm">
          Home
        </Link>
        <Link href="/how-it-works" className="text-primary hover:text-primary/80 transition-colors text-sm">
          How It Works
        </Link>
        <Link href="/profile" className="text-primary hover:text-primary/80 transition-colors text-sm flex items-center">
          <User className="h-4 w-4 mr-1" />
          Profile
        </Link>
        <ThemeToggle />
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </nav>
    </div>
  );
};

export default ProNavigation;
