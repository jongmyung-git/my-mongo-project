let currentPage = 1;

// 서버 URL
const SERVER_URL = 'https://my-mongo-project.onrender.com';

// 게시글 목록 표시 함수
async function displayBoardList() {
    try {
        const response = await fetch(`${SERVER_URL}/posts?page=${currentPage}`);
        if (!response.ok) throw new Error('게시글을 불러오지 못했습니다.');
        const posts = await response.json();

        const boardList = document.getElementById('boardList');
        if (!boardList) return; // DOM이 유효하지 않으면 종료
        boardList.innerHTML = '';

        posts.forEach((post, index) => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${(currentPage - 1) * 10 + (index + 1)}</td>
                <td><a href="#" onclick="event.preventDefault(); viewPost('${post._id}')">${post.title}</a></td>
                <td>${post.author}</td>
                <td>${new Date(post.date).toLocaleDateString()}</td>
                <td>${post.file ? 'O' : '-'}</td>
                <td>${post.views}</td>
            `;
            boardList.appendChild(row);
        });
    } catch (error) {
        console.error('게시글 목록 표시 중 오류:', error);
        alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
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

    const postId = new URLSearchParams(window.location.search).get('id');
    try {
        const url = postId ? `${SERVER_URL}/posts/${postId}` : `${SERVER_URL}/posts`;
        const method = postId ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: formData });
        if (!response.ok) throw new Error('게시글 저장 실패');
        alert('게시글이 저장되었습니다.');
        goToList(); // 목록으로 이동
    } catch (error) {
        console.error('게시글 저장 중 오류:', error);
        alert('게시글 저장에 실패했습니다.');
    }
}

// 게시글 상세보기 함수
async function viewPost(id) {
    try {
        const response = await fetch(`${SERVER_URL}/posts/${id}`);
        if (!response.ok) throw new Error('게시글을 불러올 수 없습니다.');
        const post = await response.json();

        // 조회수 증가 요청
        await fetch(`${SERVER_URL}/posts/${id}/views`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
        });

        // 상세 페이지로 이동
        window.location.href = `board3.html?id=${post._id}`;
    } catch (error) {
        console.error('게시글 조회 중 오류:', error);
        alert('게시글을 불러오는 중 오류가 발생했습니다.');
    }
}

// 게시판 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('board3.html')) {
        const postId = new URLSearchParams(window.location.search).get('id');
        if (postId) displayPostDetails(postId);
    } else {
        displayBoardList();
    }
});

// 목록 페이지 이동
function goToList() {
    window.location.href = 'board.html';
}

















