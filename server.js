require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 5000;

// MongoDB 연결
if (!process.env.MONGODB_URI) {
  console.error('Error: MONGODB_URI 환경 변수가 설정되지 않았습니다.');
  process.exit(1); // 환경 변수 누락 시 프로세스 종료
}

mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // MongoDB 연결 실패 시 프로세스 종료
  });

// 게시글 데이터 모델 설정
const postSchema = new mongoose.Schema({
  author: { type: String, required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  date: { type: Date, default: Date.now },
  file: String,
  views: { type: Number, default: 0 },
});

const Post = mongoose.model('Post', postSchema);

// 업로드 폴더 설정
const uploadDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage });

// 미들웨어 설정
app.use(cors({
  origin: '*', // 특정 도메인만 허용하려면 ['http://example.com']로 변경
  methods: ['GET', 'POST', 'DELETE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir)); // 업로드 파일 제공

// API 라우팅

// 게시글 목록 조회
app.get('/posts', async (req, res, next) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    next(err);
  }
});

// 게시글 작성
app.post('/posts', upload.single('file'), async (req, res, next) => {
  try {
    const { author, title, content } = req.body;
    const file = req.file ? req.file.filename : null;
    const newPost = new Post({ author, title, content, file });
    const savedPost = await newPost.save();
    res.status(201).json(savedPost);
  } catch (err) {
    next(err);
  }
});

// 게시글 상세 조회 (조회수 증가 포함)
app.get('/posts/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);
  } catch (err) {
    next(err);
  }
});

// 게시글 삭제
app.delete('/posts/:id', async (req, res, next) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json({ message: '게시글이 삭제되었습니다.' });
  } catch (err) {
    next(err);
  }
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    message: err.message || '서버에서 에러가 발생했습니다.',
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});







