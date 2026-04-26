const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const app = express()
app.use(express.json())

const users = []
const SECRET = 'mysecretkey'

// Route 1 — Register
app.post('/register', async function(req, res) {
  const hashed = await bcrypt.hash(req.body.password, 10)
  const user = { id: users.length + 1, username: req.body.username, password: hashed }
  users.push(user)
  res.json({ message: 'User created', username: user.username })
})

// Route 2 — Login
app.post('/login', async function(req, res) {
  const user = users.find(u => u.username === req.body.username)
  if (!user) return res.status(404).json({ error: 'User not found' })

  const valid = await bcrypt.compare(req.body.password, user.password)
  if (!valid) return res.status(401).json({ error: 'Wrong password' })

  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '1h' })
  res.json({ token })
})

// Middleware — checks the token
function protect(req, res, next) {
  const header = req.headers['authorization']
  if (!header) return res.status(401).json({ error: 'No token' })

  const token = header.split(' ')[1]
  try {
    const decoded = jwt.verify(token, SECRET)
    req.user = decoded
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

// Route 3 — Protected
app.get('/me', protect, function(req, res) {
  res.json({ message: 'You are logged in', user: req.user })
})

app.listen(3000, function() {
  console.log('Auth server running at http://localhost:3000')
})