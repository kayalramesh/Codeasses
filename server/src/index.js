const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/auth.routes');
const problemRoutes = require('./routes/problems.routes');
const submissionRoutes = require('./routes/submissions.routes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/problems', problemRoutes);
app.use('/api/', submissionRoutes); // run and submit endpoints

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
