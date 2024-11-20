const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const Post = require('./models/Post');  // Post 모델을 사용합니다.

const app = express();
const port = process.env.PORT || 5000;

// 서버 설정 (http와 socket.io 통합)
const server = http.createServer(app);
const io = socketIo(server);  // socket.io 연결

// MongoDB 연결
mongoose.connect('mongodb://your_mongo_url', { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error:', err));

// 미들웨어 설정
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Multer 설정 (파일 업로드)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storage });

// 게시글 목록 조회 API
app.get('/posts', async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
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

    const updatedPost = await Post.findByIdAndUpdate(id, {
      author,
      title,
      content,
      file: req.file ? req.file.filename : undefined,
      date: new Date()
    }, { new: true });

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
  console.log(`Server running on http://localhost:${port}`);
});












