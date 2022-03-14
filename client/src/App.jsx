import './App.css';
// import 'semantic-ui-css/semantic.css';

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { Home, Login, Register, SinglePost, UserDetails } from './pages';
import { ChatBox, MenuBar } from './components';
import { useAuth } from './context/auth';

const NotFound = () => <h1>Page Not Found</h1>;
const IfNotLogin = () => useAuth().user
  ? <Navigate replace to="/" />
  : <Outlet />;

const Layout = () => <Container>
  <MenuBar />
  <Outlet />
  <ChatBox />
</Container>;

function App() {
  return (
    <Router>
      <Routes>
        <Route element={<Layout />}>
          <Route exact path="/" element={<Navigate replace to="/home" />} />
          <Route exact path="/home" element={<Home />} />
          <Route element={<IfNotLogin />}>
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
          </Route>
          <Route exact path="/posts/:postId" element={<SinglePost />} />
          <Route exact path="/users/:userId" element={<UserDetails />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
