const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const path = require('path');
const userRoutes = require('./routes/users');
const groupRoutes = require('./routes/groups');
const postRoutes = require('./routes/posts')

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, '../readios-client')));

mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch(err => console.error("❌ DB connection error:", err));

app.get('/', (req, res) => {
  res.send('🚀 Server is running!');
});

app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`✅ Server on port ${PORT}`));

app.use('/api/groups', groupRoutes);
