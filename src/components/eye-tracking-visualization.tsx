"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Eye } from "lucide-react";

export default function EyeTrackingVisualization() {
  const [isTracking, setIsTracking] = useState(false);
  const [heatmapData, setHeatmapData] = useState<
    { x: number; y: number; value: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Simulate eye tracking data
  useEffect(() => {
    if (!isTracking) return;

    const interval = setInterval(() => {
      // In a real implementation, this would come from an eye tracking device
      const newPoint = {
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        value: Math.random() * 0.5 + 0.5, // Value between 0.5 and 1
      };

      setHeatmapData((prev) => [...prev, newPoint]);
    }, 500);

    return () => clearInterval(interval);
  }, [isTracking]);

  // Draw heatmap
  useEffect(() => {
    if (!canvasRef.current || heatmapData.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw heatmap points
    heatmapData.forEach((point) => {
      const gradient = ctx.createRadialGradient(
        point.x,
        point.y,
        5,
        point.x,
        point.y,
        30
      );

      gradient.addColorStop(0, `rgba(255, 0, 0, ${point.value})`);
      gradient.addColorStop(1, "rgba(255, 0, 0, 0)");

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(point.x, point.y, 30, 0, Math.PI * 2);
      ctx.fill();
    });
  }, [heatmapData]);

  const toggleTracking = () => {
    if (isTracking) {
      setIsTracking(false);
    } else {
      setHeatmapData([]);
      setIsTracking(true);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1">
          <Eye className="h-4 w-4" />
          <span>Eye Tracking</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Eye Tracking Visualization</DialogTitle>
          <DialogDescription>
            This tool helps visualize where your attention is focused during the
            interview.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-4">
          <div className="relative border rounded-md h-[300px] overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              {isTracking
                ? "Tracking active..."
                : "Start tracking to visualize attention"}
            </div>
            <canvas
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
            />
          </div>

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setHeatmapData([])}>
              Clear Data
            </Button>
            <Button
              variant={isTracking ? "destructive" : "default"}
              onClick={toggleTracking}
            >
              {isTracking ? "Stop Tracking" : "Start Tracking"}
            </Button>
          </div>

          {heatmapData.length > 0 && (
            <div className="p-4 bg-slate-100 rounded-md">
              <h3 className="text-sm font-medium mb-2">Attention Analysis</h3>
              <p className="text-sm text-slate-600">
                Based on your eye movement patterns, you appear to be focusing
                most on the
                {heatmapData.length > 10
                  ? " question content and less on the answer field."
                  : " interface elements."}
              </p>
              <p className="text-sm text-slate-600 mt-2">
                {heatmapData.length > 20
                  ? "Your attention seems scattered. Try to focus more on the content of the questions."
                  : "Your focus pattern appears normal for this type of task."}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
