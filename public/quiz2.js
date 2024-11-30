// 퀴즈 문제와 정답 데이터
const questions = [
    { 
        question: "돼지고기가 소고기보다 탄소 배출량이 많다.", 
        answer: false,
        explanation: "소고기가 돼지고기보다 탄소 배출량이 훨씬 더 많습니다. 이는 소의 반추 소화 과정에서 많은 메탄가스가 발생하기 때문입니다."
    },
    { 
        question: "대중교통 이용은 탄소배출을 줄이는데 도움이 된다.", 
        answer: true,
        explanation: "대중교통은 승용차보다 더 많은 사람을 동시에 이동시킬 수 있어 개인 차량 사용에 비해 탄소 배출량이 적습니다."
    },
    { 
        question: "냉장고 문을 자주 여닫으면 에너지가 절약된다.", 
        answer: false,
        explanation: "냉장고 문을 자주 여닫으면 내부 온도가 올라가고 다시 냉각하는 데 더 많은 에너지가 소모됩니다."
    },
    { 
        question: "탄소발자국에 개인의 스마트폰 사용도 포함된다.", 
        answer: true,
        explanation: "스마트폰 사용 시 데이터 센터 운영과 전력 소비가 발생하며, 이는 탄소발자국에 영향을 미칩니다."
    },
    { 
        question: "에너지 효율 높은 가전제품 사용은 에너지 절약에 도움이 된다.", 
        answer: true,
        explanation: "에너지 효율 등급이 높은 가전제품은 같은 작업을 수행하면서도 전력 소비량이 적어 탄소 배출을 줄일 수 있습니다."
    },
    { 
        question: "재활용 가능한 물건은 따로 분리 배출해야 한다.", 
        answer: true,
        explanation: "분리배출은 자원을 재활용할 수 있게 하며, 새로운 자원 생산에 따른 에너지 소모와 탄소 배출을 줄입니다."
    },
    { 
        question: "기차는 비행기보다 탄소발자국이 더 크다.", 
        answer: false,
        explanation: "기차는 비행기보다 1인당 탄소 배출량이 훨씬 적어 친환경적인 교통수단입니다."
    },
    { 
        question: "배달 음식은 탄소 발자국을 줄이는 방법이다.", 
        answer: false,
        explanation: "배달 음식은 포장재와 운송 과정에서 많은 탄소 배출이 발생합니다."
    },
    { 
        question: "온라인 쇼핑은 탄소 발자국을 증가시킬 수 있다.", 
        answer: true,
        explanation: "온라인 쇼핑은 배송 과정에서의 화석 연료 소비와 포장재 사용으로 인해 탄소 발자국을 증가시킬 수 있습니다."
    },
    { 
        question: "식물은 이산화탄소를 흡수하고 산소를 방출해 탄소발자국을 줄인다.", 
        answer: true,
        explanation: "식물은 광합성을 통해 대기 중의 이산화탄소를 흡수하여 탄소 발자국 감소에 기여합니다."
    }
];

    let currentQuestion = 0;
    let score = 0;

    function loadQuestion() {
        const quizQuestionElement = document.getElementById("quiz-question");
        const resultMessage = document.getElementById("result-message");
        resultMessage.innerText = "";
        quizQuestionElement.innerText = questions[currentQuestion].question;
    }


    function checkAnswer(userAnswer) {
        const correctAnswer = questions[currentQuestion].answer;
        const resultMessage = document.getElementById("result-message");
        const explanationElement = document.getElementById("explanation");
        const trueButton = document.getElementById("true-button");
        const falseButton = document.getElementById("false-button");
    
        // 버튼 클릭 후 비활성화
        trueButton.disabled = true;
        falseButton.disabled = true;
    
        // 정답 확인 및 점수 계산
        if (userAnswer === correctAnswer) {
            resultMessage.innerText = "정답입니다!";
            resultMessage.style.color = "green";
            score++;
            userAnswer ? trueButton.classList.add("correct") : falseButton.classList.add("correct");
        } else {
            resultMessage.innerText = "틀렸습니다!";
            resultMessage.style.color = "red";
            userAnswer ? trueButton.classList.add("incorrect") : falseButton.classList.add("incorrect");
        }
    
        // 해설 표시
        explanationElement.innerText = questions[currentQuestion].explanation;
        explanationElement.style.display = "block"; // 해설을 보이도록 설정
    
        // 다음 문제로 넘어가기
        setTimeout(() => {
            explanationElement.style.display = "none"; // 해설 숨기기
            trueButton.classList.remove("correct", "incorrect");
            falseButton.classList.remove("correct", "incorrect");
    
            // 버튼 다시 활성화
            trueButton.disabled = false;
            falseButton.disabled = false;
    
            currentQuestion++;
            if (currentQuestion < questions.length) {
                loadQuestion();
            } else {
                showFinalScore();
            }
        }, 3000); // 해설을 3초 동안 표시한 후 다음 문제로 이동
    }
    




    function showFinalScore() {
        const finalScoreElement = document.getElementById("final-score");
        const finalCommentElement = document.getElementById("final-comment");
        finalScoreElement.innerText = `총 점수: ${score} / ${questions.length}`;

        // 점수에 따른 코멘트 제공
        let comment = "";
        if (score === questions.length) {
            comment = "완벽합니다! 탄소발자국에 대해 잘 알고 계시네요.";
        } else if (score >= questions.length * 0.7) {
            comment = "훌륭해요! 탄소발자국에 대해 많은 것을 알고 있습니다.";
        } else if (score >= questions.length * 0.4) {
            comment = "괜찮아요! 탄소발자국에 대해 더 알아가면 좋을 것 같아요.";
        } else {
            comment = "아쉽습니다. 탄소발자국에 대해 더 알아보면 도움이 될 거예요.";
        }
        
        finalCommentElement.innerText = comment;
    
        const endButton = document.getElementById('end-button');

        ;
        endButton.classList.remove('hidden');
        
        endButton.addEventListener('click', () => {
            window.location.reload();
            });


    }

    window.onload = loadQuestion;