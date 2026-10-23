import { Link, Navigate, Route, Routes } from 'react-router-dom';
import Activities from './components/Activities.js';
import Teams from './components/Teams.js';
import Leaderboard from './components/Leaderboard.js';
import Workouts from './components/Workouts.js';

export default function App() {
  return <div className="app-shell">
    <header className="site-header"><div className="container header-inner"><Link className="brand" to="/activities"><span className="brand-mark" aria-hidden="true">O</span><span>OctoFit <strong>Tracker</strong></span></Link><nav aria-label="OctoFit sections" className="site-nav"><Link to="/activities">Activities</Link><Link to="/teams">Teams</Link><Link to="/leaderboard">Leaderboard</Link><Link to="/workouts">Workouts</Link></nav></div></header>
    <main className="container main-content"><Routes><Route path="/" element={<Navigate to="/activities" replace />} /><Route path="/activities" element={<Activities />} /><Route path="/teams" element={<Teams />} /><Route path="/leaderboard" element={<Leaderboard />} /><Route path="/workouts" element={<Workouts />} /></Routes></main>
    <footer className="site-footer"><div className="container">Move together. Get stronger.</div></footer>
  </div>;
}
