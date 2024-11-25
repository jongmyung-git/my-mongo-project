// 검색 기능 구현 (임시로 경고창 띄우기)
function search() {
    const query = document.getElementById("searchInput").value;
    alert("검색 기능이 아직 구현되지 않았습니다.");
}

//탭 전환 기능
function showTab(tabName) {
    const tabs = document.querySelectorAll('.tab-content');
    tabs.forEach(tab => tab.style.display = 'none');

    document.getElementById(tabName).style.display = 'block';

    const buttons = document.querySelectorAll('.tab-button');
    buttons.forEach(button => button.classList.remove('active'));

    event.currentTarget.classList.add('active');
}