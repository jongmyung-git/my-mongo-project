// 현재 보고 있는 페이지와 글의 ID 저장 변수
let currentPage = 1;
let currentPostId; // 현재 보고 있는 글의 ID 저장 변수

// 서버 URL (로컬 서버 주소)
const SERVER_URL = 'https://my-mongo-project.onrender.com';  // 서버 주소

// 글쓰기 페이지 표시 함수 (수정 페이지로도 사용됨)
async function showWritePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    if (postId) {
        // 수정할 게시글 데이터를 서버에서 가져옴
        const response = await fetch(`${SERVER_URL}/posts/${postId}`);
        const post = await response.json();

        // 기존 게시글 데이터를 폼에 채움
        document.getElementById('authorName').value = post.author;
        document.getElementById('title').value = post.title;
        document.getElementById('content').value = post.content;

        // 첨부파일 정보 표시
        if (post.file) {
            document.getElementById('fileNameDisplay').innerText = `기존 첨부파일: ${post.file}`;
        }
        currentPostId = postId; // 수정 모드로 설정
    } else {
        // 새 글 작성 시 폼 초기화
        document.getElementById('authorName').value = '';
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('fileNameDisplay').innerText = '';
        currentPostId = null; // 새 글 작성 모드
    }
}

// 게시글 저장 함수
async function savePost() {
    const author = document.getElementById('authorName').value;
    const title = document.getElementById('title').value;
    const content = document.getElementById('content').value;
    const fileInput = document.getElementById('fileUpload');
    
    const formData = new FormData();
    formData.append('author', author);
    formData.append('title', title);
    formData.append('content', content);
    if (fileInput.files.length > 0) {
        formData.append('file', fileInput.files[0]);
    }

    if (currentPostId) {
        // 수정 요청
        await fetch(`${SERVER_URL}/posts/${currentPostId}`, {
            method: 'PUT',
            body: formData
        });
    } else {
        // 새 글 작성
        await fetch(`${SERVER_URL}/posts`, {
            method: 'POST',
            body: formData
        });
    }

    showBoardListPage(); // 게시글 목록 페이지로 돌아가기
}

// 게시판 목록 페이지로 돌아가는 함수
function showBoardListPage() {
    window.location.href = "board.html"; // 게시판 목록 페이지로 이동
}

// 파일명을 표시하는 함수
function displayFileName() {
    const fileInput = document.getElementById('fileUpload');
    const fileNameDisplay = document.getElementById('fileNameDisplay');
    const file = fileInput.files[0];

    if (file) {
        fileNameDisplay.innerText = `파일명: ${file.name}`;
    } else {
        fileNameDisplay.innerText = '';
    }
}

// 파일 업로드 필드 클릭 시 파일 선택 열기
document.getElementById('fileUploadContainer').addEventListener('click', function() { 
    document.getElementById('fileUpload').click();
});
