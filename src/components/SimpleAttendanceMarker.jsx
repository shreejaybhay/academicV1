'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, QrCode, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function SimpleAttendanceMarker() {
  const [attendanceCode, setAttendanceCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  
  const { toast } = useToast();

  // Handle manual code submission
  const handleSubmit = async () => {
    if (!attendanceCode.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a valid attendance code',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Call the API to mark attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          qrCodeData: attendanceCode,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage(data.message || 'Attendance marked successfully!');
        toast({
          title: 'Success',
          description: 'Attendance marked successfully!',
        });
      } else {
        setMessage(data.message || 'Failed to mark attendance');
        toast({
          title: 'Error',
          description: data.message || 'Failed to mark attendance',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error marking attendance:', error);
      setMessage('An error occurred while marking attendance');
      toast({
        title: 'Error',
        description: 'An error occurred while marking attendance',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset the form
  const reset = () => {
    setAttendanceCode('');
    setSuccess(false);
    setMessage('');
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-xl">Mark Attendance</CardTitle>
        <CardDescription>
          Enter the attendance code provided by your instructor
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {success ? (
          <div className="text-center space-y-4">
            <div className="flex justify-center">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <h3 className="text-lg font-medium">Attendance Marked!</h3>
            <p className="text-sm text-muted-foreground">{message}</p>
            <Button onClick={reset} variant="outline" className="mt-4">
              Mark Another Attendance
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
              <div className="flex items-start">
                <AlertCircle className="h-5 w-5 text-amber-500 mt-0.5 mr-2" />
                <div>
                  <h3 className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    Camera Access Unavailable
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    Camera functionality is currently unavailable. Please enter the attendance code manually.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-muted/30 p-4 rounded-lg border border-dashed">
              <h3 className="text-sm font-medium mb-2">How to get your attendance code</h3>
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
              <div className="flex gap-2">
                <Input
                  id="code"
                  type="text"
                  placeholder="Enter attendance code"
                  value={attendanceCode}
                  onChange={(e) => setAttendanceCode(e.target.value)}
                  className="font-mono"
                />
                <Button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || !attendanceCode.trim()}
                  size="icon"
                >
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <QrCode className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {message && !success && (
                <p className="text-sm text-destructive mt-1">{message}</p>
              )}
            </div>
          </div>
        )}
      </CardContent>
      
      {!success && (
        <CardFooter>
          <Button 
            onClick={handleSubmit} 
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
        </CardFooter>
      )}
    </Card>
  );
}
