let questionsList = [];
let currentIndex=0;
let currentQuestion = null;


// Tải câu hỏi từ file JSON khi trang web load
document.addEventListener("DOMContentLoaded", fetchQuestion);


function fetchQuestion() {
  // Reset giao diện
  document.getElementById("result").innerText = "";
  document.getElementById("next-btn").style.display = "none";


  // Gọi API lấy file JSON
  fetch("questions.json")
    .then((response) => {
      if (!response.ok) {
        throw new Error("Không thể tải file questions.json");
      }
      return response.json();
    })
    .then((questions) => {
      questionsList = questions; //lưu câu hỏi vào
      currentIndex = 0;
      if (questionsList.length > 0){
        // Hiển thị câu hỏi ra giao diện
      displayQuestion(questionsList[currentIndex]);
      }
    })
    .catch((error) => {
      console.error(error);
      document.getElementById("question").innerText = "Lỗi khi tải câu hỏi!";
    });
}
// chuyển câu hỏi kế tiếp
function fetchNextQuestion(){
  document.getElementById("result").innerText = "";
  document.getElementById("next-btn").style.display = "none";
  currentIndex++;
  if (currentIndex>= questionsList.length){
  currentIndex = 0;
  }
  displayQuestion(questionsList[currentIndex]);
}
function displayQuestion(q) {
  currentQuestion=q;
  document.getElementById("question").innerText = q.question;
  const optionsContainer = document.getElementById("options");
  optionsContainer.innerHTML = ""; // Xóa các đáp án cũ


  q.options.forEach((optionText, index) => {
    const button = document.createElement("button");
    button.innerText = optionText;
    button.classList.add("option-btn");


    // Bắt sự kiện người dùng chọn đáp án
    button.onclick = () => checkAnswer(index, button);


    optionsContainer.appendChild(button);
  });
}


function checkAnswer(selectedIndex, selectedButton) {
  const buttons = document.querySelectorAll(".option-btn");


  // Vô hiệu hóa tất cả các nút sau khi đã chọn
  buttons.forEach((btn) => (btn.disabled = true));


  if (selectedIndex === currentQuestion.answer) {
    selectedButton.classList.add("correct");
    document.getElementById("result").innerText = "🎉 Chính xác!";
    document.getElementById("result").style.color = "#28a745";
  } else {
    selectedButton.classList.add("wrong");
    // Đánh dấu luôn đáp án đúng để người dùng biết
    buttons[currentQuestion.answer].classList.add("correct");
    document.getElementById("result").innerText = "❌ Sai rồi!";
    document.getElementById("result").style.color = "#dc3545";
  }


  // Hiển thị nút "Câu hỏi tiếp theo"
  document.getElementById("next-btn").style.display = "block";
}


// Bắt sự kiện khi bấm nút chuyển câu hỏi
document
  .getElementById("next-btn")
  .addEventListener("click", fetchNextQuestion);
