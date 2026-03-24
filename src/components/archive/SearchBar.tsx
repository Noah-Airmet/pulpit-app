import { useState, useEffect, useRef } from 'react'

interface Props {
  value: string
  onChange: (value: string) => void
  debounceMs?: number
}

export function SearchBar({ value, onChange, debounceMs = 300 }: Props) {
  const [localValue, setLocalValue] = useState(value)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setLocalValue(value)
  }, [value])

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [])

  function handleChange(v: string) {
    setLocalValue(v)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => onChange(v), debounceMs)
  }

  return (
    <input
      type="text"
      value={localValue}
      onChange={e => handleChange(e.target.value)}
      placeholder="Search talks by keyword, speaker, or topic..."
      style={{
        fontFamily: 'var(--font-body)',
        fontSize: '1.125rem',
        padding: '0.875rem 1.25rem',
        border: '1px solid var(--color-border)',
        borderRadius: 8,
        background: 'white',
        color: 'var(--color-ink)',
        width: '100%',
        outline: 'none',
        boxShadow: 'var(--shadow-sm)',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
      }}
      onFocus={e => {
        e.currentTarget.style.borderColor = 'var(--color-accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-md)'
      }}
      onBlur={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)'
        e.currentTarget.style.boxShadow = 'var(--shadow-sm)'
      }}
    />
  )
}
