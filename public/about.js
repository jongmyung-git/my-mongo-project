// 탭 전환 함수
function openTab(event, tabName) {
    const tabContents = document.querySelectorAll('.tab-content');
    const tabButtons = document.querySelectorAll('.tab-button');

    // 모든 탭 콘텐츠와 버튼 비활성화
    tabContents.forEach(content => content.classList.remove('active'));
    tabButtons.forEach(button => button.classList.remove('active'));

    // 선택된 탭과 버튼 활성화
    event.currentTarget.classList.add('active');
    document.getElementById(tabName).classList.add('active');
}

// 기본적으로 첫 번째 탭 활성화
document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll('.tab-button')[0].click();
});

// 한국인의 하루 평균 탄소 배출량 (kg)
const dailyCarbonEmissionKg = (15.5 / 365) * 1000; // 연간 15.5톤 기준

// 총 탄소 배출량 변수
let totalCarbonEmissions = 0;

// 이동수단 탄소 배출 계산
document.getElementById("carbonForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const distance = parseFloat(document.getElementById("distance").value);
    const fuelType = document.getElementById("fuelType").value;

    let emissionFactor = 0;
    switch (fuelType) {
        case 'gasoline': emissionFactor = distance / 16.04 * 2.097; break;
        case 'diesel': emissionFactor = distance / 15.35 * 2.582; break;
        case 'LPG': emissionFactor = distance / 11.06 * 1.868; break;
        case 'electric': emissionFactor = 0.0; break;
        default: emissionFactor = 0; break;
    }

    const carbonEmissions = emissionFactor;
    totalCarbonEmissions += carbonEmissions;

    document.getElementById("carbonResult").textContent = `이동수단 탄소 배출량: ${carbonEmissions.toFixed(2)}kg CO2`;
    updateComparison();
});

// 폐기물 탄소 배출 계산
document.getElementById("wasteForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const wasteAmount = parseFloat(document.getElementById("wasteAmount").value);
    const wasteCarbonEmissions = wasteAmount * 0.5573;

    totalCarbonEmissions += wasteCarbonEmissions;

    document.getElementById("wasteResult").textContent = `폐기물 탄소 배출량: ${wasteCarbonEmissions.toFixed(2)}kg CO2`;
    updateComparison();
});

// 수도 사용량 탄소 배출 계산
document.getElementById("waterForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const waterUsage = parseFloat(document.getElementById("waterUsage").value);
    const waterCarbonEmissions = waterUsage * 0.237;

    totalCarbonEmissions += waterCarbonEmissions;

    document.getElementById("waterResult").textContent = `수도 사용 탄소 배출량: ${waterCarbonEmissions.toFixed(2)}kg CO2`;
    updateComparison();
});

// 가스 사용량 탄소 배출 계산
document.getElementById("gasForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const gasUsage = parseFloat(document.getElementById("gasUsage").value);
    const gasCarbonEmissions = gasUsage * 2.176;

    totalCarbonEmissions += gasCarbonEmissions;

    document.getElementById("gasResult").textContent = `가스 사용 탄소 배출량: ${gasCarbonEmissions.toFixed(2)}kg CO2`;
    updateComparison();
});

// 총 배출량과 한국 평균 비교
function updateComparison() {
    const comparisonText = totalCarbonEmissions > dailyCarbonEmissionKg
        ? `총 배출량은 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)보다 많습니다.`
        : totalCarbonEmissions < dailyCarbonEmissionKg
        ? `총 배출량은 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)보다 적습니다.`
        : `총 배출량은 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)과 같습니다.`;

    document.getElementById("comparisonResult").textContent = 
        `총 탄소 배출량: ${totalCarbonEmissions.toFixed(2)}kg CO2\n${comparisonText}`;
}

// 총 배출량과 비교 결과 업데이트
function updateComparison() {
    const comparisonText = totalCarbonEmissions > dailyCarbonEmissionKg
        ? `총 배출량은 한국인의 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)보다 많습니다.`
        : totalCarbonEmissions < dailyCarbonEmissionKg
        ? `총 배출량은 한국인의 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)보다 적습니다.`
        : `총 배출량은 한국인의 하루 평균(${dailyCarbonEmissionKg.toFixed(2)}kg)과 같습니다.`;

    // 총 결과 출력
    document.getElementById("totalResult").textContent = 
        `총 탄소 배출량: ${totalCarbonEmissions.toFixed(2)}kg CO2`;
    document.getElementById("comparisonResult").textContent = comparisonText;
}

