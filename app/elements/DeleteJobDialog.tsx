"use client"

import { Trash2Icon } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type DeleteJobDialogProps = {
  /** Title of the job post being deleted — `null` keeps the dialog closed. */
  jobTitle: string | null
  /** True while the delete request is in flight; disables the buttons. */
  deleting?: boolean
  /** Called when the dialog wants to open (always false here) or close. */
  onOpenChange: (open: boolean) => void
  /** Called when the user confirms the deletion. */
  onConfirm: () => void
}

/**
 * Destructive confirmation dialog shown before permanently removing a job
 * post. Controlled by the parent (no trigger of its own), so any delete
 * button on the page can open it.
 */
export function DeleteJobDialog({
  jobTitle,
  deleting = false,
  onOpenChange,
  onConfirm,
}: DeleteJobDialogProps) {
  return (
    <AlertDialog
      open={jobTitle !== null}
      onOpenChange={(open) => onOpenChange(open)}
    >
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogMedia className="bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive">
            <Trash2Icon />
          </AlertDialogMedia>
          <AlertDialogTitle>
            {jobTitle ? `Delete "${jobTitle}"?` : "Delete job post?"}
          </AlertDialogTitle>
          <AlertDialogDescription>
            This will permanently remove this job post from your listings.
            Candidates will no longer be able to find or apply to it. This
            action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel variant="outline" disabled={deleting}>
            Cancel
          </AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={deleting}
            onClick={onConfirm}
          >
            {deleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
