"use client";

import React, { useState, useCallback, useEffect } from "react";
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
import { Loader2, CheckCircle2 } from "lucide-react";
import TabSwitcher from "./TabSwitcher";

// Dynamically import the QR scanner components to avoid SSR issues
const MobileQrScanner = dynamic(
  () => import("./MobileQrScanner").then((mod) => mod.default),
  {
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
  }
);

const FileQrScanner = dynamic(
  () => import("./FileQrScanner").then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="aspect-square bg-muted/50 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2 text-primary" />
          <p className="text-sm text-muted-foreground">
            Loading file scanner...
          </p>
        </div>
      </div>
    ),
  }
);

// Function to check if MediaDevices API is supported
function isCameraSupported() {
  return (
    typeof navigator !== "undefined" &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia
  );
}

export default function AttendanceMarker() {
  const [attendanceCode, setAttendanceCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("manual");
  const [isCameraAvailable, setIsCameraAvailable] = useState(true);

  const { toast } = useToast();

  // Check if camera is available
  useEffect(() => {
    setIsCameraAvailable(isCameraSupported());
  }, []);

  // Handle QR code scan
  const handleScan = useCallback(
    (result) => {
      setAttendanceCode(result);
      setActiveTab("manual"); // Switch to manual tab to show the code
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

  // Render success state
  const renderSuccess = () => (
    <div className="text-center space-y-4">
      <div className="flex justify-center">
        <CheckCircle2 className="h-16 w-16 text-green-500" />
      </div>
      <h3 className="text-lg font-medium">Attendance Marked!</h3>
      <p className="text-sm text-muted-foreground">{message}</p>
      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          reset();
        }}
        variant="outline"
        className="mt-4"
      >
        Mark Another Attendance
      </Button>
    </div>
  );

  // Render manual input tab
  const renderManualTab = () => (
    <div className="space-y-4">
      <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
        <h3 className="text-sm font-medium mb-2">
          How to get your attendance code
        </h3>
        <ol className="text-xs text-muted-foreground space-y-1 list-decimal pl-5">
          <li>Your instructor will display a QR code or provide a text code</li>
          <li>Ask your instructor for the text version of the QR code</li>
          <li>Enter the code exactly as shown (codes are case-sensitive)</li>
        </ol>
      </div>

      <div className="space-y-2">
        <label htmlFor="code" className="text-sm font-medium">
          Enter attendance code:
        </label>
        <Input
          id="code"
          type="text"
          placeholder="Enter attendance code"
          value={attendanceCode}
          onChange={(e) => setAttendanceCode(e.target.value)}
          className="font-mono"
        />
      </div>

      <Button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        disabled={isSubmitting || !attendanceCode.trim()}
        className="w-full"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Submit Attendance Code"
        )}
      </Button>
    </div>
  );

  // Render camera tab
  const renderCameraTab = () => (
    <div className="space-y-4">
      {isCameraAvailable ? (
        <MobileQrScanner
          onScan={handleScan}
          onClose={() => setActiveTab("manual")}
        />
      ) : (
        <FileQrScanner
          onScan={handleScan}
          onClose={() => setActiveTab("manual")}
        />
      )}
    </div>
  );

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Mark Attendance</CardTitle>
        <CardDescription>
          Scan or enter the attendance code provided by your instructor
        </CardDescription>
      </CardHeader>

      <CardContent>
        {success ? (
          renderSuccess()
        ) : (
          <div className="space-y-4">
            <TabSwitcher
              onSwitchToManual={() => {
                console.log("Switching to manual tab");
                setActiveTab("manual");
              }}
              onSwitchToCamera={() => {
                console.log("Switching to camera tab");
                setActiveTab("camera");
              }}
            />

            {activeTab === "manual" ? renderManualTab() : renderCameraTab()}
          </div>
        )}
      </CardContent>

      {message && !success && (
        <CardFooter>
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
