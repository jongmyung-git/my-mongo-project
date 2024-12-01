const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const Post = require('./models/Post'); // 모델 업데이트 필요
require('dotenv').config();
const fs = require('fs');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

// 정적 파일 제공
const staticPath = path.join(__dirname, 'public', 'images');
app.use('/images', express.static(staticPath));

// 서버 설정
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB 연결
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch(err => console.log('MongoDB 연결 실패:', err));

// CORS 설정
app.use(cors({
  origin: process.env.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));

// 미들웨어
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// uploads 폴더 생성
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Multer 설정
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 게시글 목록 조회
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).send('Error retrieving posts');
  }
});

// 게시글 작성
app.post('/posts', upload.single('file'), async (req, res) => {
  try {
    const { author, title, content, password } = req.body;

    if (!password) {
      return res.status(400).send("비밀번호는 필수입니다.");
    }

    const newPost = new Post({
      author,
      title,
      content,
      password, // 비밀번호 저장
      file: req.file ? req.file.filename : null,
      date: new Date(),
      views: 0
    });

    await newPost.save();
    io.emit('newPost', newPost);
    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).send('Error creating post');
  }
});

// 게시글 수정
app.put('/posts/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { author, title, content } = req.body;

    const updateData = {
      author,
      title,
      content,
      date: new Date(),
    };

    if (req.file) {
      updateData.file = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Error updating post');
  }
});

// 게시글 삭제 (비밀번호 확인 포함)
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { password } = req.body;

    if (!password) {
      return res.status(400).send("비밀번호가 입력되지 않았습니다.");
    }

    const post = await Post.findById(id);
    if (!post) {
      return res.status(404).send("게시물이 존재하지 않습니다.");
    }

    if (post.password !== password) {
      return res.status(403).send("비밀번호가 일치하지 않습니다.");
    }

    await Post.findByIdAndDelete(id);
    res.send("게시물이 삭제되었습니다.");
  } catch (err) {
    res.status(500).send('게시물 삭제 중 오류가 발생했습니다.');
  }
});

// 게시글 상세 조회
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.json(post);
  } catch (err) {
    res.status(500).send('Error retrieving post');
  }
});

// 서버 실행
server.listen(port, () => {
  console.log(`Server running on ${process.env.PORT || 'http://localhost:5000'}`);
});



