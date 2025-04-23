import React, { useEffect, useState } from "react";
import axios from "axios";
import { MdDelete, MdEdit, MdLightMode, MdDarkMode } from "react-icons/md";

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [todoInput, setTodoInput] = useState("");
  const [editIndex, setEditIndex] = useState(-1);
  const [searchInput, setSearchInput] = useState("");
  const [darkMode, setDarkMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  const TODOS_PER_PAGE = 5;

  useEffect(() => {
    fetchTodos();
    // Toggle dark mode on body element
    if (darkMode) {
      document.body.classList.add("dark");
      document.body.classList.remove("light");
    } else {
      document.body.classList.add("light");
      document.body.classList.remove("dark");
    }
  }, [darkMode]);

  const fetchTodos = async () => {
    try {
      const response = await axios.get("http://127.0.0.1:8080/todos");
      setTodos(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  const addOrUpdateTodo = async () => {
    if (!todoInput.trim()) return;

    try {
      if (editIndex === -1) {
        const response = await axios.post("http://127.0.0.1:8080/todos", {
          title: todoInput,
          completed: false,
        });
        setTodos(response.data);
      } else {
        const id = todos[editIndex].id;
        const response = await axios.put(`http://127.0.0.1:8080/todos/${id}`, {
          title: todoInput,
        });
        const updated = [...todos];
        updated[editIndex] = response.data;
        setTodos(updated);
        setEditIndex(-1);
      }
      setTodoInput("");
    } catch (error) {
      console.error(error);
    }
  };

  const deleteTodo = async (id) => {
    try {
      await axios.delete(`http://127.0.0.1:8080/todos/${id}`);
      fetchTodos();
    } catch (error) {
      console.error(error);
    }
  };

  const startEdit = (index) => {
    setEditIndex(index);
    setTodoInput(todos[index].title);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const filteredTodos = todos.filter((todo) =>
    todo.title.toLowerCase().includes(searchInput.toLowerCase())
  );

  const totalPages = Math.ceil(filteredTodos.length / TODOS_PER_PAGE);
  const paginatedTodos = filteredTodos.slice(
    (currentPage - 1) * TODOS_PER_PAGE,
    currentPage * TODOS_PER_PAGE
  );

  return (
    <div className={`container ${darkMode ? "dark" : "light"}`}>
    <h1>Todo Dashboard</h1>
      <div className="controls">
        <div className="search-darkmode">
          <input
            type="text"
            placeholder="Search..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className={darkMode ? "dark" : ""}
          />
          <button className="dark-mode-toggle" onClick={toggleDarkMode}>
            {darkMode ? <MdLightMode /> : <MdDarkMode />}
          </button>
        </div>

        <div className="todo-input-row">
          <input
            type="text"
            value={todoInput}
            onChange={(e) => setTodoInput(e.target.value)}
            placeholder="What needs to be done?"
            className={darkMode ? "dark" : ""}
          />
          <button onClick={addOrUpdateTodo}>
            {editIndex === -1 ? "Add" : "Update"}
          </button>
        </div>
      </div>

      <div className="todo-list-container">
        <ul className="todo-list">
          {paginatedTodos.map((todo, index) => (
            <li
              key={todo.id}
              className={`todo-item ${darkMode ? "dark" : ""}`} // Add dark class here
            >
              <span>{todo.title}</span>
              <span className="todo-date">{new Date(todo.created_at).toLocaleString()}</span>
              <div className="actions">
                <MdEdit onClick={() => startEdit(index + (currentPage - 1) * TODOS_PER_PAGE)} />
                <MdDelete onClick={() => deleteTodo(todo.id)} />
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="pagination">
        {Array.from({ length: totalPages }).map((_, idx) => (
          <button
            key={idx}
            className={currentPage === idx + 1 ? "active" : ""}
            onClick={() => setCurrentPage(idx + 1)}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
