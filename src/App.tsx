import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { PartPage } from './pages/PartPage';
import { CalendarPage } from './pages/CalendarPage';
import { SetupPage } from './pages/SetupPage';

export default function App() {
  return (
    <div className="app">
      <Header />
      <main className="app__main">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/part/:id" element={<PartPage />} />
          <Route path="/setup" element={<SetupPage />} />
          <Route path="/calendar" element={<CalendarPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
