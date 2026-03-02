'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'

const SCHOOLS = ['CHMSU', 'SUNN', 'TUP', 'PNU', 'Colegio San Agustin', 'La Salle']
const YEARS = ['2025', '2024', '2023', '2022', '2021']
const COURSES = ['Engineering', 'Education', 'Nursing / Health Sciences', 'Business / Accountancy', 'IT / Computer Science', 'Agriculture']
const NUM_QUESTIONS = ['Less than 50', '50–100', '101–150', '151–200', 'More than 200', "I don't remember"]
const DURATIONS = ['Less than 1 hour', '1–2 hours', '2–3 hours', 'More than 3 hours', "I don't remember"]
const EXAM_TYPES = ['Paper and Pencil', 'Computerized', 'Both']
const STRUCTURES = ['One straight test with no sections or breaks', 'Divided into 2 sections (e.g. English + Math)', 'Divided into 3 sections (e.g. English, Math, Science)', 'Divided into 4 sections (e.g. English, Math, Science, Filipino)', 'Divided into 5 or more sections', 'Each section was timed separately', 'All sections were given at once with one timer', "I don't remember"]
const PASSING = ['Yes, they told us', "Yes but didn't tell exact score", 'No — ranking based', "I don't know"]
const SUBJECTS = ['English / Reading Comprehension', 'Mathematics', 'Science', 'Filipino / Komunikasyon', 'Logic / Abstract Reasoning', 'General Knowledge / Current Events', 'Technical / Vocational Reasoning']
const MATH_TOPICS = ['Basic Arithmetic', 'Fractions and Decimals', 'Algebra', 'Geometry', 'Word Problems', 'Statistics / Probability', "I don't remember"]
const ENGLISH_TOPICS = ['Grammar and Sentence Correction', 'Reading Comprehension', 'Vocabulary / Word Meaning', 'Fill in the Blanks', "I don't remember"]
const SCIENCE_TOPICS = ['General Science', 'Biology', 'Chemistry', 'Physics', 'Earth Science', "I don't remember"]
const LOGIC_TOPICS = ['Number Patterns / Sequences', 'Shape and Figure Patterns', 'Odd One Out', 'Analogies', 'Word Problems / Critical Thinking', 'There were no logic questions']
const GK_TOPICS = ['Philippine History', 'Current Events', 'Geography', 'Government / Civics', 'There were none', "I don't remember"]
const PARTS = ['English', 'Math', 'Science', 'Logic / Reasoning', 'Filipino', 'General Knowledge']
const TIME_OPTIONS = ['Yes, I had extra time', 'Just enough', "No, I didn't finish"]
const REVIEW_METHODS = ['Printed reviewers', 'YouTube', 'Online reviewer / app', 'Review center', "I didn't review"]
const REVIEWER_AVAIL = ['Yes, easy to find', 'Yes, but hard to find', 'Nothing was available']
const FEATURES = ['Timed mock exam', 'Practice per subject', 'Score and result after each test', 'Explanation per answer', 'Track my progress', 'Mobile friendly', 'Offline mode']
const WOULD_USE = ['Definitely yes', 'Probably yes', 'Maybe', 'No']

function CheckboxGroup({ options, value = [], onChange, other, onOtherChange, otherValue }) {
  const toggle = (opt) => {
    if (value.includes(opt)) onChange(value.filter(v => v !== opt))
    else onChange([...value, opt])
  }
  return (
    <div className="space-y-1 mt-3">
      {options.map(opt => (
        <label key={opt} className="checkbox-item">
          <input type="checkbox" checked={value.includes(opt)} onChange={() => toggle(opt)} />
          <span className="text-sm text-gray-300">{opt}</span>
        </label>
      ))}
      {other && (
        <div className="mt-2 pl-2">
          <label className="checkbox-item">
            <input type="checkbox" checked={value.includes('__other__')} onChange={() => toggle('__other__')} />
            <span className="text-sm text-gray-300">Others</span>
          </label>
          {value.includes('__other__') && (
            <input className="other-input mt-1 ml-6" placeholder="Please specify..." value={otherValue || ''} onChange={e => onOtherChange(e.target.value)} />
          )}
        </div>
      )}
    </div>
  )
}

function RadioGroup({ options, value, onChange, other, onOtherChange, otherValue }) {
  return (
    <div className="space-y-1 mt-3">
      {options.map(opt => (
        <label key={opt} className="radio-item">
          <input type="radio" name={Math.random()} checked={value === opt} onChange={() => onChange(opt)} />
          <span className="text-sm text-gray-300">{opt}</span>
        </label>
      ))}
      {other && (
        <div className="mt-2 pl-2">
          <label className="radio-item">
            <input type="radio" checked={value === '__other__'} onChange={() => onChange('__other__')} />
            <span className="text-sm text-gray-300">Others</span>
          </label>
          {value === '__other__' && (
            <input className="other-input mt-1 ml-6" placeholder="Please specify..." value={otherValue || ''} onChange={e => onOtherChange(e.target.value)} />
          )}
        </div>
      )}
    </div>
  )
}

