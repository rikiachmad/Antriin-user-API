const express = require('express');
const connectDB = require('./config/db');

const app = express();

// connect DB
connectDB();

// Init Middleware
app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.json({ msg: 'Welcome to Antriin API' }));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/queues', require('./routes/queues'));
app.use('/api/admins', require('./routes/admins'));
app.use('/api/authAdmins', require('./routes/authAdmins'));
app.use('/api/status', require('./routes/status'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
