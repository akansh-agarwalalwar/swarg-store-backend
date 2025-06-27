const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const adminRoutes = require('./routes/adminRoutes');
const subAdminRoutes = require('./routes/subAdminRoutes');
const postedIDRoutes = require('./routes/postedIDRoutes');
const youtubeVideoRoutes = require('./routes/youtubeVideoRoutes');
const telegramLinkRoutes = require('./routes/telegramLinkRoutes');
const path = require("path");
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
  console.error('Error: MONGO_URL not set in .env file');
  process.exit(1);
}

// MongoDB connection
mongoose.connect(MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', (error) => console.error('MongoDB connection error:', error));
db.once('open', () => console.log('Connected to MongoDB'));

app.use(cors());
app.use(express.json());

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get('/', (req, res) => {
  res.send('Welcome to the Swarg Store Backend API!');
});

app.use('/api/admin', adminRoutes);
app.use('/api/subadmin', subAdminRoutes);
app.use('/api/ids', postedIDRoutes);
app.use('/api/youtube-videos', youtubeVideoRoutes);
app.use('/api/telegram-links', telegramLinkRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
