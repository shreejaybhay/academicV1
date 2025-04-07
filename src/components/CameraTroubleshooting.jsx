"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  AlertCircle,
  Camera,
  Settings,
  RefreshCw,
  ExternalLink,
} from "lucide-react";

export default function CameraTroubleshooting({ onTryAgain }) {
  return (
    <div className="mt-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <h3 className="font-medium">Camera Troubleshooting Guide</h3>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="item-1">
          <AccordionTrigger className="text-sm">
            Browser Permission Issues
          </AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Check if your browser has permission to access the camera</li>
              <li>Look for the camera icon in your browser's address bar</li>
              <li>Make sure you've allowed camera access when prompted</li>
              <li>
                <Button
                  variant="link"
                  className="h-auto p-0 text-sm"
                  onClick={() =>
                    window.open(
                      "https://support.google.com/chrome/answer/2693767",
                      "_blank"
                    )
                  }
                >
                  How to manage camera permissions{" "}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              </li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="text-sm">Device Issues</AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Make sure your device has a working camera</li>
              <li>Check if another application is using your camera</li>
              <li>
                Try closing other applications that might be using the camera
              </li>
              <li>Restart your browser or device</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="text-sm">
            Browser Compatibility
          </AccordionTrigger>
          <AccordionContent>
            <ul className="text-sm space-y-2 list-disc pl-5">
              <li>Try using a different browser (Chrome, Firefox, Safari)</li>
              <li>Make sure your browser is up to date</li>
              <li>
                Some browsers have restrictions on camera access in certain
                contexts
              </li>
              <li>Try accessing the site using HTTPS instead of HTTP</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      <div className="mt-4 flex flex-col sm:flex-row gap-2 justify-between">
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={onTryAgain}
        >
          <RefreshCw className="h-4 w-4" />
          Try Camera Again
        </Button>

        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
          onClick={() => window.open("about:settings", "_blank")}
        >
          <Settings className="h-4 w-4" />
          Open Browser Settings
        </Button>
      </div>

      <p className="text-xs text-muted-foreground mt-4">
        Note: If you continue to experience issues, please use the manual input
        option to enter the attendance code.
      </p>
    </div>
  );
}
