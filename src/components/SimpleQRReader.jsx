"use client";

import { useState, useRef } from "react";
import { QrReader } from "react-qr-reader";
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
import {
  Loader2,
  Camera,
  KeyRound,
  AlertCircle,
  RefreshCw,
} from "lucide-react";

export default function SimpleQRReader() {
  const [scanResult, setScanResult] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [manualQrValue, setManualQrValue] = useState("");
  const [useManualInput, setUseManualInput] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const { toast } = useToast();

  // Handle QR code scan
  const handleScan = (result) => {
    if (result) {
      console.log("QR Code detected:", result?.text);
      setScanResult(result.text);

      toast({
        title: "Success",
        description: "Attendance code scanned successfully!",
      });
    }
  };

  // Handle scan errors
  const handleError = (error) => {
    console.error("QR Scanner error:", error);
    setCameraError(true);

    toast({
      title: "Camera Error",
      description:
        "Could not access camera. Please try again or use manual input.",
      variant: "destructive",
    });
  };

  // Handle manual input submission
  const handleManualSubmit = () => {
    if (!manualQrValue.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid attendance code",
        variant: "destructive",
      });
      return;
    }

    setScanResult(manualQrValue.trim());
    setManualQrValue("");

    toast({
      title: "Success",
      description: "Attendance code accepted",
    });
  };

  // Mark attendance with the scanned/entered code
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

  // Reset the scanner
  const reset = () => {
    setScanResult(null);
    setMessage("");
    setCameraError(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto border-0 shadow-none">
      <CardHeader className="px-0 pt-0 pb-4">
        <CardTitle className="text-base sm:text-lg">Attendance Code</CardTitle>
        <CardDescription className="text-xs sm:text-sm">
          Scan or enter the code provided by your instructor
        </CardDescription>
      </CardHeader>

      <CardContent className="p-0 space-y-4">
        <div className="flex justify-center mb-4">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            <Button
              variant={!useManualInput ? "default" : "outline"}
              onClick={() => {
                setUseManualInput(false);
                setCameraError(false);
              }}
              className="rounded-l-md rounded-r-none"
            >
              <Camera className="mr-2 h-4 w-4" />
              Camera
            </Button>
            <Button
              variant={useManualInput ? "default" : "outline"}
              onClick={() => setUseManualInput(true)}
              className="rounded-r-md rounded-l-none"
            >
              <KeyRound className="mr-2 h-4 w-4" />
              Manual Input
            </Button>
          </div>
        </div>

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
        ) : useManualInput ? (
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
              value={manualQrValue}
              onChange={(e) => setManualQrValue(e.target.value)}
              className="text-center font-mono text-sm"
            />
          </div>
        ) : (
          <div className="space-y-4">
            {cameraError ? (
              <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive mb-4">
                <AlertCircle className="h-5 w-5" />
                <p className="text-sm">
                  Camera access error. Please try again or use manual input
                  instead.
                </p>
              </div>
            ) : null}

            <div
              className="rounded-lg overflow-hidden"
              style={{ height: "300px" }}
            >
              {!cameraError && (
                <>
                  {(() => {
                    try {
                      return (
                        <QrReader
                          constraints={{
                            facingMode: "environment",
                            aspectRatio: 1,
                            width: { min: 640, ideal: 1280, max: 1920 },
                            height: { min: 480, ideal: 720, max: 1080 },
                          }}
                          onResult={handleScan}
                          onError={handleError}
                          scanDelay={500}
                          videoStyle={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                          }}
                          videoContainerStyle={{
                            width: "100%",
                            height: "100%",
                            padding: 0,
                          }}
                          ViewFinder={() => (
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                              <div className="w-48 h-48 border-2 border-white rounded-lg opacity-70"></div>
                            </div>
                          )}
                        />
                      );
                    } catch (error) {
                      console.error("Error rendering QR scanner:", error);
                      // Set camera error and return fallback UI
                      setTimeout(() => setCameraError(true), 0);
                      return (
                        <div className="flex items-center justify-center h-full bg-muted/30">
                          <div className="text-center p-4">
                            <AlertCircle className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                            <p className="text-sm font-medium">
                              Camera initialization error
                            </p>
                            <p className="text-xs text-muted-foreground mt-1">
                              Please try again or use manual input
                            </p>
                          </div>
                        </div>
                      );
                    }
                  })()}
                </>
              )}
            </div>

            <div className="text-xs text-center text-muted-foreground space-y-1 mt-2">
              <p>Point your camera at the QR code.</p>
              <p>
                If you're having trouble, try in a well-lit area and hold your
                device steady.
              </p>
              <p>
                Or use the{" "}
                <button
                  onClick={() => setUseManualInput(true)}
                  className="underline text-primary font-medium"
                >
                  manual input option
                </button>{" "}
                instead.
              </p>
            </div>
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
          ) : useManualInput ? (
            <Button
              onClick={handleManualSubmit}
              disabled={!manualQrValue.trim()}
              className="w-full"
              size="lg"
            >
              Submit Attendance Code
            </Button>
          ) : cameraError ? (
            <div className="flex gap-2 w-full">
              <Button onClick={() => setCameraError(false)} className="w-1/2">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
              </Button>
              <Button
                variant="outline"
                onClick={() => setUseManualInput(true)}
                className="w-1/2"
              >
                <KeyRound className="mr-2 h-4 w-4" />
                Manual Input
              </Button>
            </div>
          ) : null}
        </div>
      </CardFooter>
    </Card>
  );
}
