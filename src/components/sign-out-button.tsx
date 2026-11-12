"use client"

import { useFormStatus } from "react-dom"
import { LogOutIcon } from "lucide-react"

import { signOut } from "@/app/login/actions"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

/** Header icon button: the spinner replaces the icon while signing out. */
export function SignOutIconButton() {
  return (
    <form action={signOut}>
      <SubmitIcon />
    </form>
  )
}

function SubmitIcon() {
  const { pending } = useFormStatus()
  return (
    <Button type="submit" variant="ghost" size="icon" aria-label="Выйти" title="Выйти" disabled={pending}>
      {pending ? <Spinner className="size-5" /> : <LogOutIcon className="size-5 text-muted-foreground" />}
    </Button>
  )
}
