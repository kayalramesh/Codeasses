import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/api';
import { LogOut, Download, ShieldCheck } from 'lucide-react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [downloading, setDownloading] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleDownloadExcel = async () => {
    try {
      setDownloading(true);
      const blob = await api.admin.downloadExcel();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'results.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Failed to download Excel', err);
      alert('Failed to download Excel file.');
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--background)] text-white flex flex-col">
      <nav className="flex items-center justify-between p-4 px-6 md:px-12 border-b border-[var(--border)] bg-[var(--background-panel)]">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-[var(--primary)]" />
          <Link to="/" className="text-xl font-bold tracking-tight text-white">CodeAssess Admin</Link>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-[var(--text-secondary)] hidden md:inline">Admin: <span className="text-white font-medium">{user?.name}</span></span>
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 text-sm text-[var(--text-secondary)] hover:text-white transition-colors bg-[var(--background)] border border-[var(--border)] rounded">
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-2xl w-full mx-auto p-6 py-12 flex flex-col items-center justify-center">
        <div className="bg-[var(--background-panel)] p-8 rounded-xl border border-[var(--border)] text-center w-full shadow-lg">
          <ShieldCheck className="w-16 h-16 text-[var(--primary)] mx-auto mb-6 opacity-80" />
          <h1 className="text-3xl font-bold mb-4">Admin Dashboard</h1>
          <p className="text-[var(--text-secondary)] mb-8 max-w-md mx-auto">
            Welcome to the CodeAssess admin portal. You can securely download all student assessment results as an Excel spreadsheet.
          </p>
          
          <button
            onClick={handleDownloadExcel}
            disabled={downloading}
            className={`flex items-center justify-center gap-3 w-full py-4 rounded-lg text-white font-medium transition-all ${
              downloading 
                ? 'bg-gray-600 cursor-not-allowed opacity-70' 
                : 'bg-green-600 hover:bg-green-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
            }`}
          >
            <Download className={`w-5 h-5 ${downloading ? 'animate-bounce' : ''}`} />
            {downloading ? 'Generating Excel...' : 'Download Results as Excel'}
          </button>
        </div>
      </main>
    </div>
  );
}
