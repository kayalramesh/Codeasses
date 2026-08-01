const { PrismaClient } = require('@prisma/client');
const { runTestCases } = require('../services/judge.service');

const prisma = new PrismaClient();

const runCode = async (req, res) => {
  try {
    const { problemId, language, sourceCode } = req.body;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        sampleTestCases: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    const { results, compileError } = await runTestCases(language, sourceCode, problem.sampleTestCases);

    res.json({ results, compileError });
  } catch (error) {
    console.error('Run code error:', error.stack || error);
    if (error.message === 'execution_service_unavailable') {
      res.status(500).json({ error: 'execution_service_unavailable', message: 'Could not reach the code execution service.' });
    } else {
      res.status(500).json({ error: 'internal_server_error', message: 'An unexpected error occurred during execution.' });
    }
  }
};

const submitCode = async (req, res) => {
  try {
    const { problemId, language, sourceCode } = req.body;

    const problem = await prisma.problem.findUnique({
      where: { id: problemId },
      include: {
        sampleTestCases: { orderBy: { orderIndex: 'asc' } },
        hiddenTestCases: true
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Run against sample test cases to gather visible results
    const { results: visibleResults, compileError: visibleCompileError } = await runTestCases(language, sourceCode, problem.sampleTestCases);

    if (visibleCompileError) {
      // If it fails to compile, it automatically fails
      const submission = await prisma.submission.create({
        data: {
          userId: req.user.id,
          problemId: problem.id,
          language,
          sourceCode,
          verdict: 'Compilation Error',
          passedCount: 0,
          totalCount: problem.sampleTestCases.length + problem.hiddenTestCases.length
        }
      });
      return res.json({ verdict: 'Compilation Error', passedCount: 0, totalCount: submission.totalCount, visibleResults, compileError: visibleCompileError });
    }

    let allPassed = true;
    let passedCount = visibleResults.filter(r => r.passed).length;
    let verdict = 'Accepted';

    for (const result of visibleResults) {
        if (!result.passed) {
            allPassed = false;
            verdict = result.errorType || 'Wrong Answer';
            break;
        }
    }

    // Run against hidden test cases
    if (allPassed) {
        const { results: hiddenResults, compileError: hiddenCompileError } = await runTestCases(language, sourceCode, problem.hiddenTestCases);
        
        for (const result of hiddenResults) {
            if (result.passed) {
                passedCount++;
            } else {
                allPassed = false;
                verdict = result.errorType || 'Wrong Answer';
            }
        }
    }

    const totalCount = problem.sampleTestCases.length + problem.hiddenTestCases.length;

    const submission = await prisma.submission.create({
      data: {
        userId: req.user.id,
        problemId: problem.id,
        language,
        sourceCode,
        verdict,
        passedCount,
        totalCount
      }
    });

    // We never expose hidden inputs/outputs
    res.json({
      verdict,
      passedCount,
      totalCount,
      visibleResults
    });
  } catch (error) {
    console.error('Submit code error:', error.stack || error);
    if (error.message === 'execution_service_unavailable') {
      res.status(500).json({ error: 'execution_service_unavailable', message: 'Could not reach the code execution service.' });
    } else {
      res.status(500).json({ error: 'internal_server_error', message: 'An unexpected error occurred during execution.' });
    }
  }
};

module.exports = { runCode, submitCode };
