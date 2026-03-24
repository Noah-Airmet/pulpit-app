import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { TalkFormData } from '../../types'

const SOURCE_TYPES = [
  { value: 'original_manuscript',     label: 'Original Manuscript',     desc: 'Handwritten minutes or attendee notes' },
  { value: 'shorthand_transcription', label: 'Shorthand Transcription', desc: 'Transcribed from Pitman shorthand (JD, early Deseret News)' },
  { value: 'newspaper_report',        label: 'Newspaper Report',        desc: 'Published in Deseret News, Times and Seasons, Millennial Star' },
  { value: 'official_report',         label: 'Official Report',         desc: 'Official Conference Report series (1880, 1897+)' },
  { value: 'church_website',          label: 'Church Website',          desc: 'ChurchofJesusChrist.org (1971+)' },
  { value: 'compiled_transcription',  label: 'Compiled Transcription',  desc: 'From Watson or similar secondary compiler' },
]

const FIDELITY_OPTIONS = [
  { value: 'verbatim',       label: 'Verbatim',       desc: 'Faithfully represents what was said' },
  { value: 'near_verbatim',  label: 'Near Verbatim',  desc: 'Stenographic with minor editorial polish' },
  { value: 'edited',         label: 'Edited',         desc: 'Significant editorial changes from the original speech' },
  { value: 'summary',        label: 'Summary',        desc: 'Synopsis only — not a full transcript' },
  { value: 'reconstructed',  label: 'Reconstructed',  desc: 'Compiled from fragments, journals, or secondary accounts' },
  { value: 'normalized',     label: 'Normalized',     desc: 'Spelling and grammar modernized from the original' },
]

const inputStyle: React.CSSProperties = {
  fontFamily: 'var(--font-body)',
  fontSize: '0.9375rem',
  padding: '0.5rem 0.75rem',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  background: 'var(--color-paper)',
  color: 'var(--color-ink)',
  width: '100%',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle: React.CSSProperties = {
  fontFamily: 'var(--font-ui)',
  fontSize: '0.8125rem',
  fontWeight: 500,
  color: 'var(--color-ink-secondary)',
  display: 'block',
  marginBottom: '0.375rem',
}

const fieldStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 0,
}

function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <div style={fieldStyle}>
      <label style={labelStyle}>
        {label}{required && <span style={{ color: 'var(--color-accent)', marginLeft: 2 }}>*</span>}
      </label>
      {hint && (
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', color: 'var(--color-ink-tertiary)', marginBottom: '0.375rem' }}>
          {hint}
        </span>
      )}
      {children}
    </div>
  )
}

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{
      fontFamily: 'var(--font-display)',
      fontSize: '1.125rem',
      fontWeight: 600,
      color: 'var(--color-ink)',
      margin: '0 0 1rem',
      paddingBottom: '0.5rem',
      borderBottom: '1px solid var(--color-border-light)',
    }}>
      {children}
    </h3>
  )
}

interface Props {
  initialData?: Partial<TalkFormData>
  defaultDate?: string
  conference: string
  rejectionNotes?: string | null
  onSave: (data: TalkFormData) => Promise<{ error?: string }>
  onSaveAndAnother?: (data: TalkFormData) => Promise<{ error?: string }>
  isSaving: boolean
}

const EMPTY_FORM: TalkFormData = {
  speaker: '',
  talk_date: '',
  session_label: '',
  source_title: '',
  source_url: '',
  source_type: '',
  fidelity: '',
  fidelity_notes: '',
  transcript_text: '',
  notes: '',
}

