import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Code, CheckCircle, Zap, TrendingUp } from 'lucide-react';

export default function LandingPage() {
  const { token } = useAuth();

  return (
    <div className="min-h-screen bg-[var(--background)] text-white font-sans flex flex-col">
      <nav className="flex items-center justify-between p-6 border-b border-[var(--border)]">
        <div className="text-xl font-bold tracking-tight">CodeAssess</div>
        <div className="hidden md:flex gap-6 items-center text-sm font-medium">
          <a href="#features" className="hover:text-[var(--primary)] transition-colors">Features</a>
          <a href="#about" className="hover:text-[var(--primary)] transition-colors">About</a>
          <a href="#contact" className="hover:text-[var(--primary)] transition-colors">Contact</a>
        </div>
        <div className="flex gap-4 items-center">
          {token ? (
            <Link to="/dashboard" className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md font-medium transition-colors">
              Dashboard
            </Link>
          ) : (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Student Login</Link>
              <Link to="/admin/login" className="text-sm font-medium hover:text-[var(--primary)] transition-colors">Admin Login</Link>
              <Link to="/register" className="px-4 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded-md text-sm font-medium transition-colors">Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-24 bg-gradient-to-b from-[var(--background)] to-[var(--background-panel)]">
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 max-w-3xl leading-tight">
            CodeAssess
          </h1>
          <p className="text-lg md:text-xl text-[var(--text-secondary)] mb-10 max-w-2xl">
            Practice core algorithms and get instantly graded against hidden test cases.
          </p>
          <Link to={token ? "/dashboard" : "/register"} className="px-8 py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-lg rounded-md font-bold transition-transform hover:scale-105">
            Start Practicing
          </Link>
        </section>

        <section id="features" className="py-20 px-6 md:px-12">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-bold mb-12 text-center">Core Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { icon: <Code className="w-8 h-8 text-[var(--primary)] mb-4" />, title: 'Multi-language', desc: 'Support for Python, Java, C, and C++ out of the box.' },
                { icon: <Zap className="w-8 h-8 text-[var(--primary)] mb-4" />, title: 'Instant Feedback', desc: 'Run your code against sample test cases in real-time.' },
                { icon: <CheckCircle className="w-8 h-8 text-[var(--primary)] mb-4" />, title: 'Rigorous Grading', desc: 'Submit against hidden test cases to truly verify your logic.' },
                { icon: <TrendingUp className="w-8 h-8 text-[var(--primary)] mb-4" />, title: 'Progress Tracking', desc: 'Keep track of your attempted and solved problems.' }
              ].map((f, i) => (
                <div key={i} className="bg-[var(--background-panel)] p-6 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-colors">
                  {f.icon}
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-[var(--text-secondary)] text-sm">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="about" className="py-20 px-6 md:px-12 bg-[var(--background-panel)]">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">About CodeAssess</h2>
            <p className="text-[var(--text-secondary)] text-lg mb-4">
              CodeAssess exists to help instructors verify conceptual understanding, not rote memorization. It was built specifically for classroom and assessment use, providing a clean, distraction-free environment.
            </p>
            <p className="text-[var(--text-secondary)] text-lg">
              By separating sample validation from final submission, students are encouraged to think critically about edge cases rather than trial-and-error programming.
            </p>
          </div>
        </section>

        <section id="contact" className="py-20 px-6 md:px-12">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-8 text-center">Contact Us</h2>
            <form className="flex flex-col gap-4" onSubmit={(e) => { e.preventDefault(); alert('Message sent!'); }}>
              <input type="text" placeholder="Name" className="p-3 bg-[var(--background-panel)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--primary)]" required />
              <input type="email" placeholder="Email" className="p-3 bg-[var(--background-panel)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--primary)]" required />
              <textarea placeholder="Message" rows="4" className="p-3 bg-[var(--background-panel)] border border-[var(--border)] rounded focus:outline-none focus:border-[var(--primary)] resize-none" required></textarea>
              <button type="submit" className="px-4 py-3 bg-[var(--primary)] hover:bg-[var(--primary-hover)] font-bold rounded mt-2">Send Message</button>
            </form>
          </div>
        </section>
      </main>

      <footer className="p-6 border-t border-[var(--border)] flex flex-col md:flex-row justify-between items-center text-[var(--text-secondary)] text-sm">
        <div>&copy; {new Date().getFullYear()} CodeAssess. All rights reserved.</div>
        <div className="flex gap-4 mt-4 md:mt-0">
          <a href="#features" className="hover:text-white">Features</a>
          <a href="#about" className="hover:text-white">About</a>
          <a href="#contact" className="hover:text-white">Contact</a>
        </div>
      </footer>
    </div>
  );
}
