const path = require('path');
const dotenv = require('dotenv');

// .env sits in the project folder next to .env.example
dotenv.config({ path: path.join(__dirname, '..', '.env') });

const { open } = require('./db');
const { createApp } = require('./app');

const PORT = process.env.PORT || 5000;

// Initialize SQLite database connection (creates + seeds it on first run)
const db = open();
db.ready
  .then(() => {
    console.log('Connected to the SQLite database.');
    createApp(db).listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error opening database', err.message);
    process.exit(1);
  });
