let app;

// Fisher-Yates shuffle function to randomize array
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]]; // Swap elements
  }
  return array;
}

fetch("data/csc223_all_questions.json")
  .then((res) => res.json())
  .then((quiz) => {
    // Shuffle the questions array
    const shuffledQuestions = shuffleArray([...quiz.questions]);
    // Initialize userResponses with the same length as shuffled questions
    const userResponseSkeleton = Array(shuffledQuestions.length).fill(null);

    app = new Vue({
      el: "#app",
      data: {
        quiz: { questions: shuffledQuestions },
        questions: shuffledQuestions,
        questionIndex: 0,
        userResponses: userResponseSkeleton,
        quizStarted: false,
        timeLeft: 3720, // 1 hour 2 minutes = 3720 seconds
        timerInterval: null
      },
      filters: {
        charIndex: function (i) {
          return String.fromCharCode(65 + i); // A, B, C...
        },
      },
      computed: {
        formattedTime() {
          const mins = Math.floor(this.timeLeft / 60);
          const secs = this.timeLeft % 60;
          return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        }
      },
      methods: {
        startQuiz() {
          this.quizStarted = true;
          this.startTimer();
        },
        startTimer() {
          this.timerInterval = setInterval(() => {
            if (this.timeLeft > 0) {
              this.timeLeft--;
            } else {
              clearInterval(this.timerInterval);
              this.finishQuiz();
            }
          }, 1000);
        },
        finishQuiz() {
          this.questionIndex = this.quiz.questions.length;
          clearInterval(this.timerInterval); // Ensure timer stops
        },
        selectOption(index) {
          Vue.set(this.userResponses, this.questionIndex, index);
        },
        next() {
          if (this.questionIndex < this.quiz.questions.length - 1) {
            this.questionIndex++;
          } else {
            this.finishQuiz();
          }
        },
        prev() {
          if (this.questionIndex > 0) {
            this.questionIndex--;
          }
        },
        score() {
          let score = 0;
          for (let i = 0; i < this.userResponses.length; i++) {
            const question = this.quiz.questions[i];
            const selectedIndex = this.userResponses[i];
            if (question.responses[selectedIndex] && question.responses[selectedIndex].correct) {
              score++;
            }
          }
          return score;
        },
      },
    });
  })
  .catch((err) => {
    console.error("Failed to load quiz JSON:", err);
  });
