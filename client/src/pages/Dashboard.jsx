import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { LogOut, CheckCircle, Circle, Clock, Download } from 'lucide-react';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const data = await api.problems.getAll();
        setProblems(data);
      } catch (error) {
        console.error('Failed to load problems', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProblems();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadPdf = async () => {
    try {
      const blob = await api.submissions.downloadPdf(user.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `results-${user.name.replace(/\s+/g, '_')}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download PDF', err);
      alert('Failed to download results. Make sure you have completed at least one problem.');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Solved': return <CheckCircle className="w-5 h-5 text-[var(--success)]" />;
      case 'Attempted': return <Clock className="w-5 h-5 text-yellow-500" />;
      default: return <Circle className="w-5 h-5 text-[var(--border)]" />;
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'text-[var(--success)]';
      case 'Medium': return 'text-yellow-500';
      case 'Hard': return 'text-[var(--error)]';
      default: return 'text-white';
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      <nav className="flex items-center justify-between p-4 px-6 md:px-12 border-b border-[var(--border)] bg-[var(--background-panel)]">
        <Link to="/" className="text-xl font-bold tracking-tight text-white">CodeAssess</Link>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-secondary)] hidden md:inline">Hello, <span className="text-white font-medium">{user?.name}</span></span>
          <button
            onClick={handleDownloadPdf}
            className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--primary)] hover:text-white transition-colors bg-[var(--background)] border border-[var(--primary)] rounded hover:bg-[var(--primary)]"
            title="Download your results as PDF"
          >
            <Download className="w-4 h-4" />
            <span className="hidden md:inline">Download Result (PDF)</span>
          </button>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors bg-[var(--background)] border border-[var(--border)] rounded">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl w-full mx-auto p-6 py-12">
        <h1 className="text-3xl font-bold mb-8">Problem Set</h1>
        
        {loading ? (
          <div className="text-center text-[var(--text-secondary)] py-12">Loading problems...</div>
        ) : (
          <div className="bg-[var(--background-panel)] rounded-xl border border-[var(--border)] overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[#2a3648]">
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Status</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)] w-full">Title</th>
                  <th className="p-4 font-semibold text-[var(--text-secondary)]">Difficulty</th>
                </tr>
              </thead>
              <tbody>
                {problems.map(problem => (
                  <tr key={problem.id} className="border-b border-[var(--border)] hover:bg-[#2a3648] transition-colors group cursor-pointer" onClick={() => navigate(`/workspace/${problem.slug}`)}>
                    <td className="p-4 pl-6">{getStatusIcon(problem.status)}</td>
                    <td className="p-4">
                      <span className="font-medium group-hover:text-[var(--primary)] transition-colors">{problem.title}</span>
                    </td>
                    <td className={`p-4 font-medium ${getDifficultyColor(problem.difficulty)}`}>{problem.difficulty}</td>
                  </tr>
                ))}
                {problems.length === 0 && (
                  <tr>
                    <td colSpan="3" className="p-8 text-center text-[var(--text-secondary)]">No problems found. Did you run the seed script?</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
