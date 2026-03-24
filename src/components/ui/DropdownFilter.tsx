import { useState, ReactNode } from 'react'
import { Popover } from './Popover'

interface DropdownFilterProps {
  label: string
  activeCount?: number
  children: ReactNode
  align?: 'left' | 'right'
}

export function DropdownFilter({ label, activeCount, children, align = 'left' }: DropdownFilterProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Popover
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      align={align}
      trigger={
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontFamily: 'var(--font-ui)',
            fontSize: '0.8125rem',
            fontWeight: activeCount && activeCount > 0 ? 600 : 400,
            padding: '0.5rem 0.875rem',
            borderRadius: '8px',
            border: '1px solid var(--color-border)',
            background: activeCount && activeCount > 0 ? 'var(--color-ink-faint)' : 'white',
            color: activeCount && activeCount > 0 ? 'var(--color-ink)' : 'var(--color-ink-secondary)',
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {label}
          {activeCount && activeCount > 0 ? (
            <span
              style={{
                background: 'var(--color-accent)',
                color: 'white',
                fontSize: '0.6875rem',
                padding: '0.125rem 0.375rem',
                borderRadius: '99px',
                minWidth: '1.25rem',
              }}
            >
              {activeCount}
            </span>
          ) : (
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{
                transition: 'transform 0.2s ease',
                transform: isOpen ? 'rotate(180deg)' : 'none',
              }}
            >
              <path
                d="M1 1L5 5L9 1"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
      }
    >
      <div onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </Popover>
  )
}
