// components/ui/reviewer-panel.jsx
import { useState } from 'react'

export default function ReviewerPanel() {
  const [annotation, setAnnotation] = useState('')
  const [status, setStatus] = useState(null)

  const approve = async () => {
    const res = await fetch('http://127.0.0.1:8000/approve', { method: 'POST' })
    const data = await res.json()
    setStatus(data.review_status)
  }

  const annotate = async () => {
    const res = await fetch('http://127.0.0.1:8000/annotate', {
      method: 'POST',
      body: new URLSearchParams({ annotation }),
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    })
    const data = await res.json()
    setStatus(data.annotation)
  }

  return (
    <div className="space-y-3 mt-4">
      <textarea value={annotation} onChange={e => setAnnotation(e.target.value)} placeholder="Add annotation..." />
      <div className="flex gap-2">
        <button onClick={approve}>✅ Approve</button>
        <button onClick={annotate}>✏️ Annotate</button>
      </div>
      {status && <div>Status: {status}</div>}
    </div>
  )
}
