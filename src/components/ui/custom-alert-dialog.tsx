// components/ui/custom-alert-dialog.tsx
"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger, // We might control it with isOpen prop instead
} from "@/components/ui/alert-dialog"; // Assuming shadcn/ui path
import { Button } from "@/components/ui/button";

interface CustomAlertDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: React.ReactNode; // Can be string or JSX for more complex messages
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
}

export function CustomAlertDialog({
  isOpen,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmText = "Confirm",
  cancelText = "Cancel",
  confirmButtonVariant = "destructive", // Default to destructive for delete actions
}: CustomAlertDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent className="bg-card border border-white/10 text-white">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-white">{title}</AlertDialogTitle>
          <AlertDialogDescription className="text-slate-400">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel
            onClick={() => onOpenChange(false)}
            className="bg-transparent border-slate-700 hover:bg-slate-700/80 text-slate-300 hover:text-white"
          >
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={() => {
              onConfirm();
              onOpenChange(false); // Close dialog after confirm
            }}
            // Apply variant to the confirm button
            className={
                confirmButtonVariant === "destructive" ? 
                "bg-destructive text-destructive-foreground hover:bg-destructive/90" : 
                "bg-primary text-primary-foreground hover:bg-primary/90" // Default to primary if not destructive
            }
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}