const DB_KEY = 'taskflow_db_v1'

function nowIso(offsetDays = 0, hourOffset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(d.getHours() + hourOffset)
  return d.toISOString()
}

function isoDate(offsetDays) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDays)
  d.setHours(12, 0, 0, 0)
  return d.toISOString()
}

function seedTasks() {
  const t = (id, title, description, status, priority, due, createdOffset, updatedOffset) => ({
    id,
    title,
    description,
    status,
    priority,
    due_date: due,
    created_at: nowIso(createdOffset),
    updated_at: nowIso(updatedOffset),
  })

  return [
    t('t-01', 'Write project kickoff notes', 'Draft the scope, goals and success criteria for the new TaskFlow release.', 'done', 'medium', isoDate(-5), -20, -5),
    t('t-02', 'Review design mockups', 'Go through the updated wireframes for the dashboard and leave feedback for the design team.', 'in_progress', 'high', isoDate(0), -14, -1),
    t('t-03', 'Set up CI pipeline', 'Configure linting, unit tests and deployment on every push to main.', 'todo', 'high', isoDate(2), -10, -10),
    t('t-04', 'Update API documentation', 'Refresh the Swagger docs to cover the new task filtering endpoints.', 'todo', 'low', isoDate(6), -9, -9),
    t('t-05', 'Fix session expiry bug', 'Users are logged out immediately after login when the refresh token expires.', 'in_progress', 'high', isoDate(1), -8, -2),
    t('t-06', 'Prepare release notes', 'Summarize all changes shipped in v1.3.0 for the changelog.', 'todo', 'medium', isoDate(4), -7, -7),
    t('t-07', 'Interview frontend candidates', 'Three 45-minute technical interviews scheduled for the platform team.', 'todo', 'medium', isoDate(3), -6, -6),
    t('t-08', 'Migrate task data', 'Move remaining tasks from the old tracker into TaskFlow with proper mapping.', 'done', 'high', isoDate(-3), -30, -4),
    t('t-09', 'Improve empty-state copy', 'Write friendlier placeholder text and add helpful next steps for new users.', 'in_progress', 'low', isoDate(2), -5, -3),
    t('t-10', 'Backup production database', 'Verify nightly backups complete successfully and test one restore.', 'todo', 'medium', isoDate(7), -4, -4),
    t('t-11', 'Request SSL certificate renewal', 'Renew the certificate for the staging environment before it expires.', 'done', 'high', isoDate(-1), -12, -1),
    t('t-12', 'Refactor auth middleware', 'Extract token validation into a reusable middleware shared by all services.', 'todo', 'medium', isoDate(5), -3, -3),
    t('t-13', 'Design onboarding flow', 'Sketch the three-step onboarding for new team members.', 'todo', 'low', null, -11, -11),
    t('t-14', 'Benchmark search endpoint', 'Measure latency for search queries across 100k tasks and document results.', 'todo', 'low', null, -2, -2),
    t('t-15', 'Update privacy policy', 'Reflect new data retention rules in the public privacy policy.', 'todo', 'medium', isoDate(9), -13, -13),
    t('t-16', 'Accessibility audit', 'Run axe against all screens and fix the high-severity issues found.', 'in_progress', 'high', isoDate(4), -15, -1),
    t('t-17', 'Organize team offsite', 'Book venue, flights and agenda for the November team offsite.', 'todo', 'low', isoDate(12), -16, -16),
    t('t-18', 'Write unit tests for task list', 'Cover filtering, sorting and pagination edge cases.', 'done', 'medium', isoDate(-2), -18, -2),
    t('t-19', 'Add dark mode toggle', 'Implement theme switching using CSS variables and persist the choice.', 'todo', 'low', null, -19, -19),
    t('t-20', 'Fix timezone display bug', 'Due dates show one day off for users in UTC+1.', 'in_progress', 'high', isoDate(0), -17, 0),
    t('t-21', 'Archive completed sprints', 'Move last quarter completed tasks to the archive.', 'todo', 'low', isoDate(10), -1, -1),
    t('t-22', 'Plan Q4 roadmap', 'Collect input from all teams and draft the Q4 roadmap proposal.', 'todo', 'medium', isoDate(8), -21, -21),
    t('t-23', 'Update dependency versions', 'Bump React, Vite and Tailwind to their latest stable releases.', 'in_progress', 'medium', isoDate(3), -22, -5),
  ]
}

function createDb() {
  const db = {
    users: [
      {
        id: 'u-demo',
        name: 'Alex Rivera',
        email: 'demo@taskflow.app',
        password: 'demo1234',
        created_at: nowIso(-60),
      },
    ],
    tasks: seedTasks(),
    nextTaskId: 24,
    nextUserId: 2,
    sessions: { 'token-demo-user': 'u-demo' },
  }
  db.tasks.forEach((task) => {
    task.owner_id = 'u-demo'
  })
  return db
}

function loadDb() {
  try {
    const raw = localStorage.getItem(DB_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed && Array.isArray(parsed.users)) return parsed
    }
  } catch {
    // fall through to re-seed
  }
  const db = createDb()
  localStorage.setItem(DB_KEY, JSON.stringify(db))
  return db
}

function saveDb(db) {
  localStorage.setItem(DB_KEY, JSON.stringify(db))
}

export function getDb() {
  return loadDb()
}

export function saveDbAndReturn(db, payload) {
  saveDb(db)
  return structuredClone(payload)
}

export const DEMO_EMAIL = 'demo@taskflow.app'
export const DEMO_PASSWORD = 'demo1234'
