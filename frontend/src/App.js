import React, { useState } from 'react';
export default function App() {
  const [name, setName] = useState('');
  const [id, setId] = useState('');
  const [fetched, setFetched] = useState('');
  return (
    <div style={{ padding: 20 }}>
      <h2>Create Item</h2>
      <input value={name} onChange={e => setName(e.target.value)} />
      <button onClick={() => {
        fetch('http://localhost:4000/item', { method: 'PUT', headers: {'Content-Type': 'application/json'}, body: JSON.stringify({ name }) })
          .then(r => r.json()).then(j => setId(j.insertedId));
      }}>Save</button>
      <h2>Fetch Item</h2>
      <input value={fetched} placeholder="set below" readOnly />
      <button onClick={() => {
        fetch(`http://localhost:4000/item/${id}`).then(r => r.json()).then(j => setFetched(j.name || ''));
      }}>Load</button>
    </div>
  );
}
