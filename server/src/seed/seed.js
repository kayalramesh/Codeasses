const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const problemsData = [
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    statement: 'Given a sorted array of integers and a target value, return the index of the target if present, otherwise return -1.\n\n**Input format (stdin):**\n- Line 1: space-separated sorted array elements\n- Line 2: the key (target) to search for\n\n**Output format (stdout):**\n- A single integer: the 0-based index if found, or `-1` if not found.',
    constraints: '- 1 <= array.length <= 10^4\n- -10^4 <= array[i], target <= 10^4\n- The array is sorted in ascending order.',
    sampleTestCases: [
      { input: '2 5 8 12 16 23 38\n12', expectedOutput: '3', orderIndex: 1 }
    ],
    hiddenTestCases: [
      { input: '1 3 5 7 9 11\n1', expectedOutput: '0' },
      { input: '10 20 30 40 50\n50', expectedOutput: '4' },
      { input: '4 8 15 16 23 42\n10', expectedOutput: '-1' }
    ]
  },
  {
    slug: 'quick-sort',
    title: 'Quick Sort',
    difficulty: 'Medium',
    statement: 'Given an array of integers, sort it in ascending order using the Quick Sort algorithm.\n\n**Input format (stdin):**\n- Line 1: space-separated array elements to sort\n\n**Output format (stdout):**\n- One line: the space-separated sorted array.',
    constraints: '- 0 <= array.length <= 10^4\n- -10^5 <= array[i] <= 10^5',
    sampleTestCases: [
      { input: '64 34 25 12 22 11 90', expectedOutput: '11 12 22 25 34 64 90', orderIndex: 1 }
    ],
    hiddenTestCases: [
      { input: '5 1 4 2 8', expectedOutput: '1 2 4 5 8' },
      { input: '10 7 8 9 1 5', expectedOutput: '1 5 7 8 9 10' },
      { input: '3 3 2 1 5 4 4', expectedOutput: '1 2 3 3 4 4 5' }
    ]
  },
  {
    slug: 'matrix-multiplication',
    title: 'Matrix Multiplication',
    difficulty: 'Hard',
    statement: 'Given two matrices A and B, compute their product A × B.\n\n**Input format (stdin):**\n- Line 1: `r1 c1` (rows and columns of Matrix A)\n- Next `r1` lines: `c1` space-separated integers each (Matrix A)\n- Next line: `r2 c2` (rows and columns of Matrix B)\n- Next `r2` lines: `c2` space-separated integers each (Matrix B)\n\n**Output format (stdout):**\n- The resulting matrix, one row per line, space-separated integers.\n\nNote: `c1` must equal `r2` for multiplication to be valid.',
    constraints: '- 1 <= r1, c1, r2, c2 <= 100\n- -100 <= matrix elements <= 100\n- c1 == r2 (guaranteed)',
    sampleTestCases: [
      { input: '2 2\n1 2\n3 4\n2 2\n5 6\n7 8', expectedOutput: '19 22\n43 50', orderIndex: 1 }
    ],
    hiddenTestCases: [
      { input: '2 2\n2 0\n1 3\n2 2\n4 1\n2 5', expectedOutput: '8 2\n10 16' },
      { input: '2 3\n1 2 3\n4 5 6\n3 2\n7 8\n9 10\n11 12', expectedOutput: '58 64\n139 154' },
      { input: '2 2\n3 1\n2 4\n2 2\n1 2\n3 4', expectedOutput: '6 10\n14 20' }
    ]
  }
];

// ── Validation ──────────────────────────────────────────────────────
function validateSeedData(data) {
  for (const problem of data) {
    const allCases = [
      ...problem.sampleTestCases.map((tc, i) => ({ ...tc, label: `sample[${i}]` })),
      ...problem.hiddenTestCases.map((tc, i) => ({ ...tc, label: `hidden[${i}]` }))
    ];
    for (const tc of allCases) {
      if (!tc.input || tc.input.trim() === '') {
        throw new Error(`[SEED VALIDATION FAILED] Problem "${problem.title}" ${tc.label} has a blank/empty input.`);
      }
      if (!tc.expectedOutput || tc.expectedOutput.trim() === '') {
        throw new Error(`[SEED VALIDATION FAILED] Problem "${problem.title}" ${tc.label} has a blank/empty expectedOutput.`);
      }
    }
    console.log(`✓ Validated ${allCases.length} test cases for "${problem.title}"`);
  }
}

async function main() {
  // Validate before touching the database
  validateSeedData(problemsData);

  const bcrypt = require('bcrypt');
  const adminPasswordHash = await bcrypt.hash('admin', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@codeassess.com' },
    update: {},
    create: {
      name: 'Administrator',
      email: 'admin@codeassess.com',
      passwordHash: adminPasswordHash,
      role: 'admin'
    }
  });
  console.log(`Ensured admin user: ${admin.email}`);

  // Clear existing problems to recreate with updated test cases
  await prisma.problem.deleteMany();
  console.log('Cleared existing problems.');

  for (const pData of problemsData) {
    const problem = await prisma.problem.create({
      data: {
        slug: pData.slug,
        title: pData.title,
        difficulty: pData.difficulty,
        statement: pData.statement,
        constraints: pData.constraints,
        sampleTestCases: {
          create: pData.sampleTestCases
        },
        hiddenTestCases: {
          create: pData.hiddenTestCases
        }
      }
    });

    console.log(`Created problem: ${problem.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
