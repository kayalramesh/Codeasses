import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import { Play, Send, ChevronLeft, Loader2, CheckCircle, XCircle, RotateCcw, AlertTriangle, Lock, ShieldAlert, Timer } from 'lucide-react';
import { api } from '../api/api';
import { useAuth } from '../context/AuthContext';

import { memo } from 'react';

const GENERIC_BOILERPLATES = {
  python: `import sys\n\ndef solve():\n    input_data = sys.stdin.read().split()\n    # Write your code here\n    pass\n\nif __name__ == '__main__':\n    solve()`,
  java: `import java.util.Scanner;\n\npublic class Main {\n    public static void main(String[] args) {\n        Scanner scanner = new Scanner(System.in);\n        // Write your code here\n    }\n}`,
  c: `#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}`,
  cpp: `#include <iostream>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}`
};

const PROBLEM_BOILERPLATES = {
  'binary-search': {
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\n')
    arr = list(map(int, lines[0].split()))
    key = int(lines[1])
    # Implement binary search here
    # Print the index if found, or -1
    print(-1)

if __name__ == '__main__':
    solve()`,
    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        String[] parts = scanner.nextLine().trim().split(" ");
        int[] arr = new int[parts.length];
        for (int i = 0; i < parts.length; i++) {
            arr[i] = Integer.parseInt(parts[i]);
        }
        int key = Integer.parseInt(scanner.nextLine().trim());
        // Implement binary search here
        // Print the index if found, or -1
        System.out.println(-1);
    }
}`,
    c: `#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main() {
    char line[100000];
    fgets(line, sizeof(line), stdin);
    int arr[10005], n = 0;
    char *tok = strtok(line, " \n");
    while (tok) {
        arr[n++] = atoi(tok);
        tok = strtok(NULL, " \n");
    }
    int key;
    scanf("%d", &key);
    // Implement binary search here
    // Print the index if found, or -1
    printf("-1\\n");
    return 0;
}`,
    cpp: `#include <iostream>
#include <sstream>
#include <vector>
using namespace std;

int main() {
    string line;
    getline(cin, line);
    istringstream iss(line);
    vector<int> arr;
    int val;
    while (iss >> val) arr.push_back(val);
    int key;
    cin >> key;
    // Implement binary search here
    // Print the index if found, or -1
    cout << -1 << endl;
    return 0;
}`
  },
  'quick-sort': {
    python: `import sys

def solve():
    arr = list(map(int, sys.stdin.read().split()))
    # Implement quick sort here
    # Print space-separated sorted array
    print(*arr)

if __name__ == '__main__':
    solve()`,
    java: `import java.util.Scanner;
import java.util.ArrayList;

public class Main {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        ArrayList<Integer> arr = new ArrayList<>();
        while (scanner.hasNextInt()) {
            arr.add(scanner.nextInt());
        }
        // Implement quick sort here
        // Print space-separated sorted array
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < arr.size(); i++) {
            if (i > 0) sb.append(" ");
            sb.append(arr.get(i));
        }
        System.out.println(sb.toString());
    }
}`,
    c: `#include <stdio.h>

int main() {
    int arr[10005], n = 0, val;
    while (scanf("%d", &val) == 1) {
        arr[n++] = val;
    }
    // Implement quick sort here
    // Print space-separated sorted array
    for (int i = 0; i < n; i++) {
        if (i > 0) printf(" ");
        printf("%d", arr[i]);
    }
    printf("\\n");
    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    vector<int> arr;
    int val;
    while (cin >> val) {
        arr.push_back(val);
    }
    // Implement quick sort here
    // Print space-separated sorted array
    for (int i = 0; i < (int)arr.size(); i++) {
        if (i > 0) cout << " ";
        cout << arr[i];
    }
    cout << endl;
    return 0;
}`
  },
  'matrix-multiplication': {
    python: `import sys

def solve():
    lines = sys.stdin.read().strip().split('\n')
    idx = 0
    r1, c1 = map(int, lines[idx].split()); idx += 1
    A = []
    for i in range(r1):
        A.append(list(map(int, lines[idx].split()))); idx += 1
    r2, c2 = map(int, lines[idx].split()); idx += 1
    B = []
    for i in range(r2):
        B.append(list(map(int, lines[idx].split()))); idx += 1
    # Multiply A x B and print the result matrix
    # Each row on its own line, space-separated
    pass

if __name__ == '__main__':
    solve()`,
    java: `import java.util.Scanner;

public class Main {
    public static void main(String[] args) {
        Scanner sc = new Scanner(System.in);
        int r1 = sc.nextInt(), c1 = sc.nextInt();
        int[][] A = new int[r1][c1];
        for (int i = 0; i < r1; i++)
            for (int j = 0; j < c1; j++)
                A[i][j] = sc.nextInt();
        int r2 = sc.nextInt(), c2 = sc.nextInt();
        int[][] B = new int[r2][c2];
        for (int i = 0; i < r2; i++)
            for (int j = 0; j < c2; j++)
                B[i][j] = sc.nextInt();
        // Multiply A x B and print the result matrix
        // Each row on its own line, space-separated
    }
}`,
    c: `#include <stdio.h>

int main() {
    int r1, c1;
    scanf("%d %d", &r1, &c1);
    int A[100][100];
    for (int i = 0; i < r1; i++)
        for (int j = 0; j < c1; j++)
            scanf("%d", &A[i][j]);
    int r2, c2;
    scanf("%d %d", &r2, &c2);
    int B[100][100];
    for (int i = 0; i < r2; i++)
        for (int j = 0; j < c2; j++)
            scanf("%d", &B[i][j]);
    // Multiply A x B and print the result matrix
    // Each row on its own line, space-separated
    return 0;
}`,
    cpp: `#include <iostream>
#include <vector>
using namespace std;

int main() {
    int r1, c1;
    cin >> r1 >> c1;
    vector<vector<int>> A(r1, vector<int>(c1));
    for (int i = 0; i < r1; i++)
        for (int j = 0; j < c1; j++)
            cin >> A[i][j];
    int r2, c2;
    cin >> r2 >> c2;
    vector<vector<int>> B(r2, vector<int>(c2));
    for (int i = 0; i < r2; i++)
        for (int j = 0; j < c2; j++)
            cin >> B[i][j];
    // Multiply A x B and print the result matrix
    // Each row on its own line, space-separated
    return 0;
}`
  }
};

