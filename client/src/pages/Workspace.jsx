import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronLeft, Loader2, CheckCircle, XCircle, RotateCcw } from 'lucide-react';
import { api } from '../api/api';

const LANGUAGE_BOILERPLATES = {
  python: `def solve():\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
};

export default function Workspace() {
  const { slug } = useParams();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');
  const [code, setCode] = useState(LANGUAGE_BOILERPLATES.python);
  const [activeTab, setActiveTab] = useState('Testcase');
  const [activeConsoleTab, setActiveConsoleTab] = useState('Testcase');
  const [results, setResults] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await api.problems.getBySlug(slug);
        setProblem(data);
        if (data && data.sampleTestCases) {
          // Initialize results with empty states for testcases
          setResults({ visibleResults: data.sampleTestCases.map(c => ({ caseId: c.id, input: c.input, expectedOutput: c.expectedOutput, actualOutput: '', passed: null })) });
        }
      } catch (err) {
        console.error(err);
      }
    };
    fetchProblem();
  }, [slug]);

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    setCode(LANGUAGE_BOILERPLATES[lang]);
  };

  const handleRun = async () => {
    setRunning(true);
    setActiveConsoleTab('Result');
    setVerdict(null);
    try {
      const data = await api.submissions.run({ problemId: problem.id, language, sourceCode: code });
      if (data.compileError) {
        setVerdict({ type: 'Compilation Error', message: data.compileError });
        setResults(null);
      } else {
        setResults({ visibleResults: data.results });
      }
    } catch (err) {
      setVerdict({ type: 'Error', message: err.message });
    } finally {
      setRunning(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setActiveConsoleTab('Result');
    setVerdict(null);
    try {
      const data = await api.submissions.submit({ problemId: problem.id, language, sourceCode: code });
      
      if (data.compileError) {
        setVerdict({ type: 'Compilation Error', message: data.compileError, stats: `${data.passedCount} / ${data.totalCount} test cases passed` });
        setResults(null);
      } else {
        setVerdict({ 
            type: data.verdict, 
            stats: `${data.passedCount} / ${data.totalCount} test cases passed` 
        });
        setResults({ visibleResults: data.visibleResults });
      }
    } catch (err) {
      setVerdict({ type: 'Error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  };

  if (!problem) return <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] text-white overflow-hidden">
      {/* Top Navbar */}
      <nav className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--background-panel)] shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold tracking-tight text-white hidden md:inline">CodeAssess</span>
          </Link>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRun} 
            disabled={running || submitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-[#2a3648] hover:bg-[#374151] rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {running ? <Loader2 className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4 text-green-400" />}
            Run
          </button>
          <button 
            onClick={handleSubmit}
            disabled={running || submitting}
            className="flex items-center gap-2 px-4 py-1.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] rounded text-sm font-medium transition-colors disabled:opacity-50"
          >
            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Submit
          </button>
        </div>
        <div className="w-24"></div> {/* Spacer for balance */}
      </nav>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden p-2 gap-2">
        {/* Left Pane - Problem */}
        <div className="flex-1 bg-[var(--background-panel)] rounded-lg border border-[var(--border)] flex flex-col overflow-hidden min-h-[300px]">
          <div className="flex bg-[#2a3648] border-b border-[var(--border)]">
            <button className={`px-4 py-2 text-sm font-medium ${activeTab === 'Description' ? 'text-white border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} onClick={() => setActiveTab('Description')}>Description</button>
          </div>
          <div className="flex-1 overflow-auto p-6 font-sans">
            <h1 className="text-2xl font-bold mb-2">{problem.title}</h1>
            <div className={`inline-block px-2 py-1 rounded text-xs font-semibold mb-6 bg-opacity-20 ${problem.difficulty === 'Easy' ? 'text-[var(--success)] bg-[var(--success)]' : problem.difficulty === 'Medium' ? 'text-yellow-500 bg-yellow-500' : 'text-[var(--error)] bg-[var(--error)]'}`}>
              {problem.difficulty}
            </div>
            
            <div className="prose prose-invert max-w-none text-gray-300">
              <p className="whitespace-pre-wrap leading-relaxed">{problem.statement}</p>
              
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-4">Examples</h3>
                {problem.sampleTestCases.map((tc, idx) => (
                  <div key={tc.id} className="mb-4">
                    <p className="font-medium text-sm mb-2 text-gray-400">Example {idx + 1}:</p>
                    <div className="bg-[#0d1117] p-4 rounded border border-[var(--border)] font-mono text-sm overflow-x-auto">
                      <div><span className="text-gray-500 select-none">Input: </span><br/>{tc.input}</div>
                      <div className="mt-2"><span className="text-gray-500 select-none">Output: </span><br/>{tc.expectedOutput}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <h3 className="text-lg font-semibold text-white mb-2">Constraints:</h3>
                <div className="bg-[#0d1117] p-4 rounded border border-[var(--border)] font-mono text-sm text-gray-300 whitespace-pre-wrap">
                  {problem.constraints}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Pane - Editor & Console */}
        <div className="flex-1 flex flex-col gap-2 min-h-[500px]">
          {/* Editor */}
          <div className="flex-[3] bg-[var(--background-panel)] rounded-lg border border-[var(--border)] flex flex-col overflow-hidden">
            <div className="h-10 flex items-center px-4 bg-[#2a3648] border-b border-[var(--border)] justify-between">
              <div className="flex items-center gap-4">
                <select 
                  className="bg-transparent text-sm text-gray-300 focus:outline-none cursor-pointer [&>option]:bg-[#2a3648] [&>option]:text-white"
                  value={language}
                  onChange={handleLanguageChange}
                >
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
                <button
                  onClick={() => {
                    if (window.confirm("Are you sure you want to reset your code to the initial template?")) {
                      setCode(LANGUAGE_BOILERPLATES[language]);
                    }
                  }}
                  className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                  title="Reset Code"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                value={code}
                onChange={(value) => setCode(value)}
                options={{ minimap: { enabled: false }, fontSize: 14, padding: { top: 16 } }}
              />
            </div>
          </div>

          {/* Console */}
          <div className="flex-[2] bg-[var(--background-panel)] rounded-lg border border-[var(--border)] flex flex-col overflow-hidden">
             <div className="flex bg-[#2a3648] border-b border-[var(--border)]">
                <button className={`px-4 py-2 text-sm font-medium ${activeConsoleTab === 'Testcase' ? 'text-white border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} onClick={() => setActiveConsoleTab('Testcase')}>Testcase</button>
                <button className={`px-4 py-2 text-sm font-medium flex items-center gap-2 ${activeConsoleTab === 'Result' ? 'text-white border-b-2 border-[var(--primary)]' : 'text-[var(--text-secondary)]'}`} onClick={() => setActiveConsoleTab('Result')}>
                    Result
                    {verdict && (
                        <span className={`w-2 h-2 rounded-full ${verdict.type === 'Accepted' ? 'bg-[var(--success)]' : 'bg-[var(--error)]'}`}></span>
                    )}
                </button>
             </div>
             <div className="flex-1 overflow-auto p-4">
                {activeConsoleTab === 'Testcase' ? (
                  <div className="flex gap-2 h-full">
                    {problem.sampleTestCases.map((tc, idx) => (
                      <div key={tc.id} className="flex-1 border border-[var(--border)] rounded overflow-hidden flex flex-col">
                        <div className="bg-[#2a3648] px-3 py-1 text-xs text-gray-400 font-medium">Case {idx + 1}</div>
                        <div className="p-3 font-mono text-sm text-gray-300 flex-1 overflow-auto whitespace-pre-wrap">{tc.input}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div>
                    {running || submitting ? (
                        <div className="flex items-center gap-3 text-gray-400 h-full justify-center mt-10">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Evaluating...</span>
                        </div>
                    ) : verdict && verdict.type === 'Compilation Error' ? (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--error)] mb-2">{verdict.type}</h3>
                            {verdict.stats && <p className="text-sm text-gray-400 mb-4">{verdict.stats}</p>}
                            <div className="bg-[#0d1117] p-4 rounded text-[var(--error)] font-mono text-sm whitespace-pre-wrap overflow-x-auto border border-[var(--error)] border-opacity-30">
                                {verdict.message}
                            </div>
                        </div>
                    ) : verdict && verdict.type === 'Error' ? (
                        <div>
                            <h3 className="text-xl font-bold text-[var(--error)] mb-2">System Error</h3>
                            <div className="bg-[#0d1117] p-4 rounded text-[var(--error)] font-mono text-sm whitespace-pre-wrap overflow-x-auto border border-[var(--error)] border-opacity-30">
                                {verdict.message}
                            </div>
                        </div>
                    ) : results ? (
                        <div>
                            {verdict && (
                                <div className="mb-6">
                                    <h3 className={`text-2xl font-bold mb-1 ${verdict.type === 'Accepted' ? 'text-[var(--success)]' : 'text-[var(--error)]'}`}>
                                        {verdict.type}
                                    </h3>
                                    {verdict.stats && <p className="text-sm font-medium text-gray-400">{verdict.stats}</p>}
                                </div>
                            )}
                            <div className="flex flex-col gap-6">
                                {results.visibleResults.map((res, idx) => (
                                    <div key={idx} className="border border-[var(--border)] rounded-lg overflow-hidden">
                                        <div className={`px-4 py-2 flex items-center gap-2 font-medium text-sm ${res.passed ? 'bg-[var(--success)] bg-opacity-10 text-[var(--success)] border-b border-[var(--success)] border-opacity-20' : res.passed === false ? 'bg-[var(--error)] bg-opacity-10 text-[var(--error)] border-b border-[var(--error)] border-opacity-20' : 'bg-[#2a3648] text-gray-400 border-b border-[var(--border)]'}`}>
                                            {res.passed ? <CheckCircle className="w-4 h-4" /> : res.passed === false ? <XCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                                            Case {idx + 1}
                                            {res.errorType && <span className="ml-2 px-2 py-0.5 bg-[var(--error)] text-white text-xs rounded-full">{res.errorType}</span>}
                                        </div>
                                        <div className="p-4 bg-[#0d1117] flex flex-col gap-4 font-mono text-sm">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1 select-none">Input</div>
                                                <div className="bg-[#1f2937] p-2 rounded text-gray-300 whitespace-pre-wrap">{res.input}</div>
                                            </div>
                                            {res.passed !== null && (
                                                <>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1 select-none">Expected Output</div>
                                                        <div className="bg-[#1f2937] p-2 rounded text-gray-300 whitespace-pre-wrap">{res.expectedOutput}</div>
                                                    </div>
                                                    <div>
                                                        <div className="text-xs text-gray-500 mb-1 select-none">Actual Output</div>
                                                        <div className={`p-2 rounded whitespace-pre-wrap ${res.passed ? 'bg-[#1f2937] text-gray-300' : 'bg-[var(--error)] bg-opacity-20 text-red-200 border border-[var(--error)] border-opacity-30'}`}>
                                                            {res.actualOutput || <span className="text-gray-500 italic">No output</span>}
                                                        </div>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="text-center text-gray-500 mt-10">Run or Submit your code to see results here.</div>
                    )}
                  </div>
                )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
