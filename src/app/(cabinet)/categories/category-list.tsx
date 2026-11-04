"use client"

import { useState, useTransition, type FormEvent } from "react"
import { EyeIcon, EyeOffIcon, PencilIcon } from "lucide-react"
import { toast } from "sonner"

import { StateMessage } from "@/components/state-message"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { addCategory, renameCategory, setCategoryHidden, type CategoryState } from "./actions"

export type Category = { id: string; name: string; is_hidden: boolean }

export function CategorySection({
  type,
  title,
  categories,
}: {
  type: "income" | "expense"
  title: string
  categories: Category[]
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2>{title}</h2>
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <AddForm type={type} />
        {categories.length ? (
          <ul className="flex flex-col divide-y divide-border">
            {categories.map((category) => (
              <CategoryRow key={category.id} category={category} />
            ))}
          </ul>
        ) : (
          <StateMessage
            variant="empty"
            title="Категорий пока нет"
            description="Добавьте первую в поле выше."
          />
        )}
      </CardContent>
    </Card>
  )
}

/**
 * Name field state shared by the add form and the rename dialog: the error
 * disappears as soon as the text changes, an empty field is caught before the server.
 */
function useNameField(initialName: string, save: (name: string) => Promise<CategoryState>) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState<string>()
  const [isPending, startTransition] = useTransition()

  function onChange(value: string) {
    setName(value)
    setError(undefined)
  }

  function submit(event: FormEvent<HTMLFormElement>, onSaved: () => void) {
    event.preventDefault()
    if (!name.trim()) {
      setError("Введите название категории")
      return
    }
    startTransition(async () => {
      const result = await save(name)
      setError(result.error)
      if (!result.error) onSaved()
    })
  }

  return { name, setName, error, isPending, onChange, submit }
}

function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) return null
  return (
    <p id={id} role="alert" className="text-small text-destructive-text">
      {error}
    </p>
  )
}

function AddForm({ type }: { type: "income" | "expense" }) {
  const field = useNameField("", (name) => addCategory(type, name))
  const inputId = `new-${type}`
  const errorId = `${inputId}-error`

  return (
    <form noValidate onSubmit={(e) => field.submit(e, () => field.setName(""))} className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="sr-only">
        Новая категория
      </Label>
      <div className="flex gap-2">
        <Input
          id={inputId}
          placeholder="Новая категория"
          maxLength={100}
          value={field.name}
          onChange={(e) => field.onChange(e.target.value)}
          aria-invalid={!!field.error}
          aria-describedby={field.error ? errorId : undefined}
        />
        <Button type="submit" disabled={field.isPending}>
          {field.isPending && <Spinner />}
          Добавить
        </Button>
      </div>
      <FieldError id={errorId} error={field.error} />
    </form>
  )
}

function CategoryRow({ category }: { category: Category }) {
  const [isRenaming, setIsRenaming] = useState(false)
  // A new key on every open remounts the dialog, so it starts clean.
  const [renameKey, setRenameKey] = useState(0)
  const [isPending, startTransition] = useTransition()

  function openRename() {
    setRenameKey((key) => key + 1)
    setIsRenaming(true)
  }

  function toggleHidden() {
    startTransition(async () => {
      const result = await setCategoryHidden(category.id, !category.is_hidden)
      if (result.error) toast.error(result.error)
    })
  }

  return (
    <li className="flex min-h-row items-center gap-2 py-1">
      <span className={category.is_hidden ? "min-w-0 flex-1 truncate text-subtle-foreground" : "min-w-0 flex-1 truncate"}>
        {category.name}
      </span>
      {category.is_hidden && <Badge variant="outline">Скрыта</Badge>}
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Переименовать «${category.name}»`}
        title="Переименовать"
        onClick={openRename}
      >
        <PencilIcon className="size-5 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={category.is_hidden ? `Показать «${category.name}»` : `Скрыть «${category.name}»`}
        aria-busy={isPending}
        title={category.is_hidden ? "Показать" : "Скрыть"}
        disabled={isPending}
        onClick={toggleHidden}
      >
        {isPending ? (
          <Spinner className="size-5 text-muted-foreground" />
        ) : category.is_hidden ? (
          <EyeIcon className="size-5 text-muted-foreground" />
        ) : (
          <EyeOffIcon className="size-5 text-muted-foreground" />
        )}
      </Button>
      <RenameDialog key={renameKey} category={category} open={isRenaming} onOpenChange={setIsRenaming} />
    </li>
  )
}

function RenameDialog({
  category,
  open,
  onOpenChange,
}: {
  category: Category
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const field = useNameField(category.name, (name) => renameCategory(category.id, name))
  const inputId = `rename-${category.id}`
  const errorId = `${inputId}-error`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form noValidate onSubmit={(e) => field.submit(e, () => onOpenChange(false))} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Переименовать категорию</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId}>Название</Label>
            <Input
              id={inputId}
              maxLength={100}
              value={field.name}
              onChange={(e) => field.onChange(e.target.value)}
              aria-invalid={!!field.error}
              aria-describedby={field.error ? errorId : undefined}
            />
            <FieldError id={errorId} error={field.error} />
          </div>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
            <Button type="submit" disabled={field.isPending}>
              {field.isPending && <Spinner />}
              Сохранить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
