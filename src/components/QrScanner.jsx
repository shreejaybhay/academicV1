"use client";

import { useEffect, useState } from "react";
import { Html5QrcodeScanner } from "html5-qrcode";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function QrScanner({ onScanSuccess }) {
  const [error, setError] = useState(null);
  const [isSecureContext, setIsSecureContext] = useState(true);

  // Check if we're in a secure context
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if we're in a secure context or on localhost
      const isLocalhost =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1" ||
        window.location.hostname.includes("192.168.");

      const secure = window.isSecureContext || isLocalhost;
      setIsSecureContext(secure);

      if (!secure) {
        setError(
          "Camera access is only supported in secure contexts like HTTPS or localhost"
        );
      }
    }
  }, []);

  useEffect(() => {
    // Only initialize scanner if we're in a secure context
    if (!isSecureContext) return;

    // Create scanner instance
    const scanner = new Html5QrcodeScanner("reader", {
      fps: 10,
      qrbox: 250,
      rememberLastUsedCamera: true,
      showTorchButtonIfSupported: true,
      aspectRatio: 1.0,
    });

    // Render the scanner
    scanner.render(
      (decodedText, decodedResult) => {
        console.log("QR code detected:", decodedText);
        onScanSuccess(decodedText); // Pass the result back to parent
        scanner.clear(); // Stop scanning after success
      },
      (errorMessage) => {
        // Handle scan errors or ignore
        console.warn("QR scan error:", errorMessage);
      }
    );

    // Clean up on unmount
    return () => {
      scanner
        .clear()
        .catch((error) => console.error("Error clearing scanner:", error));
    };
  }, [onScanSuccess, isSecureContext]);

  if (error) {
    return (
      <div className="bg-secondary p-6 rounded-lg border border-primary/10 text-center">
        <div className="bg-destructive/10 rounded-full p-3 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
          <AlertTriangle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="text-base font-medium mb-2">
          Camera Access Unavailable
        </h3>
        <p className="text-sm text-muted-foreground mb-4 max-w-[320px] mx-auto">
          {error}
        </p>
        <div className="p-3 bg-muted rounded-md text-sm max-w-[320px] mx-auto">
          <p className="mb-2 font-medium">Why this happens:</p>
          <p className="text-xs text-muted-foreground mb-2">
            For security reasons, camera access requires HTTPS. Please use this
            application on a secure connection or localhost.
          </p>
          <p className="text-xs font-medium text-primary">
            You can still use manual code entry instead.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="qr-scanner-container">
      <div className="relative mb-4 rounded-lg overflow-hidden border border-primary/10 bg-black/5">
        {/* Camera frame overlay */}
        <div className="absolute inset-0 z-10 pointer-events-none">
          <div className="h-full w-full flex items-center justify-center">
            <div className="relative w-[280px] h-[280px] max-w-[80vw] max-h-[80vw]">
              {/* Scanner animation */}
              <div className="absolute top-0 left-0 w-full h-[2px] bg-primary/70 animate-scanline"></div>

              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-[30px] h-[30px] border-t-2 border-l-2 border-primary"></div>
              <div className="absolute top-0 right-0 w-[30px] h-[30px] border-t-2 border-r-2 border-primary"></div>
              <div className="absolute bottom-0 left-0 w-[30px] h-[30px] border-b-2 border-l-2 border-primary"></div>
              <div className="absolute bottom-0 right-0 w-[30px] h-[30px] border-b-2 border-r-2 border-primary"></div>
            </div>
          </div>
        </div>

        {/* Actual scanner */}
        <div id="reader" className="w-full"></div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <p>Position the QR code within the frame</p>
      </div>

      <style jsx>{`
        .qr-scanner-container {
          width: 100%;
        }
        #reader {
          width: 100% !important;
          min-height: 320px !important;
          border: none !important;
          box-shadow: none !important;
          background: transparent !important;
        }
        #reader__dashboard_section_csr {
          margin-bottom: 8px !important;
        }
        #reader__dashboard_section_csr button {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border: none !important;
          border-radius: 0.25rem !important;
          padding: 0.5rem 1rem !important;
          cursor: pointer !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        #reader__dashboard_section_csr span {
          font-family: inherit !important;
          font-size: 14px !important;
        }
        #reader__dashboard_section_swaplink {
          color: hsl(var(--primary)) !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        #reader__scan_region {
          background-color: transparent !important;
        }
        #reader__scan_region img {
          display: none !important;
        }
        #reader__status_span {
          background-color: transparent !important;
          color: hsl(var(--foreground)) !important;
          border: none !important;
          font-family: inherit !important;
          font-size: 14px !important;
        }
        video {
          object-fit: cover !important;
        }
        /* Animation is now in globals.css */
      `}</style>
    </div>
  );
}
