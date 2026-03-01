# 🎓 Negros CET Survey App

A survey web app to collect data on college entrance exam experiences from students in Negros. Built with Next.js + Supabase + Vercel.

---

## 🚀 Setup Guide (Step by Step)

### Step 1 — Set Up Supabase (Free Database)

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Click **New Project** → give it a name like `negros-cet-survey`
3. Wait for it to finish setting up (~1 min)
4. Go to **SQL Editor** and run this SQL to create the table:

```sql
create table survey_responses (
  id uuid default gen_random_uuid() primary key,
  school text[],
  school_other text,
  year_taken text,
  course text[],
  course_other text,
  num_questions text,
  exam_duration text,
  exam_type text,
  exam_type_other text,
  exam_structure text,
  exam_structure_other text,
  passing_score text,
  passing_score_other text,
  subjects text[],
  subjects_other text,
  math_topics text[],
  math_topics_other text,
  english_topics text[],
  english_topics_other text,
  science_topics text[],
  science_topics_other text,
  logic_topics text[],
  logic_topics_other text,
  genknowledge_topics text[],
  genknowledge_topics_other text,
  hardest_part text,
  hardest_part_other text,
  easiest_part text,
  easiest_part_other text,
  time_enough text,
  time_enough_other text,
  review_method text[],
  review_method_other text,
  reviewer_available text,
  reviewer_available_other text,
  wanted_features text[],
  wanted_features_other text,
  would_use text,
  suggestions text,
  created_at timestamptz default now()
);

-- Allow public inserts (for the survey form)
alter table survey_responses enable row level security;
create policy "Allow insert" on survey_responses for insert with check (true);
create policy "Allow select with service key" on survey_responses for select using (true);
```

5. Go to **Project Settings → API** and copy:
   - `Project URL`
   - `anon public` key
   - `service_role` key (keep this secret!)

---

### Step 2 — Deploy to Vercel

1. Push this project to **GitHub**
2. Go to [vercel.com](https://vercel.com) → **New Project** → Import your GitHub repo
3. Before clicking Deploy, go to **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your anon public key |
| `SUPABASE_SERVICE_KEY` | Your service_role key |

4. Click **Deploy** 🚀

---

### Step 3 — Share the Survey

- Share your Vercel URL in Facebook groups of CHMSU, SUNN, TUP, PNU, etc.
- View results at `your-url.vercel.app/results`

---

## 📁 Project Structure

```
app/
  page.js          → Survey form (5 sections)
  results/page.js  → Analytics dashboard with charts
  api/
    submit/route.js    → Saves response to Supabase
    responses/route.js → Fetches all responses for charts
```

---

## 🛠 Tech Stack

- **Next.js 14** — Framework
- **Supabase** — Database (free tier)
- **Tailwind CSS** — Styling
- **Recharts** — Charts and analytics
- **Vercel** — Hosting (free tier)
