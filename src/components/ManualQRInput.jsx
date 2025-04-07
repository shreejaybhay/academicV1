"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function ManualQRInput() {
  const [qrValue, setQrValue] = useState("");
  const [scanResult, setScanResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = () => {
    if (!qrValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid QR code value",
        variant: "destructive",
      });
      return;
    }

    setScanResult(qrValue.trim());
    setQrValue("");
  };

  const markAttendance = async () => {
    if (!scanResult) return;

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData: scanResult,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage(data.message || "Attendance marked successfully!");
        toast({
          title: "Success",
          description: "Attendance marked successfully!",
        });
      } else {
        setMessage(data.message || "Failed to mark attendance");
        toast({
          title: "Error",
          description: data.message || "Failed to mark attendance",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setMessage("An error occurred while marking attendance");
      toast({
        title: "Error",
        description: "An error occurred while marking attendance",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setScanResult(null);
    setMessage("");
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-base sm:text-lg">Attendance Code</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Enter the code provided by your instructor to mark your attendance
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        {scanResult ? (
          <div className="text-center p-4">
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg border border-green-200 dark:border-green-800 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-green-600 dark:text-green-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">
                  Attendance code accepted!
                </p>
              </div>
              <p className="text-xs text-green-700 dark:text-green-300 ml-7">
                Click the button below to mark your attendance
              </p>
            </div>
            {message && (
              <p
                className={`text-sm ${
                  message.includes("successfully")
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {message}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg border border-dashed">
              <div className="flex items-center gap-2 mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <p className="text-sm font-medium">
                  How to get your attendance code
                </p>
              </div>
              <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-5">
                <li>
                  Your instructor will display a QR code or provide a text code
                </li>
                <li>
                  If it's a QR code, the instructor can also provide the text
                  version
                </li>
                <li>
                  Enter the code exactly as shown (codes are case-sensitive)
                </li>
              </ol>
            </div>
            <div className="text-center mb-2">
              <p className="text-sm font-medium">Enter the attendance code:</p>
            </div>
            <Input
              type="text"
              placeholder="Enter attendance code"
              value={qrValue}
              onChange={(e) => setQrValue(e.target.value)}
              className="text-center font-mono text-sm"
            />
          </div>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-4 px-0 pt-4 pb-0">
        <div className="flex justify-center gap-2 flex-wrap">
          {scanResult ? (
            <>
              <Button
                onClick={markAttendance}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Marking Attendance...
                  </>
                ) : (
                  "Mark Attendance"
                )}
              </Button>
              <Button variant="outline" onClick={reset} className="w-full mt-2">
                Enter Another Code
              </Button>
            </>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!qrValue.trim()}
              className="w-full"
              size="lg"
            >
              Submit Attendance Code
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
