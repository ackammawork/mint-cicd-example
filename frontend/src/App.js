import React, { useEffect, useState } from 'react';

function App() {
  const [todos, setTodos] = useState([]);
  const [text, setText] = useState('');

  const fetchTodos = async () => {
    const res = await fetch('http://localhost:4000/todos');
    const data = await res.json();
    setTodos(data);
  };

  const addTodo = async () => {
    await fetch('http://localhost:4000/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    setText('');
    fetchTodos();
  };

  const toggleTodo = async id => {
    await fetch(`http://localhost:4000/todos/${id}`, {
      method: 'PUT',
    });
    fetchTodos();
  };

  const deleteTodo = async id => {
    await fetch(`http://localhost:4000/todos/${id}`, {
      method: 'DELETE',
    });
    fetchTodos();
  };

  useEffect(() => {
    fetchTodos();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h2>Todo List</h2>
      <input
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="New todo"
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo._id}>
            <span
              onClick={() => toggleTodo(todo._id)}
              style={{
                textDecoration: todo.completed ? 'line-through' : 'none',
                cursor: 'pointer',
              }}
            >
              {todo.text}
            </span>
            <button onClick={() => deleteTodo(todo._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
