import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App';

const mockTodos = [
  { _id: '1', text: 'Test Todo 1', completed: false },
  { _id: '2', text: 'Test Todo 2', completed: true },
];

describe('App', () => {
  beforeEach(() => {
    fetch.resetMocks();
  });

  test('renders the todo list and fetches todos on load', async () => {
    // Mock the initial fetchTodos call
    fetch.mockResponseOnce(JSON.stringify(mockTodos));

    render(<App />);

    // Expect the heading to be present
    expect(screen.getByText(/Todo List/i)).toBeInTheDocument();

    // Wait for todos to be fetched and displayed
    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
      expect(screen.getByText('Test Todo 2')).toBeInTheDocument();
    });

    // Verify the fetch was called
    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('http://localhost:4000/todos');
  });

  test('allows adding a new todo', async () => {
    // Mock initial fetch (empty list) and then the POST response
    fetch
      .mockResponseOnce(JSON.stringify([])) // Initial fetch
      .mockResponseOnce(JSON.stringify({ insertedId: '3' })) // POST response
      .mockResponseOnce(JSON.stringify([{ _id: '3', text: 'New Todo', completed: false }])); // Re-fetch after add

    render(<App />);

    const input = screen.getByPlaceholderText(/New todo/i);
    const addButton = screen.getByText(/Add/i);

    // Type into the input field
    fireEvent.change(input, { target: { value: 'New Todo' } });
    expect(input.value).toBe('New Todo');

    // Click the add button
    fireEvent.click(addButton);

    // Wait for the new todo to appear in the list (after re-fetch)
    await waitFor(() => {
      expect(screen.getByText('New Todo')).toBeInTheDocument();
    });

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(3); // 1 initial GET, 1 POST, 1 subsequent GET
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/todos',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ text: 'New Todo' }),
      })
    );
  });

  test('allows toggling a todo completion status', async () => {
    fetch
      .mockResponseOnce(JSON.stringify(mockTodos)) // Initial fetch
      .mockResponseOnce(JSON.stringify({ success: true })) // PUT response
      .mockResponseOnce(JSON.stringify([
        { _id: '1', text: 'Test Todo 1', completed: true }, // Updated status
        { _id: '2', text: 'Test Todo 2', completed: true },
      ]));

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const todoItem = screen.getByText('Test Todo 1');

    // Initially, it should not have line-through
    expect(todoItem).not.toHaveStyle('text-decoration: line-through');

    // Click to toggle
    fireEvent.click(todoItem);

    // Wait for the re-fetch and UI update
    await waitFor(() => {
      expect(todoItem).toHaveStyle('text-decoration: line-through');
    });

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/todos/1',
      expect.objectContaining({ method: 'PUT' })
    );
  });

  test('allows deleting a todo', async () => {
    fetch
      .mockResponseOnce(JSON.stringify(mockTodos)) // Initial fetch
      .mockResponseOnce(JSON.stringify({ success: true })) // DELETE response
      .mockResponseOnce(JSON.stringify([mockTodos[1]])); // Re-fetch after delete (item 1 removed)

    render(<App />);

    await waitFor(() => {
      expect(screen.getByText('Test Todo 1')).toBeInTheDocument();
    });

    const deleteButton = screen.getAllByText('Delete')[0]; // Get the first delete button (for Test Todo 1)

    // Click the delete button
    fireEvent.click(deleteButton);

    // Wait for the todo to disappear from the list
    await waitFor(() => {
      expect(screen.queryByText('Test Todo 1')).not.toBeInTheDocument();
    });

    // Verify API calls
    expect(fetch).toHaveBeenCalledTimes(3);
    expect(fetch).toHaveBeenCalledWith(
      'http://localhost:4000/todos/1',
      expect.objectContaining({ method: 'DELETE' })
    );
  });
});