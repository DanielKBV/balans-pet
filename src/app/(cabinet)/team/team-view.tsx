"use client"

import { useState, useTransition } from "react"
import { CopyIcon, LinkIcon, Trash2Icon } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { formatMoment } from "@/lib/format"
import { createInvite, removeMember, revokeInvite } from "./actions"

export type Member = {
  user_id: string
  role: "owner" | "employee"
  display_name: string | null
  email: string | null
  created_at: string
}

export function MemberList({ members, businessName }: { members: Member[]; businessName: string }) {
  return (
    <ul className="-my-2 divide-y divide-border">
      {members.map((member) => (
        <MemberRow key={member.user_id} member={member} businessName={businessName} />
      ))}
    </ul>
  )
}

function MemberRow({ member, businessName }: { member: Member; businessName: string }) {
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPending, startTransition] = useTransition()
  const name = member.display_name ?? member.email ?? "Без имени"

  function remove() {
    startTransition(async () => {
      const result = await removeMember(member.user_id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setIsConfirming(false)
      toast.success(`${name} больше не в команде`)
    })
  }

  return (
    <li className="flex items-center gap-3 py-3">
      <div className="flex min-w-0 flex-1 flex-col gap-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="min-w-0 font-medium break-words">{name}</span>
          <Badge variant={member.role === "owner" ? "secondary" : "outline"}>
            {member.role === "owner" ? "Владелец" : "Сотрудник"}
          </Badge>
        </div>
        <span className="text-small break-words text-muted-foreground">
          {member.email && member.email !== name && `${member.email} · `}в команде с {formatMoment(member.created_at)}
        </span>
      </div>
      {member.role === "employee" && (
        <>
          <Button
            variant="ghost"
            size="icon"
            aria-label={`Удалить «${name}» из команды`}
            title="Удалить из команды"
            onClick={() => setIsConfirming(true)}
          >
            <Trash2Icon className="size-5 text-muted-foreground" />
          </Button>
          <Dialog open={isConfirming} onOpenChange={setIsConfirming}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Удалить из команды?</DialogTitle>
                <DialogDescription>
                  {name} больше не сможет вносить записи в «{businessName}». Его записи останутся, в колонке «Кто
                  внёс» будет «Бывший сотрудник».
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
                <Button variant="destructive" disabled={isPending} onClick={remove}>
                  {isPending && <Spinner />}
                  Удалить
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </>
      )}
    </li>
  )
}

/** One active link at a time: show it with «Скопировать» / «Отозвать», or the button to make one. */
export function InviteBlock({ invite, origin }: { invite: { id: string; expires_at: string } | null; origin: string }) {
  const [isPending, startTransition] = useTransition()

  function run(action: () => Promise<{ error?: string; warning?: string }>, success?: string) {
    startTransition(async () => {
      const result = await action()
      if (result.error) toast.error(result.error)
      else if (result.warning) toast.warning(result.warning)
      else if (success) toast.success(success)
    })
  }

  if (!invite) {
    return (
      <div className="flex flex-col items-start gap-4">
        <p className="text-muted-foreground">
          Ссылка одноразовая: по ней вступит один человек. Когда он вступит, можно будет создать следующую.
        </p>
        <Button disabled={isPending} onClick={() => run(createInvite)}>
          {isPending ? <Spinner /> : <LinkIcon data-icon="inline-start" />}
          Создать ссылку
        </Button>
      </div>
    )
  }

  const url = `${origin}/invite/${invite.id}`

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      toast.success("Ссылка скопирована")
    } catch {
      toast.error("Не удалось скопировать. Выделите ссылку и скопируйте вручную")
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-muted-foreground">
        Отправьте ссылку сотруднику в WhatsApp или Telegram. Она одноразовая и действует до{" "}
        {formatMoment(invite.expires_at)}.
      </p>
      <div className="flex flex-col gap-2">
        <Label htmlFor="invite-url" className="sr-only">
          Ссылка-приглашение
        </Label>
        <Input id="invite-url" readOnly value={url} onFocus={(e) => e.currentTarget.select()} className="text-small" />
      </div>
      <div className="flex flex-wrap gap-2 *:flex-1 sm:*:flex-none">
        <Button onClick={copy}>
          <CopyIcon data-icon="inline-start" />
          Скопировать
        </Button>
        <Button variant="ghost" disabled={isPending} onClick={() => run(() => revokeInvite(invite.id), "Ссылка отозвана")}>
          {isPending && <Spinner />}
          Отозвать
        </Button>
      </div>
    </div>
  )
}
