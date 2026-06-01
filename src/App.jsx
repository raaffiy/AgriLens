import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Module from './pages/Module';
import ModuleDetails from './pages/ModuleDetails';
import News from './pages/News';
import NewsDetails from './pages/NewsDetails';
import Quiz from './pages/Quiz';
import Forum from './pages/Forum';
import Auth from './pages/Auth';
import LensAI from './pages/LensAI';

function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/module" element={<Module />} />
          <Route path="/module/:id" element={<ModuleDetails />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:id" element={<NewsDetails />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/forum" element={<Forum />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/lens-ai" element={<LensAI />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
