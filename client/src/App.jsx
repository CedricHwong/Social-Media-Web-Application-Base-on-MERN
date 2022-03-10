import './App.css';
// import 'semantic-ui-css/semantic.css';

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import { Home, Login, Register } from './pages';
import MenuBar from './components/MenuBar';

const NotFound = () => <h1>Page Not Found</h1>;

function App() {
  return (
    <Router>
      <MenuBar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
