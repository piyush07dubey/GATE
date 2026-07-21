import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import LandingPage from './pages/LandingPage';
import SubjectsPage from './pages/SubjectsPage';
import PYQPage from './pages/PYQPage';
import QuestionDetailPage from './pages/QuestionDetailPage';
import DrawingBoardPage from './pages/DrawingBoardPage';
import NotesPage from './pages/NotesPage';
import ResourcesPage from './pages/ResourcesPage';
import AuthPage from './pages/AuthPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app-container">
          <Navbar />
          <main className="page-wrapper">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/subjects" element={<SubjectsPage />} />
              <Route path="/pyq/:subjectId" element={<PYQPage />} />
              <Route path="/question/:questionId" element={<QuestionDetailPage />} />
              <Route path="/drawing-board" element={<DrawingBoardPage />} />
              <Route path="/notes" element={<NotesPage />} />
              <Route path="/resources" element={<ResourcesPage />} />
              <Route path="/auth" element={<AuthPage />} />
            </Routes>
          </main>
          <Footer />
        </div>
        <Toaster 
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1e1e46',
              color: '#fff',
              border: '1px solid rgba(255,255,255,0.1)',
            },
          }}
        />
      </Router>
    </AuthProvider>
  );
}

export default App;
