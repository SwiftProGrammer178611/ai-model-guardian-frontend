// components/ui/stream-logger.jsx
import { useEffect, useState } from 'react'

export default function StreamLogger() {
  const [logs, setLogs] = useState([])

  useEffect(() => {
    const eventSource = new EventSource('http://127.0.0.1:8000/stream')
    eventSource.onmessage = e => setLogs(prev => [...prev, e.data])
    return () => eventSource.close()
  }, [])

  return (
    <div className="bg-black text-green-400 p-4 rounded-lg h-48 overflow-y-scroll">
      <h4 className="font-bold mb-2">📡 Audit Progress</h4>
      {logs.map((log, i) => (
        <div key={i}>{log}</div>
      ))}
    </div>
  )
}
