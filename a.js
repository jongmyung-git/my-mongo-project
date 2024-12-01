mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB 연결 성공'))
    .catch(err => {
        console.error('MongoDB 연결 실패:', err);
        process.exit(1);  // 실패시 서버 종료
    });




