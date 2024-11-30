// 현재 보고 있는 페이지와 글의 ID 저장 변수
let currentPage = 1;
let currentPostId; // 현재 보고 있는 글의 ID 저장 변수

// 서버 URL (로컬 서버 주소)
const SERVER_URL = 'https://my-mongo-project.onrender.com'; // 서버 주소

// 게시글 목록 표시 함수
async function displayBoardList() {
    try {
        const response = await fetch(`${SERVER_URL}/posts?page=${currentPage}`);
        if (!response.ok) throw new Error('Failed to fetch posts');

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

            boardList.appendChild(row);
        });
    } catch (error) {
        console.error('Error fetching board list:', error);
        alert('게시글 목록을 불러오는 중 오류가 발생했습니다.');
    }
}

// 글쓰기 페이지 준비 함수
function prepareWritePage() {
    currentPostId = null; // 새로운 글을 작성할 때는 currentPostId 초기화
    localStorage.setItem('prepareWritePage', 'true'); // 페이지 이동 플래그 설정
}

// 글쓰기 페이지 로드 시 초기화 함수
function initializeWritePage() {
    if (localStorage.getItem('prepareWritePage') === 'true') {
        localStorage.removeItem('prepareWritePage');
        document.getElementById('authorName').value = '';
        document.getElementById('title').value = '';
        document.getElementById('content').value = '';
        document.getElementById('fileUpload').value = '';
        document.getElementById('fileNameDisplay').innerText = '';
    }
}

// 게시판 목록 페이지로 돌아가는 함수
function showBoardListPage() {
    window.location.href = "board.html"; // 게시판 목록 페이지로 이동
}

// 게시글 저장 함수
async function savePost() {
    try {
        const author = document.getElementById('authorName').value.trim();
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        const fileInput = document.getElementById('fileUpload');

        if (!author || !title || !content) {
            alert('모든 필드를 입력해야 합니다.');
            return;
        }

        const formData = new FormData();
        formData.append('author', author);
        formData.append('title', title);
        formData.append('content', content);

        if (fileInput.files.length > 0) {
            formData.append('file', fileInput.files[0]);
        }

        const url = currentPostId ? `${SERVER_URL}/posts/${currentPostId}` : `${SERVER_URL}/posts`;
        const method = currentPostId ? 'PUT' : 'POST';

        const response = await fetch(url, { method, body: formData });
        if (!response.ok) throw new Error('Failed to save post');

        showBoardListPage(); // 게시글 저장 후 목록으로 이동
    } catch (error) {
        console.error('Error saving post:', error);
        alert('게시글 저장 중 문제가 발생했습니다.');
    }
}

// 게시글 삭제 함수
async function deletePost(id) {
    try {
        if (confirm("정말 삭제하시겠습니까?")) {
            const response = await fetch(`${SERVER_URL}/posts/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Failed to delete post');
            showBoardListPage(); // 게시글 삭제 후 목록 갱신
        }
    } catch (error) {
        console.error('Error deleting post:', error);
        alert('게시글 삭제 중 문제가 발생했습니다.');
    }
}

// 게시글 상세보기 함수
async function viewPost(id) {
    try {
        const response = await fetch(`${SERVER_URL}/posts/${id}`);
        if (!response.ok) throw new Error('Failed to fetch post details');

        const post = await response.json();
        await fetch(`${SERVER_URL}/posts/${id}/views`, { method: 'PUT' });

        currentPostId = post._id;
        window.location.href = `board3.html?id=${post._id}`; // 상세 페이지로 이동
    } catch (error) {
        console.error('Error viewing post:', error);
        alert('게시글 상세보기 중 문제가 발생했습니다.');
    }
}

// 게시글 상세페이지에서 데이터를 표시하기 위한 함수
async function displayPostDetails() {
    try {
        const postId = new URLSearchParams(window.location.search).get('id');
        const response = await fetch(`${SERVER_URL}/posts/${postId}`);
        if (!response.ok) throw new Error('Failed to fetch post details');

        const post = await response.json();

        document.getElementById('postTitle').innerText = post.title;
        document.getElementById('postAuthor').innerText = `${post.author}`;
        document.getElementById('postContent').innerHTML = post.content.replace(/\n/g, '<br>'); // 줄바꿈 처리
        document.getElementById('postFile').innerText = post.file || '첨부파일 없음';
        document.getElementById('postDate').innerText = new Date(post.date).toISOString().split('T')[0];
        document.getElementById('postViews').innerText = post.views;
    } catch (error) {
        console.error('Error displaying post details:', error);
        alert('게시글 정보를 가져오는 중 문제가 발생했습니다.');
    }
}

// 검색 기능
async function search() {
    const searchInput = document.getElementById('searchInput').value.trim();

    if (!searchInput) {
        displayBoardList();
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/posts/search?query=${encodeURIComponent(searchInput)}`);
        if (!response.ok) throw new Error('Failed to fetch search results');

        const filteredPosts = await response.json();

        if (filteredPosts.length === 0) {
            document.getElementById('boardList').innerHTML = '<tr><td colspan="6">검색 결과가 없습니다.</td></tr>';
        } else {
            displayFilteredBoardList(filteredPosts);
        }
    } catch (error) {
        console.error('Error during search:', error);
        alert('검색 중 문제가 발생했습니다.');
    }
}

// 검색된 게시글 목록 표시 함수
function displayFilteredBoardList(filteredPosts) {
    const boardList = document.getElementById('boardList');
    boardList.innerHTML = '';

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
document.addEventListener("DOMContentLoaded", () => {
    displayBoardList();

    if (window.location.pathname.includes('board3.html')) {
        displayPostDetails();
    }

    if (window.location.pathname.includes('board2.html')) {
        initializeWritePage();
    }
});

// 페이지 넘김 기능
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayBoardList();
    }
}

function nextPage() {
    currentPage++;
    displayBoardList();
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
document.getElementById('fileUploadContainer').addEventListener('click', () => {
    document.getElementById('fileUpload').click();
});

// 목록 버튼 클릭 시 게시판 목록으로 이동
function goToList() {
    window.location.href = "board.html";
}
















