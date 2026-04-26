require('dotenv').config()

const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const cors = require('cors')
const pool = require('./db')

const app = express()
app.use(cors())
app.use(express.json())

const SECRET = process.env.JWT_SECRET

// --- AUTH ROUTES ---

app.post('/register', async function(req, res) {
  const { username, password } = req.body
  const hashed = await bcrypt.hash(password, 10)
  const result = await pool.query(
    'INSERT INTO users (username, password) VALUES ($1, $2) RETURNING id, username',
    [username, hashed]
  )
  res.json({ registered: result.rows[0] })
})

app.post('/login', async function(req, res) {
  const { username, password } = req.body
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
  const user = result.rows[0]
  if (!user) return res.status(404).json({ error: 'User not found' })
  const valid = await bcrypt.compare(password, user.password)
  if (!valid) return res.status(401).json({ error: 'Wrong password' })
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// --- MIDDLEWARE ---

function protect(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'No token' })
  const token = header.split(' ')[1]
  try {
    req.user = jwt.verify(token, SECRET)
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// --- TODO ROUTES ---

app.get('/todos', protect, async function(req, res) {
  const result = await pool.query('SELECT * FROM todos WHERE user_id = $1', [req.user.id])
  res.json({ todos: result.rows })
})

app.post('/todos', protect, async function(req, res) {
  const result = await pool.query(
    'INSERT INTO todos (task, user_id) VALUES ($1, $2) RETURNING *',
    [req.body.task, req.user.id]
  )
  res.json({ added: result.rows[0] })
})

app.put('/todos/:id', protect, async function(req, res) {
  const result = await pool.query(
    'UPDATE todos SET done = true WHERE id = $1 AND user_id = $2 RETURNING *',
    [req.params.id, req.user.id]
  )
  res.json({ updated: result.rows[0] })
})

app.delete('/todos/:id', protect, async function(req, res) {
  await pool.query('DELETE FROM todos WHERE id = $1 AND user_id = $2', [req.params.id, req.user.id])
  res.json({ message: 'Todo deleted' })
})

// --- NOTES ROUTES ---

app.get('/notes', protect, async function(req, res) {
  const result = await pool.query(
    'SELECT * FROM notes WHERE user_id = $1 ORDER BY reminder_at ASC NULLS LAST, created_at DESC',
    [req.user.id]
  )
  res.json({ notes: result.rows })
})

app.post('/notes', protect, async function(req, res) {
  const { title, body, reminder_at } = req.body
  const result = await pool.query(
    'INSERT INTO notes (title, body, reminder_at, user_id) VALUES ($1, $2, $3, $4) RETURNING *',
    [title, body || null, reminder_at || null, req.user.id]
  )
  res.json({ note: result.rows[0] })
})

app.put('/notes/:id', protect, async function(req, res) {
  const { title, body, reminder_at, done } = req.body
  const result = await pool.query(
    'UPDATE notes SET title=$1, body=$2, reminder_at=$3, done=$4 WHERE id=$5 AND user_id=$6 RETURNING *',
    [title, body || null, reminder_at || null, done, req.params.id, req.user.id]
  )
  res.json({ note: result.rows[0] })
})

app.delete('/notes/:id', protect, async function(req, res) {
  await pool.query('DELETE FROM notes WHERE id=$1 AND user_id=$2', [req.params.id, req.user.id])
  res.json({ message: 'Note deleted' })
})

app.listen(process.env.PORT || 3000, function() {
  console.log('Full app running at http://localhost:3000')
})