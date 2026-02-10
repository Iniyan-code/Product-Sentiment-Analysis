import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './components/Home';
import Dashboard from './components/Dashboard';

const API_BASE_URL = 'http://localhost:5000';

const AppContent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Disconnected');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const location = useLocation();

  // Toggle Dark Mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Initial connection check
  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/status`);
        if (response.ok) {
          const statusData = await response.json();
          setStatus(statusData.message || 'Connected');
        } else {
          throw new Error();
        }
      } catch {
        setStatus('Backend Offline');
        setIsDemoMode(true);
      }
    };
    if (!isDemoMode) checkStatus();
    else setStatus('Demo Mode Active');
  }, [isDemoMode]);

  // Handle URL query on mount/refresh
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get('q');
    if (query && data.length === 0 && !loading) {
      handleSearch(query);
    }
  }, [location.search]);

  // Handle URL query on mount/refresh
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const query = params.get('q');
    if (query && data.length === 0 && !loading) {
      handleSearch(query);
    }
  }, []);

  // Search Handler
  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);
    setData([]); // Clear previous data ("only that project" requirement)

    if (isDemoMode) {
      setTimeout(() => {
        const mockData = generateDemoData(query);
        setData(mockData);
        setLoading(false);
      }, 1500);
      return;
    }

    try {
      // 1. Trigger Scrape
      const scrapeRes = await fetch(`${API_BASE_URL}/api/scrape`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });

      if (!scrapeRes.ok) {
        const errData = await scrapeRes.json();
        throw new Error(errData.error || 'Scrape failed');
      }

      // 2. Fetch Updated Data
      const dataRes = await fetch(`${API_BASE_URL}/api/data`);
      if (!dataRes.ok) throw new Error('Failed to fetch data');

      const result = await dataRes.json();
      // Filter primarily on client side to ensure we show mostly relevant results 
      // (Backend stores everything, but user requested "only that project")
      // A robust way would be filtering by query, but simple scraping appends.
      // We will assume the backend returns all, and we show all (as per previous logic) 
      // OR better, we trust the database just has what we scraped + history.
      // User asked: "dont include any other products".
      // We can filter by product name similarity or just rely on the 'latest' fetch if we cleared DB (we didn't).
      // Let's filter by the query string in the result!
      const relevantData = result.filter(item =>
        item.product.toLowerCase().includes(query.toLowerCase())
      ).map(d => ({
        ...d,
        score: parseFloat(d.score || 0).toFixed(2)
      }));

      setData(relevantData);

    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = (query) => [
    { product: `${query} Pro`, review: "Excellent quality and fast shipping.", sentiment: "Positive", score: "0.85", source: "Amazon" },
    { product: `${query} Lite`, review: "Not worth the price, broke easily.", sentiment: "Negative", score: "-0.60", source: "Flipkart" },
    { product: `${query} Standard`, review: "It does the job, decent value.", sentiment: "Neutral", score: "0.10", source: "Amazon" },
    { product: `${query} Max`, review: "Amazing features, highly recommended!", sentiment: "Positive", score: "0.92", source: "Flipkart" },
    { product: `${query} Mini`, review: "Too small and battery life is bad.", sentiment: "Negative", score: "-0.30", source: "Amazon" }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-200">
      <Navbar
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        isDemoMode={isDemoMode}
        setIsDemoMode={setIsDemoMode}
        status={status}
      />
      <main className="max-w-7xl mx-auto p-4">
        <Routes>
          <Route
            path="/"
            element={<Home onSearch={handleSearch} loading={loading} error={error} />}
          />
          <Route
            path="/analysis"
            element={<Dashboard data={data} loading={loading} />}
          />
        </Routes>
      </main>
    </div>
  );
};

const App = () => (
  <Router>
    <AppContent />
  </Router>
);

export default App;