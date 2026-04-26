const express = require('express')
const pool = require('./db')

const app = express()
app.use(express.json())

// GET all todos
app.get('/todos', async function(req, res) {
  const result = await pool.query('SELECT * FROM todos')
  res.json({ todos: result.rows })
})

// POST a new todo
app.post('/todos', async function(req, res) {
  const { task } = req.body
  const result = await pool.query(
    'INSERT INTO todos (task) VALUES ($1) RETURNING *',
    [task]
  )
  res.json({ added: result.rows[0] })
})

// PUT mark as done
app.put('/todos/:id', async function(req, res) {
  const result = await pool.query(
    'UPDATE todos SET done = true WHERE id = $1 RETURNING *',
    [req.params.id]
  )
  res.json({ updated: result.rows[0] })
})

// DELETE a todo
app.delete('/todos/:id', async function(req, res) {
  await pool.query('DELETE FROM todos WHERE id = $1', [req.params.id])
  res.json({ message: 'Todo deleted' })
})

app.listen(3000, function() {
  console.log('Server with database running at http://localhost:3000')
})