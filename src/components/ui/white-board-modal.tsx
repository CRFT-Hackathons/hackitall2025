"use client";

import { useState, useRef } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Tldraw } from "@tldraw/tldraw";
import type { Editor } from "@tldraw/tldraw";
import "@tldraw/tldraw/tldraw.css";

export default function WhiteboardModal() {
  const [open, setOpen] = useState(false);
  const editorRef = useRef<Editor | null>(null);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          size="icon"
          variant="outline"
          className="rounded-full h-12 w-12 fixed bottom-6 right-6 shadow-md"
        >
          <Pencil className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[90vw] max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Whiteboard</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh] w-full border rounded-md overflow-hidden">
          <Tldraw
            onMount={(editor) => {
              editorRef.current = editor;
            }}
          />
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Close</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
