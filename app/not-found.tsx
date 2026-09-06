"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">
          Oops! We couldn&apos;t find the page you&apos;re looking for.
        </p>
        <Button
          className="bg-steno-blue hover:bg-steno-darkBlue"
          asChild
        >
          <Link href="/">Return to Home</Link>
        </Button>
      </div>
    </div>
  );
}
