'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

const COLORS = ['#c9a84c', '#e8c97a', '#a07c30', '#f5e0a0', '#7a5c1e', '#d4b060', '#8b6914']

function countField(data, field) {
  const counts = {}
  data.forEach(row => {
    const val = row[field]
    if (Array.isArray(val)) {
      val.forEach(v => { if (v && v !== '__other__') counts[v] = (counts[v] || 0) + 1 })
    } else if (val && val !== '__other__') {
      counts[val] = (counts[val] || 0) + 1
    }
  })
  return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a,b) => b.value - a.value)
}

function StatCard({ label, value }) {
  return (
    <div className="section-card text-center">
      <div className="text-3xl font-bold gold-accent">{value}</div>
      <div className="text-xs text-gray-400 mt-1">{label}</div>
    </div>
  )
}

function ChartSection({ title, data }) {
  if (!data || data.length === 0) return null
  return (
    <div className="section-card mb-4">
      <h3 className="text-sm font-bold text-gray-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={Math.max(120, data.length * 44)}>
        <BarChart data={data} layout="vertical" margin={{ left: 8, right: 24, top: 0, bottom: 0 }}>
          <XAxis type="number" tick={{ fill: '#6e7681', fontSize: 11 }} />
          <YAxis type="category" dataKey="name" tick={{ fill: '#adbac7', fontSize: 11 }} width={180} />
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', fontSize: 12 }} />
          <Bar dataKey="value" radius={[0, 4, 4, 0]}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function PieSection({ title, data }) {
  if (!data || data.length === 0) return null
  return (
    <div className="section-card mb-4">
      <h3 className="text-sm font-bold text-gray-200 mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={240}>
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} (${(percent*100).toFixed(0)}%)`} labelLine={false} fontSize={10}>
            {data.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={{ background: '#161b22', border: '1px solid #30363d', color: '#e6edf3', fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}

export default function ResultsPage() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [authed, setAuthed] = useState(false)
  const [passwordInput, setPasswordInput] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [filterSchool, setFilterSchool] = useState('All')
  const [filterYear, setFilterYear] = useState('All')

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionStorage.getItem('results_authed') === '1') {
      setAuthed(true)
    }
  }, [])

  useEffect(() => {
    if (!authed) return
    fetch('/api/responses')
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data || [])
        else setError('Failed to load data')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [authed])

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    setPasswordError('')
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: passwordInput }),
      })
      if (res.ok) {
        sessionStorage.setItem('results_authed', '1')
        setAuthed(true)
      } else {
        setPasswordError('Incorrect password. Try again.')
      }
    } catch {
      setPasswordError('Network error. Please try again.')
    }
  }

  if (!authed) return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="section-card w-full max-w-sm text-center">
        <div className="text-4xl mb-4">🔒</div>
        <h2 className="text-xl font-bold gold-accent mb-2">Results Dashboard</h2>
        <p className="text-gray-400 text-sm mb-6">This page is password protected.</p>
        <form onSubmit={handlePasswordSubmit} className="space-y-3">
          <input
            type="password"
            className="other-input text-center"
            placeholder="Enter password"
            value={passwordInput}
            onChange={e => { setPasswordInput(e.target.value); setPasswordError('') }}
            autoFocus
          />
          {passwordError && <p className="text-red-400 text-xs">{passwordError}</p>}
          <button type="submit" className="btn-primary w-full">Unlock →</button>
        </form>
        <div className="mt-4">
          <Link href="/" className="text-xs text-gray-600 hover:text-gray-400 transition-colors">← Back to Survey</Link>
        </div>
      </div>
    </div>
  )

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-gray-400 text-sm">Loading results...</div>
    </div>
  )

  if (error) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-red-400 text-sm">{error}</div>
    </div>
  )

  if (data.length === 0) return (
    <div className="min-h-screen flex items-center justify-center text-center p-6">
      <div>
        <div className="text-5xl mb-4">📭</div>
        <h2 className="text-xl font-bold gold-accent mb-2">No responses yet</h2>
        <p className="text-gray-400 text-sm mb-6">Share the survey to start collecting data!</p>
        <Link href="/" className="btn-primary" style={{display:'inline-block', textDecoration:'none'}}>← Go to Survey</Link>
      </div>
    </div>
  )

  const allSchools = [...new Set(data.flatMap(r => Array.isArray(r.school) ? r.school : [r.school]).filter(Boolean))].sort()
  const allYears = [...new Set(data.map(r => r.year_taken).filter(Boolean))].sort((a, b) => b - a)

  const filteredData = data.filter(r => {
    const schoolOk = filterSchool === 'All' || (Array.isArray(r.school) ? r.school.includes(filterSchool) : r.school === filterSchool)
    const yearOk = filterYear === 'All' || r.year_taken === filterYear
    return schoolOk && yearOk
  })

  const exportJSON = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'cet-survey-responses.json'; a.click()
    URL.revokeObjectURL(url)
  }

  const exportCSV = () => {
    if (data.length === 0) return
    const keys = Object.keys(data[0])
    const csv = [
      keys.join(','),
      ...data.map(row =>
        keys.map(k => {
          const v = row[k]
          const str = Array.isArray(v) ? v.join('; ') : (v ?? '')
          return `"${String(str).replace(/"/g, '""')}"`
        }).join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'cet-survey-responses.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const schools = countField(filteredData, 'school')
  const years = countField(filteredData, 'year_taken')
  const courses = countField(filteredData, 'course')
  const subjects = countField(filteredData, 'subjects')
  const mathTopics = countField(filteredData, 'math_topics')
  const englishTopics = countField(filteredData, 'english_topics')
  const scienceTopics = countField(filteredData, 'science_topics')
  const logicTopics = countField(filteredData, 'logic_topics')
  const hardest = countField(filteredData, 'hardest_part')
  const easiest = countField(filteredData, 'easiest_part')
  const reviewMethods = countField(filteredData, 'review_method')
  const features = countField(filteredData, 'wanted_features')
  const wouldUse = countField(filteredData, 'would_use')
  const reviewerAvail = countField(filteredData, 'reviewer_available')

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
          <div>
            <p className="text-xs uppercase tracking-widest gold-accent mb-1">Survey Analytics</p>
            <h1 className="text-2xl font-display font-bold">Results Dashboard</h1>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={exportCSV} className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-2 rounded-lg transition-colors">⬇ CSV</button>
            <button onClick={exportJSON} className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-2 rounded-lg transition-colors">⬇ JSON</button>
            <button onClick={() => { sessionStorage.removeItem('results_authed'); setAuthed(false) }} className="text-xs text-gray-400 hover:text-red-400 border border-gray-700 px-3 py-2 rounded-lg transition-colors">🔒 Lock</button>
            <Link href="/" className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-2 rounded-lg transition-colors">← Survey</Link>
          </div>
        </div>

        {/* Filters */}
        <div className="section-card mb-6">
          <div className="flex flex-wrap gap-4 items-center">
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-widest">Filter</span>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">School</label>
              <select value={filterSchool} onChange={e => setFilterSchool(e.target.value)} className="other-input py-1 px-2 text-xs" style={{width:'auto'}}>
                <option>All</option>
                {allSchools.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-gray-500">Year</label>
              <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="other-input py-1 px-2 text-xs" style={{width:'auto'}}>
                <option>All</option>
                {allYears.map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
            {(filterSchool !== 'All' || filterYear !== 'All') && (
              <button onClick={() => { setFilterSchool('All'); setFilterYear('All') }} className="text-xs text-yellow-600 hover:text-yellow-400 transition-colors">✕ Clear</button>
            )}
            <span className="ml-auto text-xs text-gray-600">{filteredData.length} of {data.length} responses</span>
          </div>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Responses" value={filteredData.length} />
          <StatCard label="Schools Covered" value={schools.length} />
          <StatCard label="Subjects Tracked" value={subjects.length} />
        </div>

        {/* Charts */}
        <ChartSection title="🏫 Schools Represented" data={schools} />
        <PieSection title="📅 Year Taken" data={years} />
        <ChartSection title="📚 Courses Applied For" data={courses} />
        <ChartSection title="📖 Subjects Included in Exam" data={subjects} />
        <ChartSection title="➕ Math Topics" data={mathTopics} />
        <ChartSection title="📝 English Topics" data={englishTopics} />
        <ChartSection title="🔬 Science Topics" data={scienceTopics} />
        <ChartSection title="🧩 Logic / Reasoning Topics" data={logicTopics} />
        <ChartSection title="😰 Hardest Part" data={hardest} />
        <ChartSection title="😊 Easiest Part" data={easiest} />
        <ChartSection title="📱 How They Reviewed" data={reviewMethods} />
        <PieSection title="🔍 Was a Reviewer Available?" data={reviewerAvail} />
        <ChartSection title="✨ Wanted App Features" data={features} />
        <PieSection title="🤔 Would They Use the App?" data={wouldUse} />

        {/* Recent Suggestions */}
        {filteredData.some(r => r.suggestions) && (
          <div className="section-card">
            <h3 className="text-sm font-bold text-gray-200 mb-4">💬 Recent Suggestions</h3>
            <div className="space-y-3">
              {filteredData.filter(r => r.suggestions).slice(0, 10).map((r, i) => (
                <div key={i} className="border-l-2 border-yellow-700 pl-4 py-1">
                  <p className="text-sm text-gray-300 italic">"{r.suggestions}"</p>
                  <p className="text-xs text-gray-600 mt-1">{Array.isArray(r.school) ? r.school.join(', ') : r.school} · {r.year_taken}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
