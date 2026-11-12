"use client"

import { useActionState, useState } from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { createBusiness, type BusinessState } from "./actions"

export function BusinessForm() {
  const [state, formAction, isPending] = useActionState<BusinessState, FormData>(createBusiness, {})
  // Controlled: React resets uncontrolled fields after a form action.
  const [name, setName] = useState("")
  const [activity, setActivity] = useState("")

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="name">Название</Label>
        <Input
          id="name"
          name="name"
          placeholder="Автомойка Азамата"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="activity">Вид деятельности</Label>
        <Input
          id="activity"
          name="activity"
          placeholder="Автомойка"
          maxLength={100}
          value={activity}
          onChange={(e) => setActivity(e.target.value)}
          required
        />
      </div>

      {state.error && (
        <p role="alert" className="text-small text-destructive-text">
          {state.error}
        </p>
      )}

      <Button type="submit" disabled={isPending} className="w-full">
        {isPending && <Spinner />}
        Создать бизнес
      </Button>
    </form>
  )
}
