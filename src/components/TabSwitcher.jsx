"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Camera, KeySquare } from "lucide-react";

export default function TabSwitcher({ onSwitchToCamera, onSwitchToManual }) {
  return (
    <div className="flex gap-2 mb-4">
      <Button
        variant="outline"
        className="flex-1"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log("Switch to manual clicked in TabSwitcher");
          if (onSwitchToManual) onSwitchToManual();
        }}
      >
        <KeySquare className="mr-2 h-4 w-4" />
        Manual Input
      </Button>

      <Button
        variant="outline"
        className="flex-1"
        type="button"
        onClick={(e) => {
          e.preventDefault();
          console.log("Switch to camera clicked in TabSwitcher");
          if (onSwitchToCamera) onSwitchToCamera();
        }}
      >
        <Camera className="mr-2 h-4 w-4" />
        Camera
      </Button>
    </div>
  );
}
