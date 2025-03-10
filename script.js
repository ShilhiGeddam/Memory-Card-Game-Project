// Get elements
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

let level = localStorage.getItem("selectedLevel") || "easy"; // Get selected level or default to easy
let cards = ["🐶", "🐱", "🐰", "🐼", "🦊", "🐸", "🐵", "🐻", "🐯", "🦁", "🐮", "🐷"];
let gameCards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timeLeft;
let gameStarted = false;
let timerInterval;

// Level configurations
const levelConfig = {
    easy: { gridClass: "easy-grid", pairs: 6, time: 60, next: "medium" },
    medium: { gridClass: "medium-grid", pairs: 12, time: 90, next: "hard" },
    hard: { gridClass: "hard-grid", pairs: 16, time: 120, next: null }
};

document.addEventListener("DOMContentLoaded", () => {
    if (gameBoard) {
        gameBoard.className = `game-board ${levelConfig[level].gridClass}`;
        setLevel();
        startGame();
    }
});

// Apply level settings
function setLevel() {
    let levelData = levelConfig[level];
    gameCards = cards.slice(0, levelData.pairs).concat(cards.slice(0, levelData.pairs)); // Duplicate pairs
    timeLeft = levelData.time;
    matchedPairs = 0;
    score = 0;
    timerDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;
}

// Start the game
function startGame() {
    gameBoard.innerHTML = "";
    shuffleCards();
    createBoard();
}

// Shuffle cards
function shuffleCards() {
    gameCards.sort(() => Math.random() - 0.5);
}

function createBoard() {
    console.log("Current Level:", level); // Debugging log to check the level

    // Explicitly set grid layout based on level
    if (level === "easy") {
        gameBoard.style.display = "grid";
        gameBoard.style.gridTemplateColumns = "repeat(4, 1fr)";
        gameBoard.style.gridTemplateRows = "repeat(3, 1fr)";
    } else if (level === "medium") {
        gameBoard.style.display = "grid";
        gameBoard.style.gridTemplateColumns = "repeat(6, 1fr)";
        gameBoard.style.gridTemplateRows = "repeat(4, 1fr)";
    } else if (level === "hard") {
        gameBoard.style.display = "grid";
        gameBoard.style.gridTemplateColumns = "repeat(8, 1fr)";
        gameBoard.style.gridTemplateRows = "repeat(4, 1fr)"; // Should now correctly apply 8x4!
        let level = localStorage.getItem("selectedLevel") || "easy";
console.log("Loaded Level from Storage:", level); // Debugging log

    } else {
        console.error("Invalid level:", level);
    }

    gameCards.forEach((emoji) => {
        let card = document.createElement("div");
        card.classList.add("card");
        card.dataset.emoji = emoji; // Store emoji in dataset
        card.textContent = "?"; // Show question mark initially
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });
}



// Start timer on first flip
function startTimer() {
    if (!gameStarted) {
        gameStarted = true;
        timerInterval = setInterval(() => {
            timeLeft--;
            timerDisplay.textContent = timeLeft;
            if (timeLeft === 0) endGame();
        }, 1000);
    }
}

// Flip card
function flipCard() {
    if (this.textContent !== "?" || flippedCards.length === 2) return;

    this.textContent = this.dataset.emoji; // Show the emoji
    flippedCards.push(this);
    startTimer();

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 500);
    }
}

// Check for match
function checkMatch() {
    if (flippedCards[0].dataset.emoji === flippedCards[1].dataset.emoji) {
        score += 10;
        matchedPairs++;
        flippedCards.forEach(card => card.style.pointerEvents = "none"); // Disable clicks on matched pairs
        if (matchedPairs === gameCards.length / 2) {
            completeLevel();
        }
    } else {
        flippedCards.forEach(card => card.textContent = "?"); // Hide emojis if no match
    }
    flippedCards = [];
    scoreDisplay.textContent = score;
}

// Complete level
function completeLevel() {
    clearInterval(timerInterval);
    setTimeout(() => {
        alert(`🎉 Congratulations! You completed ${level.toUpperCase()} level! 🎉`);
        let nextLevel = levelConfig[level].next;
        if (nextLevel) {
            localStorage.setItem("selectedLevel", nextLevel);
            window.location.href = nextLevel + ".html"; // Move to next level
        } else {
            alert("🎯 You've mastered all levels! Resetting game.");
            resetGame();
        }
    }, 500);
}

// End game
function endGame() {
    clearInterval(timerInterval);
    alert(`Game Over! Your Score: ${score}`);
    resetGame();
}

// Reset game
function resetGame() {
    localStorage.setItem("selectedLevel", "easy"); // Reset to easy
    window.location.href = "easy.html";
}

// Function to apply saved theme
function applySavedTheme() {
    const savedTheme = localStorage.getItem("selectedTheme") || "light";
    document.body.className = savedTheme;
}

// Ensure theme is applied when any page loads
window.onload = applySavedTheme;
