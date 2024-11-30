const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const Post = require('./models/Post'); // Post 모델
require('dotenv').config(); // .env 파일 로드
const fs = require('fs'); // 파일 시스템 모듈
const cors = require('cors'); // CORS 미들웨어 추가

const app = express();
const port = process.env.PORT || 5000;

// 정적 파일 제공
const staticPath = path.join(__dirname, 'public', 'images');
console.log(`Serving static files from: ${staticPath}`);
app.use('/images', express.static(staticPath));

// 서버 설정 (http와 socket.io 통합)
const server = http.createServer(app);
const io = socketIo(server);

// MongoDB 연결 (환경 변수에서 URI 가져오기)
const mongoURI = process.env.MONGO_URI; // 환경 변수 이름 통일
mongoose
  .connect(mongoURI)
  .then(() => console.log('MongoDB 연결 성공'))
  .catch((err) => console.error('MongoDB 연결 실패:', err.message));

// CORS 설정
const clientUrl = process.env.CLIENT_URL; // 환경 변수에서 클라이언트 URL 가져오기
app.use(
  cors({
    origin: clientUrl,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true, // 인증 정보 허용
  })
);

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// **uploads 폴더가 없는 경우 생성**
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Multer 설정 (파일 업로드용)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir); // 'uploads' 폴더에 저장
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}${path.extname(file.originalname)}`); // 고유 파일 이름 생성
  },
});
const upload = multer({ storage });

// Socket.io 연결 로그
io.on('connection', (socket) => {
  console.log('클라이언트 연결됨:', socket.id);

  socket.on('disconnect', () => {
    console.log('클라이언트 연결 해제됨:', socket.id);
  });
});

// 게시글 목록 조회 API
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 }); // 최신 글 순 정렬
    res.json(posts);
  } catch (err) {
    console.error('게시글 조회 중 오류:', err.message);
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
      views: 0,
    });

    // 새 게시글 저장
    await newPost.save();

    // 실시간 알림: 새 글 작성 시 모든 클라이언트에게 전송
    io.emit('newPost', newPost);

    res.status(201).json(newPost);
  } catch (err) {
    console.error('게시글 작성 중 오류:', err.message);
    res.status(500).send('Error creating post');
  }
});

// 게시글 수정 API
app.put('/posts/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { author, title, content } = req.body;

    const updateData = { author, title, content, date: new Date() };
    if (req.file) {
      updateData.file = req.file.filename;
    }

    const updatedPost = await Post.findByIdAndUpdate(id, updateData, { new: true });
    res.json(updatedPost);
  } catch (err) {
    console.error('게시글 수정 중 오류:', err.message);
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
    console.error('조회수 업데이트 중 오류:', err.message);
    res.status(500).send('Error updating views');
  }
});

// 게시글 삭제 API
app.delete('/posts/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const post = await Post.findByIdAndDelete(id);

    // 파일 삭제 처리
    if (post && post.file) {
      const filePath = path.join(uploadsDir, post.file);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    res.send('Post deleted');
  } catch (err) {
    console.error('게시글 삭제 중 오류:', err.message);
    res.status(500).send('Error deleting post');
  }
});

// 게시글 검색 API
app.get('/posts/search', async (req, res) => {
  try {
    const query = req.query.query;
    const filteredPosts = await Post.find({
      $or: [
        { title: { $regex: query, $options: 'i' } },
        { content: { $regex: query, $options: 'i' } },
      ],
    });

    res.json(filteredPosts);
  } catch (err) {
    console.error('게시글 검색 중 오류:', err.message);
    res.status(500).send('Error searching posts');
  }
});

// 게시글 상세 조회 API
app.get('/posts/:id', async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).send('Post not found');
    }
    res.json(post);
  } catch (err) {
    console.error('게시글 상세 조회 중 오류:', err.message);
    res.status(500).send('Error retrieving post');
  }
});

// 서버 실행
server.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});





