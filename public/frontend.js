// 현재 보고 있는 페이지와 글의 ID 저장 변수
let currentPage = 1;
let currentPostId = null; // 현재 보고 있는 글의 ID 저장 변수

// 서버 URL (로컬 서버 주소)
const SERVER_URL = 'https://my-mongo-project.onrender.com'; // 서버 주소

// 게시글 목록 표시 함수
async function displayBoardList() {
    try {
        const response = await fetch(`${SERVER_URL}/posts?page=${currentPage}`);
        const posts = await response.json();

        const boardList = document.getElementById('boardList');
        boardList.innerHTML = ''; // 기존 목록 초기화

        posts.forEach((post, index) => {
            const row = document.createElement('tr');

            row.innerHTML = `
                <td class="col-1">${(currentPage - 1) * 10 + (index + 1)}</td>
                <td class="col-2"><a href="#" onclick="event.preventDefault(); viewPost('${post._id}')">${post.title}</a></td>
                <td class="col-3">${post.author}</td>
                <td class="col-4">${new Date(post.date).toLocaleDateString()}</td>
                <td class="col-5">${post.file ? 'O' : '-'}</td>
                <td class="col-6">${post.views}</td>
            `;

            boardList.appendChild(row); // 게시글 목록에 추가
        });
    } catch (error) {
        console.error('게시글 목록 불러오기 실패:', error);
        alert('게시글 목록을 불러오는 데 실패했습니다.');
    }
}

// 글쓰기 페이지 표시 함수 (수정 페이지로도 사용됨)
async function showWritePage() {
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('id');

    currentPostId = postId; // 현재 상태 설정

    if (postId) {
        try {
            const response = await fetch(`${SERVER_URL}/posts/${postId}`);
            const post = await response.json();

            // 기존 게시글 데이터를 폼에 채움
            document.getElementById('authorName').value = post.author;
            document.getElementById('title').value = post.title;
            document.getElementById('content').value = post.content;

            // 첨부파일 정보 표시
            document.getElementById('fileNameDisplay').innerText = post.file ? `기존 첨부파일: ${post.file}` : '';
        } catch (error) {
            console.error('글 수정 데이터 로드 실패:', error);
            alert('글 정보를 불러오는 데 실패했습니다.');
        }
    } else {
        // 새 글 작성 시 폼 초기화
        document.getElementById('authorName').value = '';
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('fileNameDisplay').innerText = '';
    }
}

// 게시글 저장 함수 (수정/작성 통합)
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

    try {
        if (currentPostId) {
            // 수정 요청
            await fetch(`${SERVER_URL}/posts/${currentPostId}`, {
                method: 'PUT',
                body: formData,
            });
        } else {
            // 새 글 작성
            await fetch(`${SERVER_URL}/posts`, {
                method: 'POST',
                body: formData,
            });
        }
        alert('게시글이 저장되었습니다.');
        window.location.href = 'board.html'; // 목록 페이지로 이동
    } catch (error) {
        console.error('게시글 저장 실패:', error);
        alert('게시글 저장에 실패했습니다.');
    }
}

// 게시글 상세보기 함수
async function viewPost(id) {
    try {
        const response = await fetch(`${SERVER_URL}/posts/${id}`);
        const post = await response.json();

        // 조회수 증가
        await fetch(`${SERVER_URL}/posts/${id}/views`, {
            method: 'PUT',
        });

        currentPostId = post._id;
        window.location.href = `board3.html?id=${currentPostId}`;
    } catch (error) {
        console.error('게시글 상세보기 로드 실패:', error);
        alert('게시글 정보를 불러오는 데 실패했습니다.');
    }
}

// 게시글 삭제 함수
async function deleteCurrentPost() {
    if (!currentPostId) {
        alert('삭제할 게시글이 선택되지 않았습니다.');
        return;
    }

    if (confirm('정말 삭제하시겠습니까?')) {
        try {
            await fetch(`${SERVER_URL}/posts/${currentPostId}`, { method: 'DELETE' });
            alert('게시글이 삭제되었습니다.');
            window.location.href = 'board.html'; // 목록 페이지로 이동
        } catch (error) {
            console.error('게시글 삭제 실패:', error);
            alert('게시글 삭제에 실패했습니다.');
        }
    }
}

// 검색 기능
async function search() {
    const searchInput = document.getElementById('searchInput').value;

    try {
        const response = await fetch(`${SERVER_URL}/posts/search?query=${searchInput}`);
        const filteredPosts = await response.json();
        displayFilteredBoardList(filteredPosts); // 검색된 게시글 표시
    } catch (error) {
        console.error('검색 실패:', error);
        alert('검색 중 문제가 발생했습니다.');
    }
}

// 검색 결과 표시 함수
function displayFilteredBoardList(filteredPosts) {
    const boardList = document.getElementById('boardList');
    boardList.innerHTML = ''; // 기존 목록 초기화

    filteredPosts.forEach((post, index) => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${index + 1}</td>
            <td><a href="#" onclick="event.preventDefault(); viewPost('${post._id}')">${post.title}</a></td>
            <td>${post.author}</td>
            <td>${new Date(post.date).toLocaleDateString()}</td>
            <td>${post.file ? '첨부파일' : '-'}</td>
            <td>${post.views}</td>
        `;

        boardList.appendChild(row);
    });
}

// 페이지 초기화
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('board3.html')) {
        displayPostDetails(); // 상세 페이지 초기화
    } else {
        displayBoardList(); // 목록 페이지 초기화
    }
});


















