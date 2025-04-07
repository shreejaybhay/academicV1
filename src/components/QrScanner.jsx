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
      <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800 text-center">
        <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-amber-500" />
        <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200 max-w-[280px] mx-auto">
          <span className="inline-block">{error}</span>
        </h3>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-1 max-w-[280px] mx-auto">
          <span className="inline-block">
            For security reasons, camera access requires HTTPS. Please use this
            application on a secure connection or localhost.
          </span>
        </p>
        <p className="text-xs text-amber-700 dark:text-amber-300 mt-3 whitespace-nowrap">
          You can still use manual code entry instead.
        </p>
      </div>
    );
  }

  return (
    <div className="qr-scanner-container">
      <div id="reader" className="w-full"></div>
      <style jsx>{`
        .qr-scanner-container {
          width: 100%;
        }
        #reader {
          width: 100% !important;
          border: none !important;
          box-shadow: none !important;
        }
        #reader__dashboard_section_csr button {
          background-color: hsl(var(--primary)) !important;
          color: hsl(var(--primary-foreground)) !important;
          border: none !important;
          border-radius: 0.25rem !important;
          padding: 0.5rem 1rem !important;
          cursor: pointer !important;
        }
        #reader__scan_region {
          background-color: transparent !important;
        }
        #reader__scan_region img {
          display: none !important;
        }
      `}</style>
    </div>
  );
}
