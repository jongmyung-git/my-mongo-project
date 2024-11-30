let currentIndex = 0;

// 자동 전환 함수
function autoScaleCards() {
    const cards = document.querySelectorAll(".agenda-card");
    cards.forEach((card, index) => {
        card.style.transform = "scale(1)"; // 모든 카드 크기 초기화
        if (index === currentIndex) {
            card.style.transform = "scale(1.1)"; // 현재 카드 크기 확대
        }
    });

    currentIndex = (currentIndex + 1) % cards.length; // 다음 카드로 이동
}

// 2초마다 자동으로 크기 변경
setInterval(autoScaleCards, 2000);