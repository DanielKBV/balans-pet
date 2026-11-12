"use client"

import { useState, useTransition } from "react"
import { useForm, useWatch } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldError, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"
import { deleteBusiness, updateBusiness, updateDisplayName } from "./actions"
import { businessSchema, displayNameSchema, type BusinessValues } from "./schema"

const SUBMIT_CLASS = "w-full sm:w-auto sm:self-start"

export function BusinessForm({ defaultValues }: { defaultValues: BusinessValues }) {
  const form = useForm<BusinessValues>({ resolver: zodResolver(businessSchema), defaultValues })
  const { errors, isSubmitting } = form.formState
  // Saving is allowed only after a real change: surrounding spaces do not count.
  const [saved, setSaved] = useState(defaultValues)
  const current = useWatch({ control: form.control })
  const isChanged = current.name?.trim() !== saved.name || current.activity?.trim() !== saved.activity

  const onSubmit = form.handleSubmit(async (values) => {
    const result = await updateBusiness(values)
    if (result.error) {
      toast.error(result.error)
      return
    }
    setSaved(values)
    form.reset(values)
    toast.success("Бизнес сохранён")
  })

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-col gap-4">
      <Field data-invalid={!!errors.name}>
        <FieldLabel htmlFor="business-name">Название</FieldLabel>
        <Input
          id="business-name"
          maxLength={100}
          aria-invalid={!!errors.name}
          aria-describedby={errors.name ? "business-name-error" : undefined}
          {...form.register("name")}
        />
        <FieldError id="business-name-error" errors={[errors.name]} />
      </Field>
      <Field data-invalid={!!errors.activity}>
        <FieldLabel htmlFor="activity">Вид деятельности</FieldLabel>
        <Input
          id="activity"
          maxLength={100}
          aria-invalid={!!errors.activity}
          aria-describedby={errors.activity ? "activity-error" : undefined}
          {...form.register("activity")}
        />
        <FieldError id="activity-error" errors={[errors.activity]} />
      </Field>
      <Button type="submit" className={SUBMIT_CLASS} disabled={!isChanged || isSubmitting}>
        {isSubmitting && <Spinner />}
        Сохранить
      </Button>
    </form>
  )
}

/** One field, so plain state instead of a form library (see DESIGN.md). */
export function ProfileForm({
  defaultName,
  buttonVariant,
}: {
  defaultName: string
  buttonVariant: "default" | "outline"
}) {
  const [name, setName] = useState(defaultName)
  const [savedName, setSavedName] = useState(defaultName)
  const isChanged = name.trim() !== savedName
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function submit(event: React.FormEvent) {
    event.preventDefault()
    const parsed = displayNameSchema.safeParse(name)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    startTransition(async () => {
      const result = await updateDisplayName(parsed.data)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setSavedName(parsed.data)
      setName(parsed.data)
      toast.success("Имя сохранено")
    })
  }

  return (
    <form noValidate onSubmit={submit} className="flex flex-col gap-4">
      <Field data-invalid={!!error}>
        <FieldLabel htmlFor="display-name">Имя</FieldLabel>
        <Input
          id="display-name"
          maxLength={100}
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value)
            setError(undefined)
          }}
          aria-invalid={!!error}
          aria-describedby={error ? "display-name-error" : "display-name-hint"}
        />
        {error ? (
          <FieldError id="display-name-error">{error}</FieldError>
        ) : (
          <p id="display-name-hint" className="text-small text-muted-foreground">
            Его видит владелец в списке команды и в колонке «Кто внёс»
          </p>
        )}
      </Field>
      <Button type="submit" variant={buttonVariant} className={SUBMIT_CLASS} disabled={!isChanged || isPending}>
        {isPending && <Spinner />}
        Сохранить
      </Button>
    </form>
  )
}

/** The delete button unlocks only when the exact business name is typed. */
export function DeleteBusiness({ businessName }: { businessName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [typed, setTyped] = useState("")
  const [isPending, startTransition] = useTransition()
  const matches = typed.trim() === businessName

  function remove() {
    startTransition(async () => {
      // On success the server redirects to /onboarding.
      const result = await deleteBusiness(typed)
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <>
      <Button variant="destructive" className={SUBMIT_CLASS} onClick={() => setIsOpen(true)}>
        Удалить бизнес
      </Button>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open)
          if (!open) setTyped("")
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить бизнес?</DialogTitle>
            <DialogDescription>
              Удалятся все записи, категории и команда «{businessName}». Сотрудники потеряют доступ. Отменить
              нельзя.
            </DialogDescription>
          </DialogHeader>
          <Field>
            <FieldLabel htmlFor="confirm-name">Введите название бизнеса, чтобы подтвердить</FieldLabel>
            <Input
              id="confirm-name"
              autoComplete="off"
              placeholder={businessName}
              value={typed}
              onChange={(event) => setTyped(event.target.value)}
            />
          </Field>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
            <Button variant="destructive" disabled={!matches || isPending} onClick={remove}>
              {isPending && <Spinner />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
