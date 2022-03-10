import './App.css';
// import 'semantic-ui-css/semantic.css';

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'semantic-ui-react';

import { Home, Login, Register } from './pages';
import MenuBar from './components/MenuBar';

const NotFound = () => <h1>Page Not Found</h1>;

function App() {
  return (
    <Router>
      <Container>
        <MenuBar />
        <Routes>
          <Route path="/" element={<Navigate replace to="/home" />} />
          <Route path="/home" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