const formatTime = (ms) => {
  if (ms === null) return '--:--';
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  if (h > 0) return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
};

const ExamTimer = memo(({ createdAt, difficulty, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!createdAt) return;

    let timeLimitMs = 25 * 60 * 1000;
    if (difficulty === 'Medium') timeLimitMs = 50 * 60 * 1000;
    if (difficulty === 'Hard') timeLimitMs = 75 * 60 * 1000;

    const expiryTime = new Date(createdAt).getTime() + timeLimitMs;

    const updateTimer = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiryTime - now);
      setTimeLeft(remaining);

      if (remaining === 0) {
        clearInterval(timerId);
        onExpire();
      }
    };

    updateTimer();
    const timerId = setInterval(updateTimer, 1000);

    return () => clearInterval(timerId);
  }, [createdAt, difficulty, onExpire]);

  if (timeLeft === null) return (
    <div className="flex items-center gap-2 px-3 py-1 rounded border border-[var(--border)] text-gray-300 bg-[#2a3648] font-mono text-sm font-bold">
      <Timer className="w-4 h-4" />
      --:--
    </div>
  );

  return (
    <div className={`flex items-center gap-2 px-3 py-1 rounded border font-mono text-sm font-bold ${timeLeft <= 300000 ? 'border-red-500 text-red-500 animate-pulse bg-red-500 bg-opacity-10' : 'border-[var(--border)] text-gray-300 bg-[#2a3648]'}`}>
      <Timer className="w-4 h-4" />
      {formatTime(timeLeft)}
    </div>
  );
});


