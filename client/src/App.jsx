import './App.css';
// import 'semantic-ui-css/semantic.css';

import { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { Home, Login, Register, SinglePost } from './pages';
import MenuBar from './components/MenuBar';
import { AuthContext } from './context/auth';

const NotFound = () => <h1>Page Not Found</h1>;
const IfNotLogin = () => useContext(AuthContext).user
  ? <Navigate replace to="/" />
  : <Outlet />;

function App() {
  return (
    <Router>
      <Container>
        <MenuBar />
        <Routes>
          <Route exact path="/" element={<Navigate replace to="/home" />} />
          <Route exact path="/home" element={<Home />} />
          <Route element={<IfNotLogin />}>
            <Route exact path="/login" element={<Login />} />
            <Route exact path="/register" element={<Register />} />
          </Route>
          <Route exact path="/posts/:postId" element={<SinglePost />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
