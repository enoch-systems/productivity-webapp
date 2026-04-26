const express = require('express')
const app = express()

app.use(express.json())

// Route 1 — GET all todos
app.get('/todos', function(req, res) {
  res.json({ todos: todos })
})

// Route 2 — POST a new todo
app.post('/todos', function(req, res) {
  const newTodo = {
    id: todos.length + 1,
    task: req.body.task,
    done: false
  }
  todos.push(newTodo)
  res.json({ added: newTodo })
})

// Route 3 — mark a todo as done
app.put('/todos/:id', function(req, res) {
  const todo = todos.find(t => t.id == req.params.id)
  if (todo) {
    todo.done = true
    res.json({ updated: todo })
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

// Route 4 — delete a todo
app.delete('/todos/:id', function(req, res) {
  const index = todos.findIndex(t => t.id == req.params.id)
  if (index !== -1) {
    todos.splice(index, 1)
    res.json({ message: 'Todo deleted' })
  } else {
    res.status(404).json({ error: 'Todo not found' })
  }
})

const todos = []

app.listen(3000, function() {
  console.log('Server running at http://localhost:3000')
})