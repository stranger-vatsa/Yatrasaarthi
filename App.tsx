import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import LandingPage from './components/LandingPage';
import Explore from './components/Explore';
import Planner from './components/Planner';
import Maps from './components/Maps';
import PackingAssistant from './components/PackingAssistant';
import Culture from './components/Culture';

const App: React.FC = () => {
  return (
    <Router>
      <div className="bg-wander-dark text-white min-h-screen selection:bg-wander-accent selection:text-wander-dark font-sans">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/planner" element={<Planner />} />
          <Route path="/maps" element={<Maps />} />
          <Route path="/packing" element={<PackingAssistant />} />
          <Route path="/culture" element={<Culture />} />
        </Routes>
        <Navbar />
      </div>
    </Router>
  );
};

export default App;