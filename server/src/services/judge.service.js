const JUDGE0_API_URL = "https://ce.judge0.com/submissions?base64_encoded=false&wait=true";

const languageMap = {
  python: 71,
  java: 62,
  c: 50,
  cpp: 54
};

const executeCode = async (language, sourceCode, input) => {
  const language_id = languageMap[language];
  if (!language_id) {
    throw new Error('Unsupported language');
  }

  const payload = {
    language_id,
    source_code: sourceCode,
    stdin: input
  };

  try {
    const response = await fetch(JUDGE0_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Judge0 API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Execution service error:', error);
    throw new Error('execution_service_unavailable');
  }
};

const normalizeString = (str) => {
  if (!str) return '';
  return str.trim().replace(/\r\n/g, '\n');
};

const runTestCases = async (language, sourceCode, testCases) => {
  const results = [];
  let compileError = null;
  let runtimeError = null;

  for (const testCase of testCases) {
    let execResult;
    try {
      execResult = await executeCode(language, sourceCode, testCase.input);
    } catch (error) {
      throw error; // Re-throw execution service errors
    }
    
    // Status 6 is Compilation Error
    if (execResult.status.id === 6) {
      compileError = execResult.compile_output || execResult.message || 'Compilation Error';
      break; 
    }

    // Status 5 is Time Limit Exceeded
    if (execResult.status.id === 5) {
      results.push({
        caseId: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: execResult.stdout,
        passed: false,
        errorType: 'Time Limit Exceeded'
      });
      continue;
    }

    // Status 7-12 are Runtime Errors
    if (execResult.status.id >= 7 && execResult.status.id <= 12) {
      results.push({
        caseId: testCase.id,
        input: testCase.input,
        expectedOutput: testCase.expectedOutput,
        actualOutput: execResult.stdout,
        passed: false,
        errorType: 'Runtime Error',
        stderr: execResult.stderr || execResult.message || 'Runtime Error'
      });
      continue;
    }

    const runOutput = execResult.stdout;
    const actualOutput = normalizeString(runOutput);
    const expectedOutput = normalizeString(testCase.expectedOutput);
    
    const passed = actualOutput === expectedOutput && execResult.status.id === 3;

    let errorType = null;
    if (!passed && execResult.status.id === 3) {
       errorType = 'Wrong Answer';
    } else if (execResult.status.id !== 3) {
       errorType = execResult.status.description;
    }

    results.push({
      caseId: testCase.id,
      input: testCase.input,
      expectedOutput: testCase.expectedOutput,
      actualOutput: runOutput,
      passed,
      errorType
    });
  }

  return { results, compileError };
};

module.exports = { runTestCases };
