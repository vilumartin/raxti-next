"use client";


import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/sonner";
import { MailIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface EmailCollectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const EmailCollectionModal = ({ open, onOpenChange }: EmailCollectionModalProps) => {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast.error("Please enter a valid email address");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save the email to Supabase
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { email, source: 'pro_page' }
        ]);
      
      if (error) {
        // Handle duplicate email error gracefully
        if (error.code === '23505') { // PostgreSQL unique constraint violation code
          toast.success("You're already on our list! We'll notify you when Raxti Pro is available.");
        } else {
          console.error("Error inserting email:", error);
          toast.error("Something went wrong. Please try again.");
        }
      } else {
        toast.success("Thank you! We'll notify you when Raxti Pro is available.");
      }
      
      setEmail("");
      onOpenChange(false);
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
      console.error("Error submitting email:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-center flex items-center justify-center gap-2">
            <span className="text-steno-blue">Raxti Pro</span> Coming Soon!
          </DialogTitle>
          <DialogDescription className="text-center pt-2">
            Leave your email to be the first to know and get an early bird pricing forever!
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
              />
            </div>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <MailIcon className="mr-2 h-4 w-4" />
                  Notify me
                </>
              )}
            </Button>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogDescription className="text-xs text-muted-foreground">
              We'll never share your email with anyone else.
            </DialogDescription>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default EmailCollectionModal;
