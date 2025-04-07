"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Download, ZoomIn, ZoomOut, Share2, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function QRGenerator({ sessionData }) {
  const [size, setSize] = useState(256);
  const [isMobile, setIsMobile] = useState(false);
  const { toast } = useToast();

  // Check if device is mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      // Adjust QR code size for mobile
      if (window.innerWidth < 768) {
        setSize(Math.min(window.innerWidth - 100, 256));
      } else {
        setSize(256);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const downloadQRCode = () => {
    try {
      // Get the SVG element
      const svgElement = document.getElementById("qr-svg");
      if (!svgElement) {
        throw new Error("QR code element not found");
      }

      // Create a canvas element
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      // Set canvas dimensions to match QR code size plus some padding
      const padding = 20; // Add padding around the QR code
      canvas.width = size + padding * 2;
      canvas.height = size + padding * 2;

      // Fill the background with white
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Create an image from the SVG
      const img = new Image();
      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      img.onload = () => {
        // Draw the image on the canvas with padding
        ctx.drawImage(img, padding, padding, size, size);

        // Add session info as text at the bottom
        ctx.fillStyle = "white";
        ctx.fillRect(0, canvas.height - 40, canvas.width, 40);
        ctx.font = "12px Arial";
        ctx.fillStyle = "black";
        ctx.textAlign = "center";
        ctx.fillText(sessionData.subject, canvas.width / 2, canvas.height - 25);
        ctx.fillText(
          new Date(sessionData.date).toLocaleDateString(),
          canvas.width / 2,
          canvas.height - 10
        );

        // Convert canvas to blob
        canvas.toBlob(
          (blob) => {
            // Create download link
            const url = URL.createObjectURL(blob);
            const downloadLink = document.createElement("a");
            downloadLink.href = url;
            downloadLink.download = `qr-code-${sessionData.subject.replace(
              /\s+/g,
              "-"
            )}.jpg`;
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
            URL.revokeObjectURL(url);
            URL.revokeObjectURL(svgUrl);

            toast({
              title: "Success",
              description: "QR code downloaded as JPG image",
            });
          },
          "image/jpeg",
          0.9
        );
      };

      img.src = svgUrl;
    } catch (error) {
      console.error("Error downloading QR code:", error);
      toast({
        title: "Error",
        description: "Failed to download QR code: " + error.message,
        variant: "destructive",
      });
    }
  };

  const shareQRCode = async () => {
    try {
      if (!navigator.share) {
        toast({
          title: "Error",
          description: "Sharing is not supported on this device",
          variant: "destructive",
        });
        return;
      }

      // Share just the text (more reliable than sharing files)
      await navigator.share({
        title: `QR Code for ${sessionData.subject}`,
        text: `Session: ${sessionData.subject}\nQR Code Value: ${sessionData.qrCodeData}\n\nUse this code to mark your attendance.`,
      });

      toast({
        title: "Success",
        description: "QR code information shared successfully",
      });
    } catch (error) {
      console.error("Error sharing QR code:", error);
      if (error.name !== "AbortError") {
        toast({
          title: "Error",
          description: "Failed to share QR code: " + error.message,
          variant: "destructive",
        });
      }
    }
  };

  if (!sessionData) {
    return null;
  }

  return (
    <Card className="w-full shadow-sm">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-secondary">
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
              <CardTitle>Attendance QR Code</CardTitle>
              <CardDescription>
                {sessionData.subject}
              </CardDescription>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSize(Math.max(size - 32, 128))}
            >
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setSize(Math.min(size + 32, 400))}
            >
              <ZoomIn className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center">
            <div className="bg-white p-4 rounded-lg border">
              <QRCodeSVG
                id="qr-svg"
                value={sessionData.qrCodeData}
                size={size}
                level="H"
                includeMargin
                bgColor={"#FFFFFF"}
                fgColor={"#000000"}
              />
            </div>
            
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <Button onClick={downloadQRCode}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>

              {navigator && navigator.share && (
                <Button variant="outline" onClick={shareQRCode}>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </Button>
              )}
            </div>
          </div>
          
          <div>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-1">Session Details</h3>
                <div className="bg-secondary p-3 rounded-md space-y-2">
                  <div>
                    <span className="text-xs text-muted-foreground block">Subject</span>
                    <span>{sessionData.subject}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Created</span>
                    <span>{new Date(sessionData.date).toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-xs text-muted-foreground block">Expires</span>
                    <span>{new Date(sessionData.expiresAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h3 className="text-sm font-medium">QR Code Value</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 px-2 text-xs"
                    onClick={() => {
                      navigator.clipboard.writeText(sessionData.qrCodeData);
                      toast({
                        title: "Copied",
                        description: "QR code value copied to clipboard",
                      });
                    }}
                  >
                    <Copy className="mr-1 h-3 w-3" />
                    Copy
                  </Button>
                </div>
                
                <div className="bg-secondary p-3 rounded-md">
                  <code className="text-xs break-all block">
                    {sessionData.qrCodeData}
                  </code>
                </div>
                
                <p className="text-xs text-muted-foreground mt-2">
                  Students can manually enter this code if scanning doesn't work
                </p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
