"use client"

import { useActionState, useState, useTransition } from "react"
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

function AddForm({ type }: { type: "income" | "expense" }) {
  // Controlled: React resets uncontrolled fields after a form action, also on error.
  const [name, setName] = useState("")
  const [state, formAction, isPending] = useActionState<CategoryState, FormData>(async (prev, formData) => {
    const result = await addCategory(prev, formData)
    if (!result.error) setName("")
    return result
  }, {})
  const inputId = `new-${type}`

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <Label htmlFor={inputId} className="sr-only">
        Новая категория
      </Label>
      <div className="flex gap-2">
        <input type="hidden" name="type" value={type} />
        <Input
          id={inputId}
          name="name"
          placeholder="Новая категория"
          maxLength={100}
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <Button type="submit" disabled={isPending}>
          {isPending ? "Добавляем…" : "Добавить"}
        </Button>
      </div>
      {state.error && (
        <p role="alert" className="text-small text-destructive-text">
          {state.error}
        </p>
      )}
    </form>
  )
}

function CategoryRow({ category }: { category: Category }) {
  const [isRenaming, setIsRenaming] = useState(false)
  const [isPending, startTransition] = useTransition()

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
        onClick={() => setIsRenaming(true)}
      >
        <PencilIcon className="size-5 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={category.is_hidden ? `Показать «${category.name}»` : `Скрыть «${category.name}»`}
        title={category.is_hidden ? "Показать" : "Скрыть"}
        disabled={isPending}
        onClick={toggleHidden}
      >
        {category.is_hidden ? (
          <EyeIcon className="size-5 text-muted-foreground" />
        ) : (
          <EyeOffIcon className="size-5 text-muted-foreground" />
        )}
      </Button>
      <RenameDialog category={category} open={isRenaming} onOpenChange={setIsRenaming} />
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
  const [name, setName] = useState(category.name)
  const [state, formAction, isPending] = useActionState<CategoryState, FormData>(async (prev, formData) => {
    const result = await renameCategory(prev, formData)
    if (!result.error) onOpenChange(false)
    return result
  }, {})
  const inputId = `rename-${category.id}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form action={formAction} className="flex flex-col gap-4">
          <DialogHeader>
            <DialogTitle>Переименовать категорию</DialogTitle>
          </DialogHeader>
          <input type="hidden" name="id" value={category.id} />
          <div className="flex flex-col gap-2">
            <Label htmlFor={inputId}>Название</Label>
            <Input
              id={inputId}
              name="name"
              maxLength={100}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          {state.error && (
            <p role="alert" className="text-small text-destructive-text">
              {state.error}
            </p>
          )}
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Сохраняем…" : "Сохранить"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
