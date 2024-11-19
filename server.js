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
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


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

// 업로드 폴더 확인 및 생성
const uploadDir = path.resolve('uploads'); // 루트 디렉토리에서 'uploads' 폴더로 지정
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// 파일 업로드 설정 (multer 사용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads'); // 파일이 저장될 경로
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname); // 파일명 중복 방지
  },
});

const allowedFileTypes = ['image/jpeg', 'image/png', 'application/pdf'];
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('지원하지 않는 파일 형식입니다.'));
    }
  },
});

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public')); // 'public' 폴더에서 정적 파일 제공
app.use('/uploads', express.static('uploads')); // 'uploads' 폴더에서 업로드된 파일 제공

// API 라우팅 (게시글 목록 조회)
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); // 최신 게시글부터 정렬
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: '서버 에러 발생' });
  }
});

// 게시글 작성 (파일 업로드 처리 포함)
app.post('/posts', upload.single('file'), async (req, res) => {
  try {
    const { author, title, content } = req.body;
    const file = req.file ? req.file.filename : ''; // 파일이 있으면 파일명 저장
    const newPost = new Post({ author, title, content, file });
    await newPost.save(); // 새 게시글 저장
    res.status(201).json(newPost); // 게시글 생성 성공
  } catch (err) {
    res.status(500).json({ message: '서버 에러 발생' });
  }
});

// 게시글 상세 조회 (조회수 증가 포함)
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } }, // 조회수 증가
      { new: true }, // 업데이트 후의 데이터를 반환
    );
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json(post);
  } catch (err) {
    res.status(500).json({ message: '서버 에러 발생' });
  }
});

// 게시글 삭제
app.delete('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id); // 게시글 삭제
    if (!post) {
      return res.status(404).json({ message: '게시글을 찾을 수 없습니다.' });
    }
    res.json({ message: '삭제 완료' });
  } catch (err) {
    res.status(500).json({ message: '서버 에러 발생' });
  }
});

// 에러 처리 미들웨어
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: err.message || '서버 에러 발생' });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




