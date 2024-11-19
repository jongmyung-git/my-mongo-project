// 1. dotenv 패키지 로드 (환경변수를 읽어오기 위해)
require('dotenv').config();

// 2. mongoose 패키지 로드 (MongoDB와 연결을 위해)
const mongoose = require('mongoose');
const express = require('express');
const app = express();

// 3. MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// 4. Express.js 서버 설정
app.get('/', (req, res) => {
    res.send('Hello, MongoDB and Express.js!');
});

// 5. 서버 시작
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