const TOTAL_SECTIONS = 5

export default function SurveyPage() {
  const [section, setSection] = useState(1)
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const [form, setForm] = useState({
    name: '',
    website: '', // honeypot — must stay empty
    school: [], school_other: '',
    year_taken: '', 
    course: [], course_other: '',
    num_questions: '',
    exam_duration: '',
    exam_type: '', exam_type_other: '',
    exam_structure: '', exam_structure_other: '',
    passing_score: '', passing_score_other: '',
    subjects: [], subjects_other: '',
    math_topics: [], math_topics_other: '',
    english_topics: [], english_topics_other: '',
    science_topics: [], science_topics_other: '',
    logic_topics: [], logic_topics_other: '',
    genknowledge_topics: [], genknowledge_topics_other: '',
    hardest_part: '', hardest_part_other: '',
    easiest_part: '', easiest_part_other: '',
    time_enough: '', time_enough_other: '',
    review_method: [], review_method_other: '',
    reviewer_available: '', reviewer_available_other: '',
    wanted_features: [], wanted_features_other: '',
    would_use: '',
    suggestions: '',
  })

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const [responseCount, setResponseCount] = useState(null)
  const [alreadySubmitted, setAlreadySubmitted] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined' && localStorage.getItem('cet_submitted') === '1') {
      setAlreadySubmitted(true)
    }
  }, [])

  useEffect(() => {
    fetch('/api/count')
      .then(r => r.json())
      .then(res => { if (res.success) setResponseCount(res.count) })
      .catch(() => {})
  }, [])

  const progress = (section / TOTAL_SECTIONS) * 100

  const handleSubmit = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (data.success) {
        localStorage.setItem('cet_submitted', '1')
        setSubmitted(true)
      }
      else setError('Something went wrong. Please try again.')
    } catch {
      setError('Network error. Please check your connection.')
    }
    setLoading(false)
  }

  if (alreadySubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-2xl font-display gold-accent mb-4">You've already responded!</h1>
          <p className="text-gray-400 mb-8">It looks like you've already submitted this survey from this device. Thank you so much! 🙏</p>
          <button onClick={() => { localStorage.removeItem('cet_submitted'); setAlreadySubmitted(false) }} className="btn-primary" style={{background:'#21262d', color:'#e6edf3'}}>Submit Again Anyway</button>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-6">🎓</div>
          <h1 className="text-3xl font-display gold-accent mb-4">Salamat!</h1>
          <p className="text-gray-400 mb-8 text-lg">Your answers will help me build a better reviewer for future students in Negros. You're awesome! 🙏</p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={() => { localStorage.removeItem('cet_submitted'); setSubmitted(false); setSection(1); setForm({name:'',website:'',school:[],school_other:'',year_taken:'',course:[],course_other:'',num_questions:'',exam_duration:'',exam_type:'',exam_type_other:'',exam_structure:'',exam_structure_other:'',passing_score:'',passing_score_other:'',subjects:[],subjects_other:'',math_topics:[],math_topics_other:'',english_topics:[],english_topics_other:'',science_topics:[],science_topics_other:'',logic_topics:[],logic_topics_other:'',genknowledge_topics:[],genknowledge_topics_other:'',hardest_part:'',hardest_part_other:'',easiest_part:'',easiest_part_other:'',time_enough:'',time_enough_other:'',review_method:[],review_method_other:'',reviewer_available:'',reviewer_available_other:'',wanted_features:[],wanted_features_other:'',would_use:'',suggestions:''}) }} className="btn-primary">Submit Another Response</button>
            <Link href="/results" className="btn-primary" style={{display:'inline-block', textDecoration:'none'}}>View Results</Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen py-10 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-widest gold-accent mb-2">Negros CET Project</p>
          <h1 className="text-3xl md:text-4xl font-display font-bold mb-3">College Entrance Exam<br />Experience Survey</h1>
          <p className="text-gray-400 text-sm max-w-md mx-auto">Help me build a <span className="gold-accent font-semibold">free online reviewer</span> for students in Negros! This will only take 2–3 minutes. 🙏</p>
          {responseCount !== null && (
            <p className="text-xs mt-3 font-semibold" style={{color:'var(--gold)'}}>🙌 {responseCount} student{responseCount !== 1 ? 's have' : ' has'} already responded!</p>
          )}
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between text-xs text-gray-500 mb-2">
            <span>Section {section} of {TOTAL_SECTIONS}</span>
            <span>{Math.round(progress)}% complete</span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-1">
            <div className="progress-bar" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Section 1 */}
        {section === 1 && (
          <div>
            <div className="section-card">
              <h2 className="text-lg font-bold gold-accent mb-1">Part 1 — Basic Info</h2>
              <p className="text-xs text-gray-500 mb-4">Tell us about your school and course</p>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200 block mb-2">Your Name <span className="text-gray-500 font-normal">(optional)</span></label>
                <input
                  type="text"
                  className="other-input"
                  placeholder="e.g. Carlos Miguel"
                  value={form.name}
                  onChange={e => set('name', e.target.value)}
                />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">1. What school did you take the entrance exam for? <span className="text-red-400">*</span></label>
                <CheckboxGroup options={SCHOOLS} value={form.school} onChange={v => set('school', v)} other onOtherChange={v => set('school_other', v)} otherValue={form.school_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">2. What year did you take it? <span className="text-red-400">*</span></label>
                <RadioGroup options={YEARS} value={form.year_taken} onChange={v => set('year_taken', v)} other onOtherChange={v => set('year_taken', v)} />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-200">3. What course did you apply for? <span className="text-red-400">*</span></label>
                <CheckboxGroup options={COURSES} value={form.course} onChange={v => set('course', v)} other onOtherChange={v => set('course_other', v)} otherValue={form.course_other} />
              </div>
            </div>

            <div className="flex justify-end">
              <button className="btn-primary" disabled={form.school.length === 0 || !form.year_taken || form.course.length === 0} onClick={() => setSection(2)}>Next →</button>
            </div>
          </div>
        )}

        {/* Section 2 */}
        {section === 2 && (
          <div>
            <div className="section-card">
              <h2 className="text-lg font-bold gold-accent mb-1">Part 2 — Exam Format</h2>
              <p className="text-xs text-gray-500 mb-4">Tell us about how the exam was structured</p>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">4. Approximately how many questions were in the exam?</label>
                <RadioGroup options={NUM_QUESTIONS} value={form.num_questions} onChange={v => set('num_questions', v)} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">5. How long was the exam?</label>
                <RadioGroup options={DURATIONS} value={form.exam_duration} onChange={v => set('exam_duration', v)} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">6. What type of exam was it?</label>
                <RadioGroup options={EXAM_TYPES} value={form.exam_type} onChange={v => set('exam_type', v)} other onOtherChange={v => set('exam_type_other', v)} otherValue={form.exam_type_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">7. How was the exam structured?</label>
                <RadioGroup options={STRUCTURES} value={form.exam_structure} onChange={v => set('exam_structure', v)} other onOtherChange={v => set('exam_structure_other', v)} otherValue={form.exam_structure_other} />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-200">8. Was there a passing score?</label>
                <RadioGroup options={PASSING} value={form.passing_score} onChange={v => set('passing_score', v)} other onOtherChange={v => set('passing_score_other', v)} otherValue={form.passing_score_other} />
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn-primary" style={{background:'#21262d', color:'#e6edf3'}} onClick={() => setSection(1)}>← Back</button>
              <button className="btn-primary" onClick={() => setSection(3)}>Next →</button>
            </div>
          </div>
        )}

        {/* Section 3 */}
        {section === 3 && (
          <div>
            <div className="section-card">
              <h2 className="text-lg font-bold gold-accent mb-1">Part 3 — Subject Coverage</h2>
              <p className="text-xs text-gray-500 mb-4">What topics were in the exam?</p>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">9. What subjects were included? (Check all that apply)</label>
                <CheckboxGroup options={SUBJECTS} value={form.subjects} onChange={v => set('subjects', v)} other onOtherChange={v => set('subjects_other', v)} otherValue={form.subjects_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">10. For Math — what topics were covered?</label>
                <CheckboxGroup options={MATH_TOPICS} value={form.math_topics} onChange={v => set('math_topics', v)} other onOtherChange={v => set('math_topics_other', v)} otherValue={form.math_topics_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">11. For English — what topics were covered?</label>
                <CheckboxGroup options={ENGLISH_TOPICS} value={form.english_topics} onChange={v => set('english_topics', v)} other onOtherChange={v => set('english_topics_other', v)} otherValue={form.english_topics_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">12. For Science — what was covered?</label>
                <CheckboxGroup options={SCIENCE_TOPICS} value={form.science_topics} onChange={v => set('science_topics', v)} other onOtherChange={v => set('science_topics_other', v)} otherValue={form.science_topics_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">13. For Logic / Reasoning — what type?</label>
                <CheckboxGroup options={LOGIC_TOPICS} value={form.logic_topics} onChange={v => set('logic_topics', v)} other onOtherChange={v => set('logic_topics_other', v)} otherValue={form.logic_topics_other} />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-200">14. Were there General Knowledge questions? If yes, what topics?</label>
                <CheckboxGroup options={GK_TOPICS} value={form.genknowledge_topics} onChange={v => set('genknowledge_topics', v)} other onOtherChange={v => set('genknowledge_topics_other', v)} otherValue={form.genknowledge_topics_other} />
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn-primary" style={{background:'#21262d', color:'#e6edf3'}} onClick={() => setSection(2)}>← Back</button>
              <button className="btn-primary" onClick={() => setSection(4)}>Next →</button>
            </div>
          </div>
        )}

        {/* Section 4 */}
        {section === 4 && (
          <div>
            <div className="section-card">
              <h2 className="text-lg font-bold gold-accent mb-1">Part 4 — Your Experience</h2>
              <p className="text-xs text-gray-500 mb-4">Tell us how the exam felt</p>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">15. Which part was the hardest?</label>
                <RadioGroup options={PARTS} value={form.hardest_part} onChange={v => set('hardest_part', v)} other onOtherChange={v => set('hardest_part_other', v)} otherValue={form.hardest_part_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">16. Which part was the easiest?</label>
                <RadioGroup options={PARTS} value={form.easiest_part} onChange={v => set('easiest_part', v)} other onOtherChange={v => set('easiest_part_other', v)} otherValue={form.easiest_part_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">17. Was the time limit enough to finish?</label>
                <RadioGroup options={TIME_OPTIONS} value={form.time_enough} onChange={v => set('time_enough', v)} other onOtherChange={v => set('time_enough_other', v)} otherValue={form.time_enough_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">18. Did you review before the exam? (Check all that apply)</label>
                <CheckboxGroup options={REVIEW_METHODS} value={form.review_method} onChange={v => set('review_method', v)} other onOtherChange={v => set('review_method_other', v)} otherValue={form.review_method_other} />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-200">19. Was there a reviewer available for your school's exam?</label>
                <RadioGroup options={REVIEWER_AVAIL} value={form.reviewer_available} onChange={v => set('reviewer_available', v)} other onOtherChange={v => set('reviewer_available_other', v)} otherValue={form.reviewer_available_other} />
              </div>
            </div>

            <div className="flex justify-between">
              <button className="btn-primary" style={{background:'#21262d', color:'#e6edf3'}} onClick={() => setSection(3)}>← Back</button>
              <button className="btn-primary" onClick={() => setSection(5)}>Next →</button>
            </div>
          </div>
        )}

        {/* Section 5 */}
        {section === 5 && (
          <div>
            <div className="section-card">
              <h2 className="text-lg font-bold gold-accent mb-1">Part 5 — Help Me Build the App</h2>
              <p className="text-xs text-gray-500 mb-4">Last section! What features do you want?</p>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">20. What features would you want in the reviewer? (Check all that apply)</label>
                <CheckboxGroup options={FEATURES} value={form.wanted_features} onChange={v => set('wanted_features', v)} other onOtherChange={v => set('wanted_features_other', v)} otherValue={form.wanted_features_other} />
              </div>

              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-200">21. Would you have used it when you were reviewing?</label>
                <RadioGroup options={WOULD_USE} value={form.would_use} onChange={v => set('would_use', v)} />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-200 block mb-2">22. Any other suggestions or things you remember about the exam?</label>
                <textarea className="other-input" placeholder="Type your answer here..." value={form.suggestions} onChange={e => set('suggestions', e.target.value)} />
              </div>
              {/* Honeypot — hidden from humans, bots fill it */}
              <input type="text" name="website" value={form.website} onChange={e => set('website', e.target.value)} style={{position:'absolute',left:'-9999px',opacity:0,height:0}} tabIndex={-1} autoComplete="off" aria-hidden="true" />
            </div>

            {error && <p className="text-red-400 text-sm mb-4 text-center">{error}</p>}

            <div className="flex justify-between">
              <button className="btn-primary" style={{background:'#21262d', color:'#e6edf3'}} onClick={() => setSection(4)}>← Back</button>
              <button className="btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Survey 🎓'}
              </button>
            </div>
          </div>
        )}

        <div className="text-center mt-8 space-y-3">
          <div className="flex justify-center gap-4 pt-2">
            <a href="https://www.linkedin.com/in/carlos-miguel-torres-2644a9332/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-blue-400 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              LinkedIn
            </a>
            <a href="https://github.com/JenxxAI" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-gray-600 hover:text-gray-300 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
              GitHub
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