export default function Workspace() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [language, setLanguage] = useState('python');

  const [activeTab, setActiveTab] = useState('Testcase');
  const [activeConsoleTab, setActiveConsoleTab] = useState('Testcase');
  const [results, setResults] = useState(null);
  const [verdict, setVerdict] = useState(null);
  const [running, setRunning] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Exam mode state
  const [isInitializing, setIsInitializing] = useState(true);
  const [attemptStatus, setAttemptStatus] = useState('in_progress');
  const [offenseCount, setOffenseCount] = useState(0);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showAutoSubmitModal, setShowAutoSubmitModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [marksObtained, setMarksObtained] = useState(null);
  const [totalMarks, setTotalMarks] = useState(null);
  const [attemptCreatedAt, setAttemptCreatedAt] = useState(null); // Fix Timer bug

  const editorRef = useRef(null);
  const problemIdRef = useRef(null);
  const codeRef = useRef(''); // Removed code state dependency
  const languageRef = useRef(language);
  const offenseCountRef = useRef(0);
  const attemptStatusRef = useRef('in_progress');
  const createdAtRef = useRef(null);

  // Keep refs in sync
  useEffect(() => { languageRef.current = language; }, [language]);
  useEffect(() => { offenseCountRef.current = offenseCount; }, [offenseCount]);
  useEffect(() => { attemptStatusRef.current = attemptStatus; }, [attemptStatus]);
  useEffect(() => { createdAtRef.current = attemptCreatedAt; }, [attemptCreatedAt]);

  // Toast helper
  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3000);
  };

  useEffect(() => {
    const fetchProblem = async () => {
      try {
        const data = await api.problems.getBySlug(slug);
        setProblem(data);
        problemIdRef.current = data.id;
        if (data && data.sampleTestCases) {
          setResults({ visibleResults: data.sampleTestCases.map(c => ({ caseId: c.id, input: c.input, expectedOutput: c.expectedOutput, actualOutput: '', passed: null })) });
        }

        // Fetch or create the attempt
        const attempt = await api.submissions.getAttempt(data.id);
        setAttemptStatus(attempt.status);
        setOffenseCount(attempt.offenseCount);
        setAttemptCreatedAt(attempt.createdAt);
        if (attempt.status === 'completed') {
          if (attempt.sourceCode) {
             codeRef.current = attempt.sourceCode;
             if (editorRef.current) editorRef.current.setValue(attempt.sourceCode);
          }
          if (attempt.language) setLanguage(attempt.language);
          setMarksObtained(attempt.marksObtained);
          setTotalMarks(attempt.totalMarks);
        } else {
          // Setup boilerplate
          const boilerplates = PROBLEM_BOILERPLATES[slug] || GENERIC_BOILERPLATES;
          codeRef.current = boilerplates['python'];
          if (editorRef.current) editorRef.current.setValue(boilerplates['python']);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsInitializing(false);
      }
    };
    fetchProblem();
  }, [slug]);

  // -------------------------------------------------------------------
  // TAB-SWITCH / BLUR DETECTION (Section 1 of the prompt)
  // -------------------------------------------------------------------
  const handleVisibilityChange = useCallback(async () => {
    if (document.hidden && attemptStatusRef.current === 'in_progress' && problemIdRef.current) {
      try {
        const result = await api.submissions.recordOffense({
          problemId: problemIdRef.current,
          sourceCode: codeRef.current,
          language: languageRef.current
        });
        setOffenseCount(result.offenseCount);

        if (result.status === 'completed') {
          // Auto-submitted
          setAttemptStatus('completed');
          setMarksObtained(result.marksObtained);
          setTotalMarks(result.totalMarks);
          setShowAutoSubmitModal(true);
        } else {
          // First offense → show warning
          setShowWarningModal(true);
        }
      } catch (err) {
        console.error('Failed to record offense', err);
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [handleVisibilityChange]);

  // -------------------------------------------------------------------
  // COPY / PASTE / CUT / RIGHT-CLICK PREVENTION (Section 3)
  // -------------------------------------------------------------------
  useEffect(() => {
    if (attemptStatus === 'completed') return;

    const blockClipboard = (e) => {
      // Only block inside the workspace (not the whole app)
      e.preventDefault();
      showToast('Copy/paste is disabled during the assessment.');
    };

    const blockContextMenu = (e) => {
      e.preventDefault();
    };

    const blockKeyShortcuts = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['c', 'v', 'x'].includes(e.key.toLowerCase())) {
        e.preventDefault();
        showToast('Copy/paste is disabled during the assessment.');
      }
    };

    document.addEventListener('copy', blockClipboard);
    document.addEventListener('cut', blockClipboard);
    document.addEventListener('paste', blockClipboard);
    document.addEventListener('contextmenu', blockContextMenu);
    document.addEventListener('keydown', blockKeyShortcuts);

    return () => {
      document.removeEventListener('copy', blockClipboard);
      document.removeEventListener('cut', blockClipboard);
      document.removeEventListener('paste', blockClipboard);
      document.removeEventListener('contextmenu', blockContextMenu);
      document.removeEventListener('keydown', blockKeyShortcuts);
    };
  }, [attemptStatus]);

  // -------------------------------------------------------------------
  // Monaco editor mount — disable copy/paste actions inside Monaco
  // -------------------------------------------------------------------
  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;

    if (attemptStatus !== 'completed') {
      // Override clipboard actions
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyC, () => {
        showToast('Copy is disabled during the assessment.');
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyV, () => {
        showToast('Paste is disabled during the assessment.');
      });
      editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyX, () => {
        showToast('Cut is disabled during the assessment.');
      });
    }
  };

  const handleLanguageChange = (e) => {
    const lang = e.target.value;
    setLanguage(lang);
    const boilerplates = PROBLEM_BOILERPLATES[slug] || GENERIC_BOILERPLATES;
    codeRef.current = boilerplates[lang];
    if (editorRef.current) editorRef.current.setValue(boilerplates[lang]);
  };

  const handleRun = async () => {
    if (attemptStatusRef.current === 'completed') return;
    setRunning(true);
    setActiveConsoleTab('Result');
    setVerdict(null);
    try {
      const data = await api.submissions.run({ problemId: problemIdRef.current, language: languageRef.current, sourceCode: codeRef.current });
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

  const handleSubmit = useCallback(async () => {
    if (attemptStatusRef.current === 'completed') return;
    setSubmitting(true);
    setActiveConsoleTab('Result');
    setVerdict(null);
    try {
      const data = await api.submissions.submit({ problemId: problemIdRef.current, language: languageRef.current, sourceCode: codeRef.current });
      
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

      // Mark attempt as completed
      setAttemptStatus('completed');
      setMarksObtained(data.marksObtained);
      setTotalMarks(data.totalMarks);
    } catch (err) {
      setVerdict({ type: 'Error', message: err.message });
    } finally {
      setSubmitting(false);
    }
  }, []);

  const isCompleted = attemptStatus === 'completed';

  if (isInitializing || !problem) return <div className="min-h-screen bg-[var(--background)] text-white flex items-center justify-center">Loading...</div>;

  return (
    <div className="h-screen flex flex-col bg-[var(--background)] text-white overflow-hidden">
      {/* Warning Modal — 1st offense */}
      {showWarningModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[var(--background-panel)] border border-yellow-500 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
            <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-yellow-400 mb-4">Warning</h2>
            <p className="text-gray-300 mb-6">
              Switching tabs during the assessment is not allowed. If you do this again, your test will be <strong className="text-white">automatically submitted</strong>.
            </p>
            <button
              onClick={() => setShowWarningModal(false)}
              className="px-6 py-3 bg-yellow-500 hover:bg-yellow-600 text-black font-bold rounded-lg transition-colors"
            >
              I Understand
            </button>
          </div>
        </div>
      )}

      {/* Auto-Submit Modal — 2nd offense */}
      {showAutoSubmitModal && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center p-4">
          <div className="bg-[var(--background-panel)] border border-red-500 rounded-xl p-8 max-w-md w-full shadow-2xl text-center">
            <ShieldAlert className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-red-400 mb-4">Test Auto-Submitted</h2>
            <p className="text-gray-300 mb-6">
              Your test has been <strong className="text-white">automatically submitted</strong> due to repeated tab switching. You can no longer edit your code.
            </p>
            <Link
              to="/dashboard"
              className="inline-block px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Return to Dashboard
            </Link>
          </div>
        </div>
      )}

      {/* Toast message for copy/paste attempts */}
      {toastMessage && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-yellow-600 text-black px-6 py-3 rounded-lg font-medium shadow-lg animate-pulse">
          {toastMessage}
        </div>
      )}

      {/* Top Navbar */}
      <nav className="h-14 flex items-center justify-between px-4 border-b border-[var(--border)] bg-[var(--background-panel)] shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/dashboard" className="text-[var(--text-secondary)] hover:text-white flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-5 h-5" />
            <span className="font-semibold tracking-tight text-white hidden md:inline">CodeAssess</span>
          </Link>
          {!isCompleted && problem && attemptCreatedAt && (
            <ExamTimer 
              createdAt={attemptCreatedAt} 
              difficulty={problem.difficulty} 
              onExpire={handleSubmit} 
            />
          )}
        </div>

        {isCompleted ? (
          <div className="flex items-center gap-3 text-yellow-400 font-medium text-sm">
            <Lock className="w-4 h-4" />
            This assessment has been submitted and can no longer be edited.
          </div>
        ) : (
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
        )}

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
                  disabled={isCompleted}
                >
                  <option value="python">Python 3</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                </select>
                {!isCompleted && (
                  <button
                    onClick={() => {
                      if (window.confirm("Are you sure you want to reset your code to the initial template?")) {
                        const boilerplates = PROBLEM_BOILERPLATES[slug] || GENERIC_BOILERPLATES;
                        codeRef.current = boilerplates[language];
                        if (editorRef.current) editorRef.current.setValue(boilerplates[language]);
                      }
                    }}
                    className="text-gray-400 hover:text-white transition-colors flex items-center gap-1 text-sm"
                    title="Reset Code"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
              </div>
              {isCompleted && (
                <span className="text-xs text-yellow-400 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> Read-only
                </span>
              )}
            </div>
            <div className="flex-1">
              <Editor
                height="100%"
                language={language === 'c' || language === 'cpp' ? 'cpp' : language}
                theme="vs-dark"
                defaultValue={codeRef.current}
                onChange={(value) => { if (!isCompleted) codeRef.current = value; }}
                onMount={handleEditorDidMount}
                options={{ 
                  minimap: { enabled: false }, 
                  fontSize: 14, 
                  padding: { top: 16 },
                  readOnly: isCompleted,
                  domReadOnly: isCompleted
                }}
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
                            {/* Show marks if completed */}
                            {isCompleted && marksObtained !== null && (
                              <div className="mb-6 p-4 bg-[#0d1117] border border-[var(--border)] rounded-lg">
                                <p className="text-lg font-bold">
                                  Score: <span className={marksObtained === 100 ? 'text-[var(--success)]' : marksObtained >= 50 ? 'text-yellow-400' : 'text-[var(--error)]'}>{marksObtained}</span> / {totalMarks} marks
                                </p>
                                <p className="text-sm text-gray-400 mt-1">
                                  {marksObtained / 25} / 4 hidden test cases passed — {marksObtained} / 100 marks
                                </p>
                              </div>
                            )}
                            <div className="flex flex-col gap-6">
                                {results.visibleResults.map((res, idx) => (
                                    <div key={idx} className="border border-[var(--border)] rounded-lg overflow-hidden">
                                        <div className={`px-4 py-2 flex items-center gap-2 font-medium text-sm ${res.passed ? 'bg-[var(--success)] bg-opacity-10 text-[var(--success)] border-b border-[var(--success)] border-opacity-20' : res.passed === false ? 'bg-[var(--error)] bg-opacity-10 text-[var(--error)] border-b border-[var(--error)] border-opacity-20' : 'bg-[#2a3648] text-gray-400 border-b border-[var(--border)]'}`}>
                                            {res.passed ? <CheckCircle className="w-4 h-4" /> : res.passed === false ? <XCircle className="w-4 h-4" /> : null}
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
                    ) : isCompleted && marksObtained !== null ? (
                      <div className="mt-4">
                        <div className="p-4 bg-[#0d1117] border border-[var(--border)] rounded-lg">
                          <p className="text-lg font-bold">
                            Score: <span className={marksObtained === 100 ? 'text-[var(--success)]' : marksObtained >= 50 ? 'text-yellow-400' : 'text-[var(--error)]'}>{marksObtained}</span> / {totalMarks} marks
                          </p>
                          <p className="text-sm text-gray-400 mt-1">
                            {marksObtained / 25} / 4 hidden test cases passed — {marksObtained} / 100 marks
                          </p>
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
