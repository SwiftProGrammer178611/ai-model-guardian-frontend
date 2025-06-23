import { useState, useRef } from 'react'
import { Button } from './components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card.jsx'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select.jsx'
import { Badge } from './components/ui/badge.jsx'
import { Alert, AlertDescription } from './components/ui/alert.jsx'
import { EventSourcePolyfill } from 'event-source-polyfill';

import {
  Loader2, Shield, Brain, BarChart3, Download, AlertTriangle,
  CheckCircle, Activity, TrendingUp, Eye, Database, FileUp, Mail, User
} from 'lucide-react'
import './App.css'

function App() {
  const [selectedDataset, setSelectedDataset] = useState('')
  const [auditResults, setAuditResults] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [csvFile, setCsvFile] = useState(null)
  const [targetColumn, setTargetColumn] = useState('')
  const [protectedAttribute, setProtectedAttribute] = useState('')
  const [email, setEmail] = useState('')
  const [streamLogs, setStreamLogs] = useState('')
  const streamRef = useRef(null)

  const datasets = [
    { value: 'adult', label: 'Adult Income Dataset', description: 'Predict income levels based on demographic data', icon: <TrendingUp className="h-4 w-4" /> },
    { value: 'compas', label: 'COMPAS Recidivism Dataset', description: 'Predict criminal recidivism risk', icon: <Shield className="h-4 w-4" /> },
    { value: 'german_credit', label: 'German Credit Dataset', description: 'Assess credit risk for loan applications', icon: <BarChart3 className="h-4 w-4" /> }
  ]

  const downloadProjectFiles = () => {
    const link = document.createElement('a')
    link.href = '/ai-model-guardian.tar.gz'
    link.download = 'ai-model-guardian.tar.gz'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const runPredefinedAudit = async () => {
    if (!selectedDataset) return
    setIsLoading(true)
    setError(null)
    setAuditResults(null)

    try {
      const res = await fetch(`http://127.0.0.1:8000/audit/${selectedDataset}`, { method: 'POST' })
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`)
      const data = await res.json()
      setAuditResults(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  const runCSVUploadAudit = async () => {
    if (!csvFile || !targetColumn || !protectedAttribute || !email) {
      setError("Please fill all fields and upload a CSV.")
      return
    }

    setIsLoading(true)
    setAuditResults(null)
    setStreamLogs('')
    setError(null)

    const formData = new FormData()
    formData.append("file", csvFile)
    formData.append("target", targetColumn)
    formData.append("protected_attribute", protectedAttribute)
    formData.append("user_email", email)

    try {
      // POST upload and get job_id in response JSON
      const uploadResponse = await fetch("http://127.0.0.1:8000/upload", {
        method: "POST",
        body: formData,
      })
      if (!uploadResponse.ok) {
        throw new Error(`Upload failed with status ${uploadResponse.status}`)
      }
      const uploadData = await uploadResponse.json()
      const jobId = uploadData.job_id
      if (!jobId) {
        throw new Error("No job_id received from server")
      }

      // Open EventSource connection to stream audit progress
      const eventSource = new EventSourcePolyfill(`http://127.0.0.1:8000/upload/stream/${jobId}`)

      eventSource.onmessage = (event) => {
        const text = event.data
        setStreamLogs((prev) => prev + "\n" + text)
        // Optionally, parse JSON messages here to update auditResults live
      }

      eventSource.onerror = (e) => {
        setError("Streaming error. See console.")
        eventSource.close()
        setIsLoading(false)
      }

      eventSource.onopen = () => {
        console.log("Streaming started.")
      }

      streamRef.current = eventSource
    } catch (err) {
      setError(err.message)
      setIsLoading(false)
    }
  }

  const renderMetricCard = (title, data, icon, color = "blue") => (
    <Card className={`h-full bg-white shadow-md border-l-4 border-${color}-500`}>
      <CardHeader className="flex flex-row items-center space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <div className={`p-2 rounded-lg bg-${color}-100 text-${color}-600`}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {Object.entries(data || {}).map(([key, value]) => (
            <div key={key} className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground capitalize">{key.replace(/_/g, ' ')}</span>
              <Badge variant="outline" className="font-mono">
                {typeof value === 'number' ? value.toFixed(4) : String(value)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 to-purple-700 text-white py-16 text-center">
        <div className="container mx-auto px-4">
          <div className="flex justify-center items-center gap-4 mb-4">
            <Shield className="h-8 w-8" />
            <h1 className="text-5xl font-bold">AI Model Guardian</h1>
          </div>
          <p className="text-xl">Responsible AI Auditing Platform</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
            <Badge className="bg-white/20 border-white">Bias Detection</Badge>
            <Badge className="bg-white/20 border-white">SHAP Explainability</Badge>
            <Badge className="bg-white/20 border-white">Audit Stream</Badge>
          </div>
          <Button onClick={downloadProjectFiles} className="mt-6 bg-white text-blue-700 hover:bg-blue-100">
            <Download className="h-5 w-5 mr-2" />
            Download Project
          </Button>
        </div>
      </div>

      <div className="container mx-auto py-12 px-4 grid grid-cols-1 lg:grid-cols-2 gap-10">
        {/* Dropdown audit */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center"><Brain className="h-5 w-5" /> Dataset Audit</CardTitle>
            <CardDescription>Select a built-in dataset to audit.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedDataset} onValueChange={setSelectedDataset}>
              <SelectTrigger className="h-12 text-base"><SelectValue placeholder="Choose dataset..." /></SelectTrigger>
              <SelectContent>
                {datasets.map(ds => (
                  <SelectItem key={ds.value} value={ds.value}>
                    <div className="flex items-center gap-3">{ds.icon}<span>{ds.label}</span></div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={runPredefinedAudit}
              disabled={!selectedDataset || isLoading}
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white"
            >
              {isLoading ? <><Loader2 className="animate-spin mr-2" /> Running...</> : <>Run Audit</>}
            </Button>
          </CardContent>
        </Card>

        {/* CSV Upload */}
        <Card>
          <CardHeader>
            <CardTitle className="flex gap-2 items-center"><FileUp className="h-5 w-5" /> Upload CSV</CardTitle>
            <CardDescription>Upload your dataset and receive real-time audit feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
            <input className="w-full p-2 border rounded" placeholder="Target column" value={targetColumn} onChange={(e) => setTargetColumn(e.target.value)} />
            <input className="w-full p-2 border rounded" placeholder="Protected attribute" value={protectedAttribute} onChange={(e) => setProtectedAttribute(e.target.value)} />
            <input className="w-full p-2 border rounded" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Button onClick={runCSVUploadAudit} className="w-full h-12 bg-indigo-600 text-white">
              {isLoading ? <><Loader2 className="animate-spin mr-2" /> Auditing...</> : <>Upload + Stream Audit</>}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Alert className="mx-4 mb-8 border-red-300 bg-red-100">
          <AlertTriangle className="h-5 w-5 text-red-700" />
          <AlertDescription className="text-red-700">Error: {error}</AlertDescription>
        </Alert>
      )}

      {/* Stream Logs */}
      {streamLogs && (
        <Card className="mx-4 mb-8 p-4 whitespace-pre-wrap font-mono text-sm bg-gray-100 border border-blue-300">
          <strong className="text-blue-700 block mb-2">Audit Stream Logs:</strong>
          {streamLogs}
        </Card>
      )}

      {/* Results */}
      {auditResults && (
        <div className="container mx-auto px-4 space-y-10">
          <div className="flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-600" />
            <h2 className="text-2xl font-semibold">Audit Results</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {auditResults.audit_results?.data_quality &&
              renderMetricCard("Data Quality", auditResults.audit_results.data_quality.missing_percent, <Database className="h-4 w-4" />, "green")}
            {auditResults.audit_results?.initial_bias &&
              renderMetricCard("Initial Bias", auditResults.audit_results.initial_bias, <AlertTriangle className="h-4 w-4" />, "orange")}
            {auditResults.audit_results?.model &&
              renderMetricCard("Model", { accuracy: auditResults.audit_results.model.accuracy }, <Brain className="h-4 w-4" />, "purple")}
          </div>
        </div>
      )}
    </div>
  )
}

export default App
