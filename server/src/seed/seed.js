const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const problemsData = [
  {
    slug: 'quick-sort',
    title: 'Quick Sort',
    difficulty: 'Medium',
    statement: 'Given an array of integers, return the array sorted in ascending order. You should implement the quick sort algorithm. Your function must take an array of integers as input and print space-separated sorted integers as output.',
    constraints: '- 0 <= array.length <= 10^4\n- -10^5 <= array[i] <= 10^5',
    sampleTestCases: [
      { input: '5 3 8 1', expectedOutput: '1 3 5 8', orderIndex: 1 },
      { input: '', expectedOutput: '', orderIndex: 2 },
      { input: '2 2 2', expectedOutput: '2 2 2', orderIndex: 3 }
    ],
    hiddenTestCases: [
      { input: '1 2 3 4 5', expectedOutput: '1 2 3 4 5' },
      { input: '5 4 3 2 1', expectedOutput: '1 2 3 4 5' },
      { input: '42', expectedOutput: '42' },
      { input: '0 -5 10 -100', expectedOutput: '-100 -5 0 10' },
      // I will only include 5 hidden test cases per problem here to keep the seed script concise
      { input: '1 3 3 7 1', expectedOutput: '1 1 3 3 7' }
    ]
  },
  {
    slug: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    statement: 'Given a sorted array of integers and a target value, return the index of the target if present, otherwise return -1. Your function must take a space-separated string where the first number is the target, followed by the array elements. It must print the index.',
    constraints: '- 1 <= array.length <= 10^4\n- -10^4 <= array[i], target <= 10^4',
    sampleTestCases: [
      { input: '5\n1 3 5 7 9', expectedOutput: '2', orderIndex: 1 },
      { input: '4\n1 3 5 7 9', expectedOutput: '-1', orderIndex: 2 }
    ],
    hiddenTestCases: [
      { input: '1\n1 3 5 7 9', expectedOutput: '0' },
      { input: '9\n1 3 5 7 9', expectedOutput: '4' },
      { input: '10\n1 3 5 7 9', expectedOutput: '-1' },
      { input: '42\n42', expectedOutput: '0' },
      { input: '42\n', expectedOutput: '-1' }
    ]
  },
  {
    slug: 'matrix-multiplication',
    title: 'Matrix Multiplication',
    difficulty: 'Medium',
    statement: 'Given two matrices A (m×n) and B (n×p), return their product A×B, an m×p matrix.\nInput format:\nm n p\nfollowed by m lines of A\nfollowed by n lines of B.\nOutput should be m lines of the resulting matrix.',
    constraints: '- 1 <= m, n, p <= 100\n- -100 <= matrix elements <= 100',
    sampleTestCases: [
      { input: '2 2 2\n1 2\n3 4\n5 6\n7 8', expectedOutput: '19 22\n43 50', orderIndex: 1 }
    ],
    hiddenTestCases: [
      { input: '1 1 1\n5\n6', expectedOutput: '30' },
      { input: '2 3 2\n1 2 3\n4 5 6\n7 8\n9 10\n11 12', expectedOutput: '58 64\n139 154' },
      { input: '2 2 2\n1 0\n0 1\n42 73\n10 11', expectedOutput: '42 73\n10 11' },
      { input: '2 2 2\n0 0\n0 0\n1 1\n1 1', expectedOutput: '0 0\n0 0' },
      { input: '1 2 1\n1 -1\n-1\n1', expectedOutput: '-2' }
    ]
  }
];

async function main() {
  for (const pData of problemsData) {
    const existing = await prisma.problem.findUnique({ where: { slug: pData.slug } });
    if (existing) {
      console.log(`Problem ${pData.slug} already exists. Skipping.`);
      continue;
    }

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
