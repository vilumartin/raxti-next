"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";

interface ProNavigationProps {
  onSignOut: () => void;
}

const ProNavigation = ({ onSignOut }: ProNavigationProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <img
          src="/images/logo.png"
          alt="raxti.app logo"
          className="h-24"
        />
      </div>
      <nav className="flex items-center space-x-6">
        <Link href="/" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
          Home
        </Link>
        <Link href="/how-it-works" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
          How It Works
        </Link>
        <Link href="/profile" className="text-steno-blue hover:text-steno-darkBlue transition-colors">
          <User className="h-4 w-4 mr-2 inline" />
          Profile
        </Link>
        <Button variant="ghost" size="sm" onClick={onSignOut}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
      </nav>
    </div>
  );
};

export default ProNavigation;
