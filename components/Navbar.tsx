"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogOut, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";

interface NavbarProps {
  /** Override the "active" link highlight (defaults to current path detection) */
  activePage?: "home" | "how-it-works" | "faq" | "pro" | "pro-dashboard" | "profile";
}

export function Navbar({ activePage }: NavbarProps) {
  const router = useRouter();
  const { user, isLoading: authLoading, signOut } = useAuth();
  const { isSubscribed, isLoading: subLoading } = useSubscription();

  const loading = authLoading || subLoading;

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  const linkCls = (page: NavbarProps["activePage"]) =>
    `text-sm transition-colors ${
      activePage === page
        ? "text-foreground font-semibold"
        : "text-muted-foreground hover:text-foreground"
    }`;

  return (
    <div className="border-b border-border bg-background/95 backdrop-blur sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
        {/* Logo */}
        <Link href={user && isSubscribed ? "/pro-dashboard" : "/"}>
          <Logo variant="compact" />
        </Link>

        {/* Links */}
        <nav className="flex items-center gap-3 sm:gap-5">
          <Link href="/how-it-works" className={linkCls("how-it-works")}>
            How it works
          </Link>

          <Link href="/faq" className={linkCls("faq")}>
            FAQ
          </Link>

          {/* If subscribed: show Pro Dashboard. Otherwise: show Pricing. */}
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
          ) : user && isSubscribed ? (
            <Link href="/pro-dashboard" className={`${linkCls("pro-dashboard")} text-primary font-semibold`}>
              Pro Dashboard
            </Link>
          ) : (
            <Link href="/pro" className={`${linkCls("pro")} font-medium`}>
              Pricing
            </Link>
          )}

          {/* Auth section */}
          {loading ? null : user ? (
            <>
              <Link href="/profile" className={linkCls("profile")}>
                <span className="hidden sm:inline">Profile</span>
                <User className="h-4 w-4 sm:hidden" />
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSignOut}
                className="text-muted-foreground hover:text-foreground gap-1.5 px-2"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Sign out</span>
              </Button>
            </>
          ) : (
            <Link href="/auth">
              <Button variant="outline" size="sm">
                Sign in
              </Button>
            </Link>
          )}

          <ThemeToggle />
        </nav>
      </div>
    </div>
  );
}

export default Navbar;