export function TalkEditorForm({
  initialData,
  defaultDate,
  conference,
  rejectionNotes,
  onSave,
  onSaveAndAnother,
  isSaving,
}: Props) {
  const [form, setForm] = useState<TalkFormData>({
    ...EMPTY_FORM,
    talk_date: defaultDate ?? '',
    ...initialData,
  })
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')
  const [error, setError] = useState('')

  function set<K extends keyof TalkFormData>(key: K, value: string) {
    setForm(f => ({ ...f, [key]: value }))
  }

  function validate(): string | null {
    if (!form.speaker.trim()) return 'Speaker name is required.'
    if (!form.talk_date) return 'Date is required.'
    if (!form.source_title.trim()) return 'Source title is required.'
    if (!form.source_type) return 'Source type is required.'
    if (!form.fidelity) return 'Fidelity is required.'
    return null
  }

  async function handleSave() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    const result = await onSave(form)
    if (result.error) setError(result.error)
  }

  async function handleSaveAndAnother() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    if (!onSaveAndAnother) return
    const result = await onSaveAndAnother(form)
    if (result.error) { setError(result.error); return }
    setForm({ ...EMPTY_FORM, talk_date: form.talk_date, session_label: form.session_label })
  }

  const wordCount = form.transcript_text.trim()
    ? form.transcript_text.trim().split(/\s+/).length
    : 0

  return (
    <div>
      {/* Rejection notes banner */}
      {rejectionNotes && (
        <div style={{
          background: '#fff8f0',
          border: '1px solid var(--color-difficulty-hard)',
          borderLeft: '4px solid var(--color-difficulty-hard)',
          borderRadius: 4,
          padding: '0.875rem 1rem',
          marginBottom: '1.5rem',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.8125rem', fontWeight: 500, color: '#c17817', margin: '0 0 0.25rem' }}>
            Returned for revision
          </p>
          <p style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-ink)', margin: 0, lineHeight: 1.6 }}>
            {rejectionNotes}
          </p>
        </div>
      )}

      {/* Tab bar */}
      <div style={{ display: 'flex', borderBottom: '1px solid var(--color-border)', marginBottom: '1.5rem' }}>
        {(['edit', 'preview'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '0.875rem',
              fontWeight: tab === t ? 500 : 400,
              padding: '0.5rem 1.25rem',
              border: 'none',
              background: 'none',
              cursor: 'pointer',
              color: tab === t ? 'var(--color-accent)' : 'var(--color-ink-tertiary)',
              borderBottom: `2px solid ${tab === t ? 'var(--color-accent)' : 'transparent'}`,
              marginBottom: -1,
              transition: 'color 0.15s',
            }}
          >
            {t === 'edit' ? 'Edit' : 'Preview'}
          </button>
        ))}
      </div>

      {tab === 'preview' ? (
        <div style={{ minHeight: 300 }}>
          <div style={{
            background: 'var(--color-paper-warm)',
            border: '1px solid var(--color-border)',
            borderRadius: 6,
            padding: '1.25rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem 2rem' }}>
              {[
                ['Speaker', form.speaker],
                ['Date', form.talk_date],
                ['Conference', conference],
                ['Session', form.session_label || '—'],
                ['Source', form.source_title],
                ['Source type', form.source_type || '—'],
                ['Fidelity', form.fidelity || '—'],
              ].map(([k, v]) => (
                <div key={k}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--color-ink-tertiary)' }}>{k}</span>
                  <div style={{ fontFamily: 'var(--font-body)', fontSize: '0.9375rem', color: 'var(--color-ink)' }}>{v}</div>
                </div>
              ))}
            </div>
          </div>
          {form.transcript_text ? (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.transcript_text}</ReactMarkdown>
            </div>
          ) : (
            <p style={{ fontFamily: 'var(--font-body)', fontStyle: 'italic', color: 'var(--color-ink-tertiary)' }}>
              No transcript text entered yet.
            </p>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* Section 1: Identification */}
          <div>
            <SectionHeading>Identification</SectionHeading>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <Field label="Speaker" required>
                <input type="text" value={form.speaker} onChange={e => set('speaker', e.target.value)} placeholder="e.g. Brigham Young" style={inputStyle} />
              </Field>
              <Field label="Date" required>
                <input type="date" value={form.talk_date} onChange={e => set('talk_date', e.target.value)} style={inputStyle} />
              </Field>
              <Field label="Conference">
                <input type="text" value={conference} disabled style={{ ...inputStyle, color: 'var(--color-ink-tertiary)', cursor: 'default' }} />
              </Field>
              <Field label="Session label" hint="e.g. Saturday Morning, Priesthood">
                <input type="text" value={form.session_label} onChange={e => set('session_label', e.target.value)} placeholder="optional" style={inputStyle} />
              </Field>
            </div>
          </div>

          {/* Section 2: Source & Provenance */}
          <div>
            <SectionHeading>Source & Provenance</SectionHeading>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Source title" required hint="e.g. Journal of Discourses, Vol. 1">
                  <input type="text" value={form.source_title} onChange={e => set('source_title', e.target.value)} style={inputStyle} />
                </Field>
                <Field label="Source URL">
                  <input type="url" value={form.source_url} onChange={e => set('source_url', e.target.value)} placeholder="https://…" style={inputStyle} />
                </Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <Field label="Source type" required>
                  <select value={form.source_type} onChange={e => set('source_type', e.target.value)} style={inputStyle}>
                    <option value="">Select…</option>
                    {SOURCE_TYPES.map(o => (
                      <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Fidelity" required>
                  <select value={form.fidelity} onChange={e => set('fidelity', e.target.value)} style={inputStyle}>
                    <option value="">Select…</option>
                    {FIDELITY_OPTIONS.map(o => (
                      <option key={o.value} value={o.value}>{o.label} — {o.desc}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <Field label="Fidelity notes" hint="Optional: explain the source quality, known editorial changes, relevant scholarship">
                <textarea value={form.fidelity_notes} onChange={e => set('fidelity_notes', e.target.value)} rows={2} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
              </Field>
            </div>
          </div>

          {/* Section 3: Transcript */}
          <div>
            <SectionHeading>Transcript</SectionHeading>
            <Field label="Talk text" hint="Paste the full text. Preserve paragraph breaks. Mark uncertain readings [?] and illegible passages [illegible].">
              <textarea
                value={form.transcript_text}
                onChange={e => set('transcript_text', e.target.value)}
                rows={20}
                style={{
                  ...inputStyle,
                  fontFamily: 'var(--font-body)',
                  fontSize: '1rem',
                  lineHeight: 1.7,
                  resize: 'vertical',
                }}
              />
            </Field>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.75rem', color: 'var(--color-ink-tertiary)', marginTop: '0.375rem', textAlign: 'right' }}>
              {wordCount.toLocaleString()} words
            </div>
          </div>

          {/* Section 4: Notes */}
          <div>
            <SectionHeading>Notes</SectionHeading>
            <Field label="Notes" hint="Problems encountered, gaps in the record, anything a reviewer should know">
              <textarea value={form.notes} onChange={e => set('notes', e.target.value)} rows={3} style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }} />
            </Field>
          </div>
        </div>
      )}

      {error && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '0.875rem', color: '#c17817', marginTop: '1rem' }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', justifyContent: 'flex-end' }}>
        {onSaveAndAnother && (
          <button
            onClick={handleSaveAndAnother}
            disabled={isSaving}
            style={{
              fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 400,
              padding: '0.5625rem 1.25rem', borderRadius: 4,
              border: '1px solid var(--color-accent)', background: 'transparent',
              color: 'var(--color-accent)', cursor: isSaving ? 'wait' : 'pointer',
              opacity: isSaving ? 0.6 : 1,
            }}
          >
            Save & Add Another
          </button>
        )}
        <button
          onClick={handleSave}
          disabled={isSaving}
          style={{
            fontFamily: 'var(--font-ui)', fontSize: '0.875rem', fontWeight: 500,
            padding: '0.5625rem 1.5rem', borderRadius: 4, border: 'none',
            background: 'var(--color-accent)', color: 'white',
            cursor: isSaving ? 'wait' : 'pointer', opacity: isSaving ? 0.6 : 1,
            transition: 'background 0.15s',
          }}
          onMouseEnter={e => { if (!isSaving) e.currentTarget.style.background = 'var(--color-accent-hover)' }}
          onMouseLeave={e => { e.currentTarget.style.background = 'var(--color-accent)' }}
        >
          {isSaving ? 'Saving…' : 'Save Draft'}
        </button>
      </div>
    </div>
  )
}
