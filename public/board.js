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

// 검색 기능
async function search() {
    const searchInput = document.getElementById('searchInput').value;
    const response = await fetch(`${SERVER_URL}/posts/search?query=${searchInput}`);
    const filteredPosts = await response.json();
    displayFilteredBoardList(filteredPosts); // 검색된 게시글 표시
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
