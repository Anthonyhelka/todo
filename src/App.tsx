import { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Box, Button, Card, CardContent, CircularProgress, Typography } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

import './App.css';

// Added interfaces for both User and Todo, thought it would be useful

interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  address: {
    street: string;
    suite: string;
    city: string;
    zipcode: string;
    geo: {
      lat: string;
      lng: string;
    }
  };
  phone: string;
  website: string;
  company: {
    name: string;
    catchPhrase: string;
    bs: string;
  }
}

interface Todo {
  id: number;
  title: string;
  completed: boolean;
  userId: number;
}

const App = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [todos, setTodos] = useState<Todo[]>([]);
  const [page, setPage] = useState(1);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingTodos, setLoadingTodos] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // I chose to add the users in because I thought it would be cool to display details about the author on the todo cards
  const getUsers = async () => {
    try {
      const result = await axios.get(`https://jsonplaceholder.typicode.com/users`);
      setLoadingUsers(false);
      if (result.data) {
        setUsers(result.data);
      }
    } catch(error) {
      setLoadingUsers(false);
      console.log('Error fetching users:', error);
      setErrorMessage('Error fetching users');
    }
  };

  const getTodos = useCallback(async () => {
    try {
      const result = await axios.get(`https://jsonplaceholder.typicode.com/todos?_page=${page}&_limit=35`);
      setLoadingTodos(false);
      if (result.data) {
        setTodos(result.data);
      }
    } catch(error) {
      setLoadingTodos(false);
      console.log('Error fetching todos:', error);
      setErrorMessage('Error fetching todos');
    }
  }, [page]);

  // This runs on the initial render and does not rerun as we only need to get users once
  useEffect(() => {
    setLoadingUsers(true);
    getUsers();
  }, []);

  // This runs on the initial render and reruns whenever the page state changes
  useEffect(() => {
    setLoadingTodos(true);
    getTodos();
  }, [page, getTodos]);

  const handlePageChange = (newPage: number) => {
    // If newPage is less than 1, return error as that would take us to page 0
    if (newPage < 1) {
      setErrorMessage(`Cannot change the page to ${newPage}`);
      return;
    // If the user wants to increase the page number and todos are less than 35, that means we reached the last page and should not increase the page number
    } else if (newPage > page && todos.length < 35) {
      setErrorMessage(`Cannot change the page to ${newPage}`);
      return;
    }
    // Scrolls back to top on page change
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setPage(newPage);
  };

  const getAuthor = useMemo(() => {
    return (userId: number) => users.find(user => user.id === userId);
  }, [users]);

  const renderTodoCard = (todo: Todo) => {
    const author = getAuthor(todo.userId);
    return (
      <Card key={todo.id} variant="outlined" sx={{ marginBottom: 2 }}>
        <CardContent style={{ padding: 16, }}>
          <Typography variant="h6" component="div">
            {todo.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Created By: {author?.username}
          </Typography>
          {todo.completed && (
            <CheckCircleIcon color="success" sx={{ marginTop: 1 }} />
          )}
        </CardContent>
      </Card>
    );
  };
  
  return (
    <div style={{ maxWidth: 600, margin: 'auto', marginBottom: 20, }} className="App">
      <Typography style={{ marginTop: 20, marginBottom: 20, }}>Anthony Helka - Todo</Typography>
      {/* Loading spinner while we fetch our data */}
      {loadingUsers || loadingTodos ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '100vh',
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          {todos.map((todo: Todo) => renderTodoCard(todo))}
          <Typography style={{ marginTop: 20, marginBottom: 20, }} color="error">{errorMessage}</Typography>
          {/* Disabled if the page is at 1 so the user cannot go to page 0 */}
          <Button
            style={{ marginRight: 20, }}
            variant="contained"
            disabled={page <= 1}
            onClick={() => handlePageChange(page - 1)}
          >
            Previous Page
          </Button>
          {/* Disabled if the todos.length is less than 35 as that is the last page in our data set */}
          <Button
            variant="contained"
            disabled={todos.length < 35}
            onClick={() => handlePageChange(page + 1)}
          >
            Next Page
          </Button>
        </>
      )}
    </div>
  );
}

export default App;
