"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Loader2, Mail, CheckCircle, AlertCircle } from "lucide-react";

export default function NewsletterUnsubscribePage() {
  const [email, setEmail] = useState("");
  const [reason, setReason] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [resubscribeToken, setResubscribeToken] = useState("");

  const handleUnsubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/unsubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, reason }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setResubscribeToken(data.data.resubscribeToken);
        toast({
          title: "Success",
          description: "You have been unsubscribed from our newsletter",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to unsubscribe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResubscribe = async () => {
    if (!email || !resubscribeToken) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/newsletter/resubscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, token: resubscribeToken }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(false);
        setResubscribeToken("");
        toast({
          title: "Success",
          description: "You have been resubscribed to our newsletter",
        });
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to resubscribe",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="text-xl text-green-600">
              Successfully Unsubscribed
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-center">
              You have been unsubscribed from our newsletter. We&apos;re sorry to see you go!
            </p>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <p className="text-sm text-blue-800 mb-3">
                <strong>Want to stay updated?</strong> You can resubscribe anytime using the button below.
              </p>
              <Button 
                onClick={handleResubscribe}
                disabled={isLoading}
                className="w-full"
                variant="outline"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 mr-2" />
                )}
                Resubscribe to Newsletter
              </Button>
            </div>

            <Button 
              onClick={() => {
                setIsSuccess(false);
                setEmail("");
                setReason("");
              }}
              variant="ghost"
              className="w-full"
            >
              Unsubscribe Another Email
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Mail className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-xl">Unsubscribe from Newsletter</CardTitle>
          <p className="text-gray-600 text-sm">
            We&apos;re sorry to see you go. Please let us know why you&apos;re unsubscribing.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUnsubscribe} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Unsubscribing (Optional)</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="too-many-emails">Too many emails</SelectItem>
                  <SelectItem value="not-relevant">Content not relevant</SelectItem>
                  <SelectItem value="spam">Marked as spam</SelectItem>
                  <SelectItem value="no-longer-interested">No longer interested</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reason === "other" && (
              <div className="space-y-2">
                <Label htmlFor="custom-reason">Please specify</Label>
                <Textarea
                  id="custom-reason"
                  placeholder="Tell us more about why you're unsubscribing..."
                  value={reason === "other" ? "" : reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </div>
            )}

            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full"
              variant="destructive"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <AlertCircle className="w-4 h-4 mr-2" />
              )}
              Unsubscribe
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Changed your mind? You can always{" "}
              <button
                onClick={() => window.history.back()}
                className="text-blue-600 hover:underline"
              >
                go back
              </button>
              {" "}or resubscribe later.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}