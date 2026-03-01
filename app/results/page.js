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

  useEffect(() => {
    fetch('/api/responses')
      .then(r => r.json())
      .then(res => {
        if (res.success) setData(res.data || [])
        else setError('Failed to load data')
      })
      .catch(() => setError('Network error'))
      .finally(() => setLoading(false))
  }, [])

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

  const schools = countField(data, 'school')
  const years = countField(data, 'year_taken')
  const courses = countField(data, 'course')
  const subjects = countField(data, 'subjects')
  const mathTopics = countField(data, 'math_topics')
  const englishTopics = countField(data, 'english_topics')
  const scienceTopics = countField(data, 'science_topics')
  const logicTopics = countField(data, 'logic_topics')
  const hardest = countField(data, 'hardest_part')
  const easiest = countField(data, 'easiest_part')
  const reviewMethods = countField(data, 'review_method')
  const features = countField(data, 'wanted_features')
  const wouldUse = countField(data, 'would_use')
  const reviewerAvail = countField(data, 'reviewer_available')

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="text-xs uppercase tracking-widest gold-accent mb-1">Survey Analytics</p>
            <h1 className="text-2xl font-display font-bold">Results Dashboard</h1>
          </div>
          <Link href="/" className="text-xs text-gray-400 hover:text-gray-200 border border-gray-700 px-3 py-2 rounded-lg transition-colors">← Back to Survey</Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <StatCard label="Total Responses" value={data.length} />
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
        {data.some(r => r.suggestions) && (
          <div className="section-card">
            <h3 className="text-sm font-bold text-gray-200 mb-4">💬 Recent Suggestions</h3>
            <div className="space-y-3">
              {data.filter(r => r.suggestions).slice(0, 10).map((r, i) => (
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
