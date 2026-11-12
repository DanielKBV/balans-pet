"use client"

import { useEffect, useMemo, useRef, useState, useTransition } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  columnFilteringFeature,
  createColumnHelper,
  functionalUpdate,
  rowPaginationFeature,
  rowSortingFeature,
  tableFeatures,
  useTable,
  type ColumnFiltersState,
  type PaginationState,
  type SortingState,
} from "@tanstack/react-table"
import {
  ArrowDownIcon,
  ArrowUpDownIcon,
  ArrowUpIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PencilIcon,
  PlusIcon,
  SearchIcon,
  SearchXIcon,
  Trash2Icon,
} from "lucide-react"
import { toast } from "sonner"

import { EntryForm } from "@/components/entry-form"
import { Money } from "@/components/money"
import { StateMessage } from "@/components/state-message"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Spinner } from "@/components/ui/spinner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import type { EntryType } from "@/lib/entry"
import { formatDate, formatSom } from "@/lib/format"
import { cn } from "@/lib/utils"
import { deleteEntry, updateEntry } from "./actions"
import { DEFAULT_PARAMS, hasFilters, memberName, PAGE_SIZE, toSearch, type OperationsParams } from "./params"

export type EntryRow = {
  id: string
  type: EntryType
  amount: number
  entry_date: string
  comment: string | null
  category_id: string
  category: { name: string } | null
  /** Who added it: a team member's name or «Бывший сотрудник». Empty for an employee. */
  author: string
  /** The owner changes any entry; an employee their own for 24 hours (the server decides). */
  editable: boolean
}

export type FilterCategory = { id: string; name: string; type: EntryType; is_hidden: boolean }
export type FilterMember = { user_id: string; display_name: string | null; email: string | null }

const TYPE_LABEL = { income: "Доход", expense: "Расход" } as const

// TanStack only keeps the state; with the manual flags the database does the filtering, sorting and paging.
const features = tableFeatures({ columnFilteringFeature, rowSortingFeature, rowPaginationFeature })
const helper = createColumnHelper<typeof features, EntryRow>()
const columns = helper.columns([
  helper.accessor("entry_date", {
    id: "date",
    header: "Дата",
    cell: (info) => <span className="whitespace-nowrap tabular-nums">{formatDate(info.getValue())}</span>,
  }),
  helper.accessor("type", {
    id: "type",
    header: "Тип",
    enableSorting: false,
    cell: (info) => <Badge variant={info.getValue()}>{TYPE_LABEL[info.getValue()]}</Badge>,
  }),
  helper.accessor("category_id", {
    id: "category",
    header: "Категория",
    enableSorting: false,
    cell: (info) => (
      <>
        {info.row.original.category?.name}
        {/* Below 1280px there is no room for «Кто внёс», so the name goes under the category. */}
        {info.row.original.author && (
          <span className="block max-w-48 truncate text-small text-muted-foreground xl:hidden">
            {info.row.original.author}
          </span>
        )}
      </>
    ),
  }),
  helper.accessor("comment", {
    id: "comment",
    header: "Комментарий",
    enableSorting: false,
    cell: (info) => <span className="line-clamp-2 text-muted-foreground">{info.getValue() || "—"}</span>,
  }),
  helper.accessor("author", {
    id: "author",
    header: "Кто внёс",
    enableSorting: false,
    cell: (info) => (
      <span className="block max-w-48 truncate" title={info.getValue()}>
        {info.getValue()}
      </span>
    ),
  }),
  helper.accessor("amount", {
    id: "amount",
    header: "Сумма",
    cell: (info) => <Money amount={info.getValue()} type={info.row.original.type} />,
  }),
])
// An employee sees only their own entries, so «Кто внёс» would always be them.
const employeeColumns = columns.filter((column) => column.id !== "author")

/** URL params ↔ TanStack column filters: the address stays the single source of truth. */
function toColumnFilters(params: OperationsParams): ColumnFiltersState {
  return [
    { id: "comment", value: params.q },
    { id: "date", value: [params.from, params.to] },
    { id: "type", value: params.type },
    { id: "category", value: params.category },
    { id: "author", value: params.author },
  ].filter((filter) => (Array.isArray(filter.value) ? filter.value.some(Boolean) : filter.value))
}

