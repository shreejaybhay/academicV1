"use client";

import React, { useState, useCallback } from "react";
import dynamic from "next/dynamic";
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
import { Loader2, Camera, KeySquare, CheckCircle2 } from "lucide-react";

// Dynamically import the QR scanner component to avoid SSR issues
const QrScanner = dynamic(() => import("./QrScanner"), {
  ssr: false,
  loading: () => (
    <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
        <p className="text-sm text-muted-foreground">
          Loading camera component...
        </p>
      </div>
    </div>
  ),
});

// We don't need to check camera availability anymore
// function isCameraSupported() {
//   // Always return true to enable the camera button
//   // We'll handle actual camera availability in the camera component
//   return true;
// }

export default function SimpleAttendanceForm() {
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [showCamera, setShowCamera] = useState(false);
  // We don't need to check camera availability anymore
  // const [isCameraAvailable, setIsCameraAvailable] = useState(true);

  const { toast } = useToast();

  // We don't need to check camera availability anymore
  // useEffect(() => {
  //   setIsCameraAvailable(isCameraSupported());
  // }, []);

  // Handle QR code scan
  const handleScan = useCallback(
    (result) => {
      setAttendanceCode(result);
      setShowCamera(false); // Hide camera after scan
      toast({
        title: "Success",
        description: "QR code scanned successfully!",
      });
    },
    [toast]
  );

  // Handle manual code submission
  const handleSubmit = async () => {
    if (!attendanceCode.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid attendance code",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Call the API to mark attendance
      const response = await fetch("/api/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          qrCodeData: attendanceCode,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
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

  // Reset the form
  const reset = () => {
    setAttendanceCode("");
    setSuccess(false);
    setMessage("");
  };

  // If success, show success message
  if (success) {
    return (
      <Card className="w-full max-w-md mx-auto card-hover animate-fade-in shadow-sm">
        <CardHeader className="responsive-p border-b bg-muted/30">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-full bg-primary/10">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-primary"
              >
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div>
              <CardTitle className="text-xl whitespace-nowrap">
                Mark Attendance
              </CardTitle>
              <CardDescription className="text-sm max-w-[280px]">
                Scan or enter the attendance code provided by your instructor
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="responsive-p">
          <div className="text-center space-y-4 animate-fade-in">
            <div className="flex justify-center">
              <div className="p-4 rounded-full bg-green-100 dark:bg-green-900/30 animate-pulse-once">
                <CheckCircle2 className="h-16 w-16 text-green-500" />
              </div>
            </div>
            <h3 className="text-lg font-medium text-green-700 dark:text-green-300">
              Attendance Marked!
            </h3>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button
              type="button"
              onClick={reset}
              variant="outline"
              className="mt-4 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20 transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-2 text-green-500"
              >
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"></path>
                <path d="M3 3v5h5"></path>
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"></path>
                <path d="M16 21h5v-5"></path>
              </svg>
              Mark Another Attendance
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // If camera is shown, show camera component
  if (showCamera) {
    return (
      <Card className="w-full max-w-md mx-auto animate-fade-in shadow-sm overflow-hidden">
        <CardHeader className="border-b bg-muted/10 pb-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <rect x="7" y="7" width="3" height="3"></rect>
                  <rect x="14" y="7" width="3" height="3"></rect>
                  <rect x="7" y="14" width="3" height="3"></rect>
                  <rect x="14" y="14" width="3" height="3"></rect>
                </svg>
              </div>
              <div>
                <CardTitle className="text-xl whitespace-nowrap">
                  Scan QR Code
                </CardTitle>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowCamera(false)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <path d="M19 12H5"></path>
                <path d="M12 19l-7-7 7-7"></path>
              </svg>
              Back
            </Button>
          </div>
        </CardHeader>

        <div className="px-4 py-3 bg-secondary/30 border-b">
          <div className="flex items-center gap-2 text-sm">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
              <circle cx="12" cy="13" r="4"></circle>
            </svg>
            <span>Point your camera at the QR code</span>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            Use the camera controls below to switch cameras or turn on the
            flashlight if needed
          </div>
        </div>

        <CardContent className="p-0">
          <div className="animate-fade-in">
            <QrScanner onScanSuccess={handleScan} />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Show manual input form
  return (
    <Card className="w-full max-w-md mx-auto card-hover animate-fade-in shadow-sm">
      <CardHeader className="responsive-p border-b bg-muted/30">
        <div className="flex items-center space-x-2">
          <div className="p-2 rounded-full bg-primary/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-primary"
            >
              <path d="M9 11l3 3L22 4"></path>
              <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
            </svg>
          </div>
          <div>
            <CardTitle className="text-xl whitespace-nowrap">
              Mark Attendance
            </CardTitle>
            <CardDescription className="text-sm max-w-[280px]">
              Scan or enter the attendance code provided by your instructor
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="responsive-p">
        <div className="space-y-6 animate-slide-up">
          {/* Tab buttons */}
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary/20 bg-primary/5 hover:bg-primary/10 transition-colors"
              onClick={() => {
                console.log("Manual input selected");
                // Already on manual input, no need to do anything
              }}
            >
              <KeySquare className="mr-2 h-4 w-4 text-primary" />
              <span className="whitespace-nowrap">Manual Input</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              className="flex-1 border-primary/20 hover:bg-primary/5 transition-colors"
              onClick={() => {
                console.log("Camera selected");
                setShowCamera(true);
              }}
              // Always enable the camera button
              // disabled={!isCameraAvailable}
            >
              <Camera className="mr-2 h-4 w-4 text-primary" />
              <span className="whitespace-nowrap">Camera</span>
            </Button>
          </div>

          {/* Manual input form */}
          <div className="space-y-4">
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed hover:border-primary/50 transition-colors shadow-sm">
              <h3 className="text-sm font-medium mb-2 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 flex-shrink-0 text-primary"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <path d="M12 16v-4"></path>
                  <path d="M12 8h.01"></path>
                </svg>
                <span className="whitespace-nowrap">
                  How to get your attendance code
                </span>
              </h3>
              <ol className="text-xs text-muted-foreground space-y-2 list-decimal pl-5 marker:text-primary">
                <li>
                  Your instructor will display a QR code or provide a text code
                </li>
                <li className="bg-primary/5 p-2 rounded-md border border-primary/10">
                  <span className="font-medium text-primary">Recommended:</span>{" "}
                  Scan the QR code with your camera
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="text-xs p-0 h-auto text-primary font-medium"
                    onClick={() => setShowCamera(true)}
                  >
                    Open Camera
                  </Button>
                </li>
                <li>
                  Or ask your instructor for the text version of the QR code
                </li>
                <li>
                  Enter the code exactly as shown (codes are case-sensitive)
                </li>
              </ol>
            </div>

            <div className="space-y-2">
              <label
                htmlFor="code"
                className="text-sm font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="mr-1 flex-shrink-0 text-primary"
                >
                  <rect
                    x="3"
                    y="11"
                    width="18"
                    height="11"
                    rx="2"
                    ry="2"
                  ></rect>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                </svg>
                <span className="whitespace-nowrap">
                  Enter attendance code:
                </span>
              </label>
              <div className="relative">
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter attendance code"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  className="font-mono pr-10"
                />
                {attendanceCode && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
                    onClick={() => setAttendanceCode("")}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <circle cx="12" cy="12" r="10"></circle>
                      <line x1="15" y1="9" x2="9" y2="15"></line>
                      <line x1="9" y1="9" x2="15" y2="15"></line>
                    </svg>
                  </Button>
                )}
              </div>
            </div>

            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !attendanceCode.trim()}
              className="w-full bg-primary hover:bg-primary/90 transition-colors shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="mr-2 flex-shrink-0"
                  >
                    <polyline points="9 11 12 14 22 4"></polyline>
                    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
                  </svg>
                  <span className="whitespace-nowrap">
                    Submit Attendance Code
                  </span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>

      {message && !success && (
        <CardFooter className="responsive-p border-t bg-muted/30">
          <p
            className={`text-sm ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {message}
          </p>
        </CardFooter>
      )}
    </Card>
  );
}
