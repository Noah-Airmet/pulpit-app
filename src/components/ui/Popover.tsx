import { useEffect, useRef, ReactNode } from 'react'

interface PopoverProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  trigger: ReactNode
  align?: 'left' | 'right'
}

export function Popover({ isOpen, onClose, children, trigger, align = 'left' }: PopoverProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  return (
    <div ref={containerRef} style={{ position: 'relative', display: 'inline-block' }}>
      {trigger}
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 0.5rem)',
            [align]: 0,
            zIndex: 100,
            minWidth: '200px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
            border: '1px solid var(--color-border-light)',
            padding: '1rem',
            animation: 'popover-in 0.2s cubic-bezier(0, 0, 0.2, 1)',
          }}
        >
          {children}
        </div>
      )}
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: translateY(-8px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>
    </div>
  )
}
