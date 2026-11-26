"use client"

import { useState, useEffect, useRef } from "react"
import { Search, X } from "lucide-react"
import { cn } from "@/lib/utils"

interface SearchBarProps {
  value: string
  onSearch: (query: string) => void
  className?: string
}

export function SearchBar({ value, onSearch, className }: SearchBarProps) {
  const [draft, setDraft] = useState(value)
  const [lastUrlValue, setLastUrlValue] = useState(value)
  const inputRef = useRef<HTMLInputElement>(null)

  if (lastUrlValue !== value) {
    setLastUrlValue(value)
    setDraft(value)
  }

  useEffect(() => {
    if (draft === value) return

    const timeout = setTimeout(() => onSearch(draft.trim()), 300)
    return () => clearTimeout(timeout)
  }, [draft, value, onSearch])

  return (
    <div className={cn("relative", className)}>
      <label htmlFor="history-search" className="sr-only">Search entries</label>
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      <input
        ref={inputRef}
        id="history-search"
        type="search"
        placeholder="Search moods, activities, reflections, weather..."
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter") onSearch(draft.trim())
        }}
        className="min-h-11 w-full rounded-lg border border-border bg-background pr-12 pl-9 text-sm outline-none placeholder:text-muted-foreground focus:border-ring focus:ring-1 focus:ring-ring"
      />
      {draft && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => {
            setDraft("")
            onSearch("")
            inputRef.current?.focus()
          }}
          className="absolute right-0 top-0 flex size-11 items-center justify-center text-muted-foreground hover:text-foreground"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
