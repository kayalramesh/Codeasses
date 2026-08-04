const { PrismaClient } = require('@prisma/client');
const exceljs = require('exceljs');

const prisma = new PrismaClient();

const getAllResults = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { status: 'completed' },
      include: {
        user: true,
        problem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(submissions);
  } catch (error) {
    console.error('getAllResults error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

const downloadExcel = async (req, res) => {
  try {
    const submissions = await prisma.submission.findMany({
      where: { status: 'completed' },
      include: {
        user: true,
        problem: true
      },
      orderBy: { createdAt: 'desc' }
    });

    const workbook = new exceljs.Workbook();
    const worksheet = workbook.addWorksheet('Results');

    worksheet.columns = [
      { header: 'Name', key: 'name', width: 25 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Marks', key: 'marks', width: 15 }
    ];

    submissions.forEach(sub => {
      worksheet.addRow({
        name: sub.user.name,
        email: sub.user.email,
        marks: `${sub.marksObtained}`
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename=results.xlsx');

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error('downloadExcel error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { getAllResults, downloadExcel };
