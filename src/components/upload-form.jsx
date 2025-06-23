// components/ui/upload-form.jsx
import { useState } from 'react'

export default function UploadForm({ onAuditComplete }) {
  const [file, setFile] = useState(null)
  const [target, setTarget] = useState('')
  const [features, setFeatures] = useState('')
  const [protectedAttr, setProtectedAttr] = useState('')
  const [email, setEmail] = useState('')
  const [userQuery, setUserQuery] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('file', file)
    formData.append('target', target)
    formData.append('features', features)
    formData.append('protected_attribute', protectedAttr)
    formData.append('email', email)
    formData.append('user_query', userQuery)

    const response = await fetch('http://127.0.0.1:8000/upload', {
      method: 'POST',
      body: formData
    })
    const data = await response.json()
    onAuditComplete(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <input type="file" onChange={e => setFile(e.target.files[0])} required />
      <input type="text" placeholder="Target column" onChange={e => setTarget(e.target.value)} required />
      <input type="text" placeholder="Features (comma-separated)" onChange={e => setFeatures(e.target.value)} required />
      <input type="text" placeholder="Protected attribute" onChange={e => setProtectedAttr(e.target.value)} required />
      <input type="email" placeholder="Your email" onChange={e => setEmail(e.target.value)} />
      <input type="text" placeholder="Optional question for the audit" onChange={e => setUserQuery(e.target.value)} />
      <button type="submit">Start Audit</button>
    </form>
  )
}