function fromColumnFilters(filters: ColumnFiltersState): Partial<OperationsParams> {
  const value = (id: string) => filters.find((filter) => filter.id === id)?.value
  const [from = "", to = ""] = (value("date") as [string, string] | undefined) ?? []
  return {
    q: (value("comment") as string | undefined) ?? "",
    from,
    to,
    type: (value("type") as OperationsParams["type"] | undefined) ?? "",
    category: (value("category") as string | undefined) ?? "",
    author: (value("author") as string | undefined) ?? "",
  }
}

export function OperationsView({
  rows,
  total,
  params,
  categories,
  members,
  isOwner,
  today,
}: {
  rows: EntryRow[]
  total: number
  params: OperationsParams
  categories: FilterCategory[]
  members: FilterMember[]
  isOwner: boolean
  today: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // The old rows stay on screen (dimmed) until the new page arrives.
  function navigate(patch: Partial<OperationsParams>) {
    startTransition(() => {
      router.replace(`/operations${toSearch({ ...params, ...patch })}`, { scroll: false })
    })
  }

  const sorting = useMemo<SortingState>(() => [{ id: params.sort, desc: params.dir === "desc" }], [params.sort, params.dir])
  const pagination = useMemo<PaginationState>(() => ({ pageIndex: params.page - 1, pageSize: PAGE_SIZE }), [params.page])
  const columnFilters = useMemo(() => toColumnFilters(params), [params])

  const table = useTable({
    features,
    columns: isOwner ? columns : employeeColumns,
    data: rows,
    getRowId: (row) => row.id,
    state: { sorting, pagination, columnFilters },
    manualFiltering: true,
    manualSorting: true,
    manualPagination: true,
    rowCount: total,
    sortDescFirst: true,
    enableSortingRemoval: false,
    onSortingChange: (updater) => {
      const [next] = functionalUpdate(updater, sorting)
      if (next) navigate({ sort: next.id as OperationsParams["sort"], dir: next.desc ? "desc" : "asc", page: 1 })
    },
    onPaginationChange: (updater) => navigate({ page: functionalUpdate(updater, pagination).pageIndex + 1 }),
    onColumnFiltersChange: (updater) => navigate({ ...fromColumnFilters(functionalUpdate(updater, columnFilters)), page: 1 }),
  })

  const [query, setQuery] = useState(params.q)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>(undefined)
  const setFilter = (id: string, value: unknown) => table.getColumn(id)?.setFilterValue(value)
  useEffect(() => () => clearTimeout(searchTimer.current), [])

  // Search waits for a pause in typing instead of loading on every letter.
  function changeQuery(value: string) {
    setQuery(value)
    clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => setFilter("comment", value.trim()), 400)
  }

  function resetFilters() {
    clearTimeout(searchTimer.current)
    setQuery("")
    navigate({ ...DEFAULT_PARAMS, sort: params.sort, dir: params.dir })
  }

  const filtered = hasFilters(params)
  const firstRow = (params.page - 1) * PAGE_SIZE + 1

  return (
    <div className="flex flex-col gap-4">
      <div
        className={cn(
          "grid grid-cols-2 items-end gap-x-2 gap-y-3 md:grid-cols-4",
          // The owner has one more filter, so one row needs a wider screen.
          isOwner
            ? "2xl:grid-cols-[minmax(12rem,1fr)_minmax(0,12rem)_repeat(4,minmax(0,10rem))_auto]"
            : "xl:grid-cols-[minmax(12rem,1fr)_repeat(4,minmax(0,10rem))_auto]"
        )}
      >
        <div className={cn("relative col-span-2", isOwner ? "md:col-span-3 2xl:col-span-1" : "md:col-span-4 xl:col-span-1")}>
          <Label htmlFor="search" className="sr-only">
            Поиск по комментарию
          </Label>
          <SearchIcon aria-hidden className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="search"
            type="search"
            placeholder="Поиск по комментарию"
            className="pl-10"
            value={query}
            onChange={(e) => changeQuery(e.target.value)}
          />
        </div>
        {isOwner && (
          <AuthorFilter value={params.author} members={members} onChange={(author) => setFilter("author", author)} />
        )}
        <DateFilter id="from" label="С" value={params.from} max={params.to || today} onChange={(from) => setFilter("date", [from, params.to])} />
        <DateFilter id="to" label="По" value={params.to} min={params.from} max={today} onChange={(to) => setFilter("date", [params.from, to])} />
        <TypeFilter value={params.type} onChange={(type) => table.setColumnFilters((old) => [
          ...old.filter((filter) => filter.id !== "type" && filter.id !== "category"),
          { id: "type", value: type },
        ])} />
        <CategoryFilter
          value={params.category}
          type={params.type}
          categories={categories}
          onChange={(category) => setFilter("category", category)}
        />
        {filtered && (
          <Button variant="ghost" className="col-span-2 md:col-span-1 xl:col-span-1" onClick={resetFilters}>
            Сбросить
          </Button>
        )}
      </div>

      {/* While the next page loads, the old rows stay dimmed under a «Загрузка…» badge. */}
      <div
        aria-busy={isPending}
        className={cn(
          "relative flex flex-col gap-4 *:transition-opacity",
          isPending && "*:not-[[role=status]]:opacity-60"
        )}
      >
        {isPending && (
          <div role="status" className="pointer-events-none absolute inset-x-0 top-6 z-10 flex justify-center">
            <span className="flex items-center gap-2 rounded-full border border-border bg-popover px-4 py-2 text-small font-medium shadow-popover">
              <Spinner />
              Загрузка…
            </span>
          </div>
        )}
        {total === 0 ? (
          <Card className="py-0">
            {filtered ? (
              <StateMessage
                variant="empty"
                icon={SearchXIcon}
                title="Ничего не найдено"
                description="Попробуйте изменить фильтры."
                action={<Button variant="outline" onClick={resetFilters}>Сбросить фильтры</Button>}
              />
            ) : (
              <StateMessage
                variant="empty"
                title="Записей пока нет"
                description="Добавьте первую: выручку или расход за сегодня."
                action={
                  <Button render={<Link href="/add" />} nativeButton={false}>
                    <PlusIcon />
                    Добавить запись
                  </Button>
                }
              />
            )}
          </Card>
        ) : (
          <>
            <Card className="hidden gap-0 overflow-hidden py-0 lg:flex">
              <Table>
                <TableHeader>
                  {table.getHeaderGroups().map((group) => (
                    <TableRow key={group.id}>
                      {group.headers.map((header) => {
                        const sorted = header.column.getIsSorted()
                        return (
                          <TableHead
                            key={header.id}
                            aria-sort={sorted ? (sorted === "asc" ? "ascending" : "descending") : undefined}
                            className={cn(
                              header.column.id === "amount" && "text-right",
                              // Below 1280px the sign and colour of the amount already show the type.
                              header.column.id === "type" && "hidden xl:table-cell",
                              header.column.id === "author" && "hidden xl:table-cell"
                            )}
                          >
                            {header.column.getCanSort() ? (
                              <SortButton
                                label={String(header.column.columnDef.header)}
                                sorted={sorted}
                                onClick={header.column.getToggleSortingHandler()}
                                alignEnd={header.column.id === "amount"}
                              />
                            ) : (
                              <table.FlexRender header={header} />
                            )}
                          </TableHead>
                        )
                      })}
                      <TableHead className="w-24">
                        <span className="sr-only">Действия</span>
                      </TableHead>
                    </TableRow>
                  ))}
                </TableHeader>
                <TableBody>
                  {table.getRowModel().rows.map((row) => (
                    <TableRow key={row.id}>
                      {row.getAllCells().map((cell) => (
                        <TableCell
                          key={cell.id}
                          className={cn(
                            cell.column.id === "amount" && "text-right",
                            cell.column.id === "comment" && "max-w-80 whitespace-normal",
                            cell.column.id === "type" && "hidden xl:table-cell",
                            cell.column.id === "author" && "hidden xl:table-cell"
                          )}
                        >
                          <table.FlexRender cell={cell} />
                        </TableCell>
                      ))}
                      <TableCell className="py-0">
                        <RowActions entry={row.original} categories={categories} isOwner={isOwner} today={today} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Card>

            <Card className="gap-0 py-0 lg:hidden">
              <ul className="divide-y divide-border">
                {rows.map((entry) => (
                  <li key={entry.id} className="flex items-start gap-2 py-3 pr-1 pl-4">
                    <div className="flex min-w-0 flex-1 flex-col gap-1">
                      <div className="flex items-baseline justify-between gap-3">
                        <span className="min-w-0 font-medium break-words">{entry.category?.name}</span>
                        <Money amount={entry.amount} type={entry.type} className="shrink-0 font-medium" />
                      </div>
                      <p className="text-small text-muted-foreground">
                        <span className="tabular-nums">{formatDate(entry.entry_date)}</span>
                        {isOwner && <span className="break-words"> · {entry.author}</span>}
                        {entry.comment && <span className="break-words"> · {entry.comment}</span>}
                      </p>
                    </div>
                    <RowActions entry={entry} categories={categories} isOwner={isOwner} today={today} />
                  </li>
                ))}
              </ul>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-small text-muted-foreground tabular-nums">
                {firstRow}–{firstRow + rows.length - 1} из {total}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Предыдущая страница"
                  disabled={!table.getCanPreviousPage()}
                  onClick={() => table.previousPage()}
                >
                  <ChevronLeftIcon className="size-5" />
                </Button>
                <span className="min-w-24 text-center text-small tabular-nums">
                  Стр. {params.page} из {table.getPageCount()}
                </span>
                <Button
                  variant="outline"
                  size="icon"
                  aria-label="Следующая страница"
                  disabled={!table.getCanNextPage()}
                  onClick={() => table.nextPage()}
                >
                  <ChevronRightIcon className="size-5" />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function SortButton({
  label,
  sorted,
  onClick,
  alignEnd,
}: {
  label: string
  sorted: false | "asc" | "desc"
  onClick: ((event: unknown) => void) | undefined
  alignEnd: boolean
}) {
  const Icon = sorted === "asc" ? ArrowUpIcon : sorted === "desc" ? ArrowDownIcon : ArrowUpDownIcon
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex min-h-row items-center gap-1 rounded-md font-medium outline-none hover:text-foreground focus-visible:ring-3 focus-visible:ring-ring/50",
        alignEnd && "flex-row-reverse"
      )}
    >
      {label}
      <Icon aria-hidden className={cn("size-4", !sorted && "text-subtle-foreground")} />
    </button>
  )
}

function DateFilter({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string
  label: string
  value: string
  min?: string
  max: string
  onChange: (value: string) => void
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id} className="text-small text-muted-foreground">
        {label}
      </Label>
      <Input id={id} type="date" value={value} min={min || undefined} max={max} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

const TYPE_ITEMS = [
  { value: null, label: "Все типы" },
  { value: "income", label: "Доходы" },
  { value: "expense", label: "Расходы" },
]

function TypeFilter({ value, onChange }: { value: OperationsParams["type"]; onChange: (value: string) => void }) {
  return (
    <Select items={TYPE_ITEMS} value={value || null} onValueChange={(next) => onChange((next as string | null) ?? "")}>
      <SelectTrigger aria-label="Тип" className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {TYPE_ITEMS.map((item) => (
          <SelectItem key={item.label} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function CategoryFilter({
  value,
  type,
  categories,
  onChange,
}: {
  value: string
  type: OperationsParams["type"]
  categories: FilterCategory[]
  onChange: (value: string) => void
}) {
  const label = (category: FilterCategory) => (category.is_hidden ? `${category.name} (скрыта)` : category.name)
  const items = [{ value: null, label: "Все категории" }, ...categories.map((c) => ({ value: c.id, label: label(c) }))]
  const groups = (["income", "expense"] as const)
    .filter((groupType) => !type || type === groupType)
    .map((groupType) => ({
      type: groupType,
      title: groupType === "income" ? "Доходы" : "Расходы",
      categories: categories.filter((category) => category.type === groupType),
    }))

  return (
    <Select items={items} value={value || null} onValueChange={(next) => onChange((next as string | null) ?? "")}>
      <SelectTrigger aria-label="Категория" className="w-full min-w-0">
        <SelectValue className="truncate" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={null}>Все категории</SelectItem>
        {groups.map((group) => (
          <SelectGroup key={group.type} className="border-t border-border first-of-type:border-t-0">
            <SelectLabel>{group.title}</SelectLabel>
            {group.categories.map((category) => (
              <SelectItem key={category.id} value={category.id} title={label(category)}>
                {label(category)}
              </SelectItem>
            ))}
          </SelectGroup>
        ))}
      </SelectContent>
    </Select>
  )
}

function AuthorFilter({
  value,
  members,
  onChange,
}: {
  value: string
  members: FilterMember[]
  onChange: (value: string) => void
}) {
  const items = [{ value: null, label: "Все сотрудники" }, ...members.map((m) => ({ value: m.user_id, label: memberName(m) }))]

  return (
    <Select items={items} value={value || null} onValueChange={(next) => onChange((next as string | null) ?? "")}>
      <SelectTrigger aria-label="Кто внёс" className="col-span-2 w-full min-w-0 md:col-span-1">
        <SelectValue className="truncate" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value ?? "all"} value={item.value} title={item.label}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RowActions({
  entry,
  categories,
  isOwner,
  today,
}: {
  entry: EntryRow
  categories: FilterCategory[]
  isOwner: boolean
  today: string
}) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  // A new key on every open remounts the form, so it starts from the saved entry.
  const [editKey, setEditKey] = useState(0)
  const [isPending, startTransition] = useTransition()
  const name = entry.category?.name ?? "запись"
  // A category hidden after the entry was made stays available for this entry only.
  const formCategories = categories.filter((category) => !category.is_hidden || category.id === entry.category_id)

  function confirmDelete() {
    startTransition(async () => {
      const result = await deleteEntry(entry.id)
      if (result.error) {
        toast.error(result.error)
        return
      }
      setIsDeleting(false)
      toast.success("Запись удалена")
    })
  }

  // Keeps the row height and column width the same as rows with buttons.
  if (!entry.editable) return <div aria-hidden className="w-22 shrink-0" />

  return (
    <div className="flex shrink-0 justify-end">
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Изменить «${name}» от ${formatDate(entry.entry_date)}`}
        title="Изменить"
        onClick={() => {
          setEditKey((key) => key + 1)
          setIsEditing(true)
        }}
      >
        <PencilIcon className="size-5 text-muted-foreground" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Удалить «${name}» от ${formatDate(entry.entry_date)}`}
        title="Удалить"
        onClick={() => setIsDeleting(true)}
      >
        <Trash2Icon className="size-5 text-muted-foreground" />
      </Button>

      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Изменить запись</DialogTitle>
          </DialogHeader>
          <EntryForm
            key={editKey}
            categories={formCategories}
            today={today}
            isOwner={isOwner}
            save={(values) => updateEntry(entry.id, values)}
            onSaved={() => setIsEditing(false)}
            onCancel={() => setIsEditing(false)}
            successMessage="Запись сохранена"
            defaultValues={{
              type: entry.type,
              amount: String(entry.amount),
              categoryId: entry.category_id,
              date: entry.entry_date,
              comment: entry.comment ?? "",
            }}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              {formatDate(entry.entry_date)} · {name} · {formatSom(entry.amount)}. Вернуть её будет нельзя.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose render={<Button variant="ghost" />}>Отмена</DialogClose>
            <Button variant="destructive" disabled={isPending} onClick={confirmDelete}>
              {isPending && <Spinner />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
