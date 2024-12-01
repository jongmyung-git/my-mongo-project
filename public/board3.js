// 현재 보고 있는 페이지와 글의 ID 저장 변수
let currentPage = 1;
let currentPostId; // 현재 보고 있는 글의 ID 저장 변수

// 서버 URL (로컬 서버 주소)
const SERVER_URL = 'https://my-mongo-project.onrender.com';  // 서버 주소

// 상세 페이지에서 현재 게시글 삭제
async function deleteCurrentPost() {
    if (!currentPostId) {
        alert('삭제할 게시글이 선택되지 않았습니다.');
        return;
    }

    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            await fetch(`${SERVER_URL}/posts/${currentPostId}`, {
                method: 'DELETE',
            });
            alert('게시글이 삭제되었습니다.');
            window.location.href = 'board.html'; // 목록 페이지로 이동
        } catch (error) {
            console.error('게시글 삭제 중 오류:', error);
            alert('게시글 삭제에 실패했습니다.');
        }
    }
}

// 게시글 상세보기 함수
async function viewPost(id) {
    const response = await fetch(`${SERVER_URL}/posts/${id}`);
    const post = await response.json();

    // 조회수 증가 요청
    await fetch(`${SERVER_URL}/posts/${id}/views`, {  
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(post)
    }).catch((err) => console.error('조회수 업데이트 실패:', err));

    currentPostId = post._id;

    // 상세 페이지로 이동하고, 상세 페이지에서 해당 글 데이터를 표시
    window.location.href = `board3.html?id=${post._id}`;  // 상세 페이지로 이동
}

// 게시글 상세페이지에서 데이터를 표시하기 위한 함수
async function displayPostDetails() {
    const postId = new URLSearchParams(window.location.search).get('id');
    const response = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await response.json();

    const titleElement = document.getElementById('postTitle');
    const authorElement = document.getElementById('postAuthor');
    const contentElement = document.getElementById('postContent');
    const fileElement = document.getElementById('postFile');
    const dateElement = document.getElementById('postDate');
    const viewsElement = document.getElementById('postViews');

    // 게시글 데이터 표시
    titleElement.innerText = post.title;
    authorElement.innerText = `${post.author}`;
    contentElement.innerHTML = post.content.replace(/\n/g, '<br>');  // 줄바꿈 처리
    fileElement.innerText = post.file ? `${post.file}` : '첨부파일 없음';

    // 날짜 포맷팅 (YYYY-MM-DD)
    const postDate = new Date(post.date);
    const formattedDate = postDate.getFullYear() + '-' + (postDate.getMonth() + 1).toString().padStart(2, '0') + '-' + postDate.getDate().toString().padStart(2, '0');
    dateElement.innerText = formattedDate;

    // 조회수 표시
    viewsElement.innerText = `조회수: ${post.views}`;
}

// 페이지 로딩 후 게시글 상세 데이터 로딩
document.addEventListener("DOMContentLoaded", () => {
    displayPostDetails();  // 게시글 상세보기
});
