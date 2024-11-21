const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const Post = require('./models/Post');
require('dotenv').config();  // .env 파일을 로드하여 환경 변수 사용
const fs = require('fs');  // 파일 시스템 모듈
const cors = require('cors');  // CORS 미들웨어 추가

const app = express();
const port = process.env.PORT || 5000;

// 서버 설정 (http와 socket.io 통합)
const server = http.createServer(app);
const io = socketIo(server);  // socket.io 연결

// MongoDB 연결 (기본 설정을 사용)
const mongoURI = process.env.MONGODB_URI;  // .env에서 MongoDB URI 가져오기
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// CORS 설정 (클라이언트 URL을 환경 변수로 설정)
const clientUrl = process.env.CLIENT_URL;  // .env에서 클라이언트 URL 가져오기
app.use(cors({
  origin: clientUrl,  // 클라이언트의 URL만 허용
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true  // 쿠키 등 인증 정보를 허용하려면 true로 설정
}));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// public 폴더를 정적 파일 경로로 설정
app.use(express.static(path.join(__dirname, 'public')));  // public 폴더에서 정적 파일을 서빙

// **uploads 폴더가 없는 경우 생성**
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
}

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // 파일을 'uploads' 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // 고유한 파일명으로 저장
  }
});
const upload = multer({ storage: storage });

// 게시글 목록 조회 API
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });  // 최신 글 순으로 정렬
    res.json(posts);
  } catch (err) {
    res.status(500).send('Error retrieving posts');
  }
});

// 게시글 작성 API (실시간 업데이트)
app.post('/posts', upload.single('file'), async (req, res) => {
  try {
    const { author, title, content } = req.body;
    const newPost = new Post({
      author,
      title,
      content,
      file: req.file ? req.file.filename : null,
      date: new Date(),
      views: 0
    });

    // 새 게시글 저장
    await newPost.save();

    // 새 글을 작성한 후, 실시간으로 모든 클라이언트에게 알림
    io.emit('newPost', newPost);

    res.status(201).json(newPost);
  } catch (err) {
    res.status(500).send('Error creating post');
  }
});

// 게시글 수정 API
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

    // 파일이 업로드된 경우에만 파일 정보를 업데이트
    if (req.file) {
      updateData.file = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });

    res.json(updatedPost);
  } catch (err) {
    res.status(500).send('Error updating post');
  }
});

// 게시글 조회수 증가 API
app.put('/posts/:id/views', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findById(id);

    if (!post) {
      return res.status(404).send('Post not found');
    }

    post.views += 1;
    await post.save();

    res.json(post);
  } catch (err) {
    res.status(500).send('Error updating views');
  }
});

// 게시글 삭제 API
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await Post.findByIdAndDelete(id);
    res.send('Post deleted');
  } catch (err) {
    res.status(500).send('Error deleting post');
  }
});

// 검색 기능 API
app.get('/posts/search', async (req, res) => {
  try {
    const query = req.query.query;
    const filteredPosts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } }
      ]
    });

    res.json(filteredPosts);
  } catch (err) {
    res.status(500).send('Error searching posts');
  }
});

// 서버 실행 (http 서버와 socket.io 연결)
server.listen(port, () => {
  console.log(`Server running on ${process.env.PORT || 'http://localhost:5000'}`);
});

