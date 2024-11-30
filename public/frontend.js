// 현재 보고 있는 페이지와 글의 ID 저장 변수
let currentPage = 1;
let currentPostId; // 현재 보고 있는 글의 ID 저장 변수

// 서버 URL (로컬 서버 주소)
const SERVER_URL = 'https://my-mongo-project.onrender.com';  // 서버 주소

// 게시글 목록 표시 함수
async function displayBoardList() {
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
}

// 글쓰기 페이지 표시 함수
function showWritePage() {
    currentPostId = null; // 새로운 글을 작성할 때는 currentPostId 초기화

    window.location.href = "board2.html"; // 글쓰기 페이지로 이동

    // 기존 내용 초기화
    document.getElementById('authorName').value = '';
    document.getElementById('title').value = '';
    document.getElementById('content').value = '';
    document.getElementById('fileUpload').value = '';
    document.getElementById('fileNameDisplay').innerText = '';
}

// 게시판 목록 페이지로 돌아가는 함수
function showBoardListPage() {
    window.location.href = "board.html"; // 게시판 목록 페이지로 이동
    displayBoardList(); // 게시글 목록 새로고침
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

// 게시글 삭제 함수
async function deletePost(id) {
    if (confirm("정말 삭제하시겠습니까?")) {
        await fetch(`${SERVER_URL}/posts/${id}`, {
            method: 'DELETE'
        });
        showBoardListPage(); // 게시글 삭제 후 목록 갱신
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
    console.log('게시글 ID:', postId);  // 콘솔에 ID 확인
    const response = await fetch(`${SERVER_URL}/posts/${postId}`);
    const post = await response.json();

    // 데이터가 제대로 응답되는지 확인
    console.log(post);

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
    dateElement.innerText = formattedDate;  // 등록일: YYYY-MM-DD

    // 조회수 표시
    viewsElement.innerText = post.views;  // 조회수: 숫자만 표시
}

// 검색 기능
async function search() {
    const searchInput = document.getElementById('searchInput').value.trim();
    
    // 검색어가 없을 경우 전체 게시글 표시
    if (!searchInput) {
        displayBoardList();
        return;
    }

    try {
        const response = await fetch(`${SERVER_URL}/posts/search?query=${encodeURIComponent(searchInput)}`);
        if (!response.ok) {
            throw new Error(`검색 요청 실패: ${response.statusText}`);
        }

        const filteredPosts = await response.json();

        if (filteredPosts.length === 0) {
            // 검색 결과가 없을 때 처리
            const boardList = document.getElementById('boardList');
            boardList.innerHTML = '<tr><td colspan="6">검색 결과가 없습니다.</td></tr>';
        } else {
            displayFilteredBoardList(filteredPosts); // 검색된 게시글 표시
        }
    } catch (error) {
        console.error('검색 중 오류 발생:', error);
        alert('검색 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
}

// 검색된 게시글 목록 표시 함수
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
        
        boardList.appendChild(row); // 필터링된 게시글 목록에 추가
    });
}

// 페이지 초기화
document.addEventListener("DOMContentLoaded", () => {
    displayBoardList(); // 페이지 로드 시 게시글 목록 표시

    // 상세 페이지에서는 글 내용 표시
    if (window.location.pathname.includes('board3.html')) {
        displayPostDetails(); // 글 상세 내용 표시
    }
});

// 페이지 넘김 기능
function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        displayBoardList(); // 이전 페이지 표시
    }
}

function nextPage() {
    currentPage++;
    displayBoardList(); // 다음 페이지 표시
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

// 목록 버튼 클릭 시 게시판 목록으로 이동
function goToList() {
    window.location.href = "board.html"; // 게시판 목록 페이지로 이동
    displayBoardList(); // 게시글 목록 표시
}
















