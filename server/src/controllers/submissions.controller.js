const { PrismaClient } = require('@prisma/client');
const { runTestCases } = require('../services/judge.service');
const PDFDocument = require('pdfkit');

const prisma = new PrismaClient();

const getTimeLimitMs = (difficulty) => {
  switch (difficulty) {
    case 'Hard': return 75 * 60 * 1000;
    case 'Medium': return 50 * 60 * 1000;
    default: return 25 * 60 * 1000;
  }
};

const getAttempt = async (req, res) => {
  try {
    const { problemId } = req.params;
    const userId = req.user.id;

    let submission = await prisma.submission.findFirst({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' }
    });

    if (!submission) {
      submission = await prisma.submission.create({
        data: {
          userId,
          problemId,
          status: 'in_progress'
        }
      });
    }

    res.json(submission);
  } catch (error) {
    console.error('getAttempt error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const recordOffense = async (req, res) => {
  try {
    const { problemId, sourceCode, language } = req.body;
    const userId = req.user.id;

    let submission = await prisma.submission.findFirst({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' }
    });

    if (!submission || submission.status === 'completed') {
      return res.status(400).json({ error: 'Attempt already completed or not found' });
    }

    const newOffenseCount = submission.offenseCount + 1;
    const updateData = { offenseCount: newOffenseCount };

    if (newOffenseCount >= 2) {
      updateData.status = 'completed';
      updateData.autoSubmitted = true;
      updateData.sourceCode = sourceCode || '';
      updateData.language = language || 'python';
      
      const problem = await prisma.problem.findUnique({
        where: { id: problemId },
        include: { hiddenTestCases: true, sampleTestCases: true }
      });
      
      if (sourceCode && language && problem) {
         try {
           const allTestCases = [...(problem.sampleTestCases || []), ...(problem.hiddenTestCases || [])];
           const { results } = await runTestCases(language, sourceCode, allTestCases);
           let passedCount = 0;
           for(const r of results) { if(r.passed) passedCount++; }
           updateData.marksObtained = passedCount * 25;
           updateData.totalMarks = 100; // 4 * 25
         } catch(e) {
           console.error("Auto submit grading error", e);
         }
      }
    }

    submission = await prisma.submission.update({
      where: { id: submission.id },
      data: updateData
    });

    res.json(submission);
  } catch (error) {
    console.error('recordOffense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const runCode = async (req, res) => {
  try {
    const { problemId, language, sourceCode } = req.body;
    const userId = req.user.id;

    const submission = await prisma.submission.findFirst({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' }
    });

    if (submission && submission.status === 'completed') {
      return res.status(403).json({ error: 'Attempt is already completed. Cannot run code.' });
    }

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

    if (submission) {
      const timeLimitMs = getTimeLimitMs(problem.difficulty);
      const elapsedTime = Date.now() - new Date(submission.createdAt).getTime();
      if (elapsedTime > timeLimitMs + 10000) { // 10s grace period
        return res.status(403).json({ error: 'Time limit expired. Cannot run code.' });
      }
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
    const userId = req.user.id;

    let submission = await prisma.submission.findFirst({
      where: { userId, problemId },
      orderBy: { createdAt: 'desc' }
    });

    if (submission && submission.status === 'completed') {
      return res.status(403).json({ error: 'Attempt is already completed. Cannot submit.' });
    }

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

    if (submission) {
      const timeLimitMs = getTimeLimitMs(problem.difficulty);
      const elapsedTime = Date.now() - new Date(submission.createdAt).getTime();
      if (elapsedTime > timeLimitMs + 60000) { // 60s grace period for auto-submit
        return res.status(403).json({ error: 'Time limit expired. Cannot submit.' });
      }
    }

    // Run against sample test cases
    const { results: visibleResults, compileError: visibleCompileError } = await runTestCases(language, sourceCode, problem.sampleTestCases);

    const totalCount = problem.sampleTestCases.length + problem.hiddenTestCases.length;
    let updateData = {
        language,
        sourceCode,
        status: 'completed',
        totalMarks: 100
    };

    if (visibleCompileError) {
      updateData.verdict = 'Compilation Error';
      updateData.passedCount = 0;
      updateData.totalCount = totalCount;
      updateData.marksObtained = 0;
      
      submission = await prisma.submission.update({
        where: { id: submission.id },
        data: updateData
      });
      return res.json({ verdict: 'Compilation Error', passedCount: 0, totalCount, visibleResults, compileError: visibleCompileError });
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

    let marksObtained = 0;
    // Run against hidden test cases
    const { results: hiddenResults, compileError: hiddenCompileError } = await runTestCases(language, sourceCode, problem.hiddenTestCases);
    
    for (const result of hiddenResults) {
        if (result.passed) {
            passedCount++;
        } else {
            allPassed = false;
            if(verdict === 'Accepted') verdict = result.errorType || 'Wrong Answer';
        }
    }
    
    marksObtained = passedCount * 25;
    
    updateData.verdict = verdict;
    updateData.passedCount = passedCount;
    updateData.totalCount = totalCount;
    updateData.marksObtained = marksObtained;

    submission = await prisma.submission.update({
        where: { id: submission.id },
        data: updateData
    });

    res.json({
      verdict,
      passedCount,
      totalCount,
      visibleResults,
      marksObtained,
      totalMarks: updateData.totalMarks
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

const downloadPdf = async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Ensure the user can only download their own pdf unless they are an admin
    if (req.user.id !== userId && req.user.role !== 'admin') {
       return res.status(403).json({ error: 'Forbidden' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        submissions: {
          where: { status: 'completed' },
          include: { problem: true }
        }
      }
    });

    if (!user) return res.status(404).json({ error: 'User not found' });

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=results-${user.name.replace(/\s+/g, '_')}.pdf`);
    doc.pipe(res);

    doc.fontSize(20).text('CodeAssess - Assessment Results', { align: 'center' });
    doc.moveDown();
    doc.fontSize(14).text(`Student Name: ${user.name}`);
    doc.text(`Email: ${user.email}`);
    doc.moveDown();

    let totalObtained = 0;
    let totalPossible = 0;

    user.submissions.forEach((sub, index) => {
      doc.fontSize(12).text(`${index + 1}. ${sub.problem.title}`, { underline: true });
      doc.text(`Status: ${sub.autoSubmitted ? 'Auto-Submitted (Violation)' : 'Manually Submitted'}`);
      doc.text(`Marks: ${sub.marksObtained} / ${sub.totalMarks}`);
      doc.text(`Submitted At: ${new Date(sub.createdAt).toLocaleString()}`);
      doc.moveDown();

      totalObtained += sub.marksObtained;
      totalPossible += sub.totalMarks;
    });

    doc.moveDown();
    doc.fontSize(16).text(`Total Marks: ${totalObtained} / ${totalPossible}`, { align: 'right' });

    doc.end();
  } catch (error) {
    console.error('Download PDF error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAttempt, recordOffense, runCode, submitCode, downloadPdf };
