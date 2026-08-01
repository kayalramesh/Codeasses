const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getProblems = async (req, res) => {
  try {
    const problems = await prisma.problem.findMany({
      select: {
        id: true,
        slug: true,
        title: true,
        difficulty: true
      }
    });

    // Also get submission status for the current user
    const submissions = await prisma.submission.findMany({
      where: { userId: req.user.id },
      select: { problemId: true, verdict: true }
    });

    const statusMap = {};
    for (const sub of submissions) {
      if (sub.verdict === 'Accepted') {
        statusMap[sub.problemId] = 'Solved';
      } else if (!statusMap[sub.problemId]) {
        statusMap[sub.problemId] = 'Attempted';
      }
    }

    const response = problems.map(p => ({
      ...p,
      status: statusMap[p.id] || 'Not Attempted'
    }));

    res.json(response);
  } catch (error) {
    console.error('Get problems error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const getProblem = async (req, res) => {
  try {
    const { slug } = req.params;
    
    const problem = await prisma.problem.findUnique({
      where: { slug },
      include: {
        sampleTestCases: {
          orderBy: { orderIndex: 'asc' }
        }
      }
    });

    if (!problem) {
      return res.status(404).json({ error: 'Problem not found' });
    }

    // Omit hidden test cases from being fetched at all
    res.json(problem);
  } catch (error) {
    console.error('Get problem error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getProblems, getProblem };
