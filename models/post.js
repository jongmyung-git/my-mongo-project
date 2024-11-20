const mongoose = require('mongoose');

// 게시글 스키마 정의
const PostSchema = new mongoose.Schema({
  author: { 
    type: String, 
    required: true  // 작성자 (필수 필드)
  },
  title: { 
    type: String, 
    required: true  // 제목 (필수 필드)
  },
  content: { 
    type: String, 
    required: true  // 내용 (필수 필드)
  },
  file: { 
    type: String, 
    default: null   // 업로드된 파일 (옵션, 없을 수도 있음)
  },
  date: { 
    type: Date, 
    default: Date.now  // 작성일 (기본값: 현재 시간)
  },
  views: { 
    type: Number, 
    default: 0  // 조회수 (기본값: 0)
  }
});

// Post 모델 생성
const Post = mongoose.model('Post', PostSchema);

// 모델을 다른 파일에서 사용하도록 내보내기
module.exports = Post;
