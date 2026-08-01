const express = require('express');
const cors = require('cors');

const authRoutes = require('../server/src/routes/auth.routes');
const problemRoutes = require('../server/src/routes/problems.routes');
const submissionRoutes = require('../server/src/routes/submissions.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/', submissionRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

module.exports = app;
