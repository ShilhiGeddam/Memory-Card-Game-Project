// Elements
const gameBoard = document.getElementById("game-board");
const scoreDisplay = document.getElementById("score");
const timerDisplay = document.getElementById("timer");

// Audio
const matchSound = new Audio("sounds/cheer.mp3");
const mismatchSound = new Audio("sounds/oops.mp3");
const bgMusic = new Audio("sounds/kids.mp3");
bgMusic.loop = true;

// Level and card sets
let level = localStorage.getItem("selectedLevel") || "easy";

const cardSets = {
    easy: [
        { pair: "🐶", hint: "D", fact: "Dogs can learn over 1000 words!" },
        { pair: "🐱", hint: "C", fact: "Cats sleep for 70% of their lives." },
        { pair: "🐰", hint: "R", fact: "Rabbits' teeth never stop growing." },
        { pair: "🐼", hint: "P", fact: "Pandas eat for up to 14 hours a day." },
        { pair: "🦊", hint: "F", fact: "Foxes use 40 different sounds to communicate." },
        { pair: "🐸", hint: "F", fact: "Frogs absorb water through their skin." }
    ],
    medium: [
        { pair: "🍎", hint: "A", fact: "Apples float because 25% of their volume is air." },
        { pair: "🍌", hint: "B", fact: "Bananas are berries, but strawberries aren't." },
        { pair: "🍉", hint: "W", fact: "Watermelons are 92% water." },
        { pair: "🍓", hint: "S", fact: "Strawberries are the only fruit with seeds outside." },
        { pair: "🍇", hint: "G", fact: "Grapes explode in the microwave!" },
        { pair: "🍊", hint: "O", fact: "Oranges are a hybrid of pomelo and mandarin." },
        { pair: "🍒", hint: "C", fact: "Cherries contain melatonin that helps sleep." },
        { pair: "🥝", hint: "K", fact: "Kiwis contain more vitamin C than oranges." },
        { pair: "🍍", hint: "P", fact: "Pineapples regenerate!" },
        { pair: "🥥", hint: "C", fact: "Coconuts kill more people than sharks each year." },
        { pair: "🍋", hint: "L", fact: "Lemons can power light bulbs." },
        { pair: "🍐", hint: "P", fact: "Pears are related to apples and roses." }
    ],
    hard: [
        { pair: "🚗", hint: "C", fact: "Cars were invented in 1886." },
        { pair: "✈️", hint: "P", fact: "Planes fly at about 35,000 feet." },
        { pair: "🚀", hint: "R", fact: "Rockets can exceed speeds of 25,000 mph!" },
        { pair: "🚁", hint: "H", fact: "Helicopters can hover in one place." },
        { pair: "🚤", hint: "S", fact: "Speedboats can reach 100 mph." },
        { pair: "🚂", hint: "T", fact: "Trains can run on electricity or steam." },
        { pair: "🛳️", hint: "S", fact: "Cruise ships can carry 6000+ passengers." },
        { pair: "🚌", hint: "B", fact: "Some buses can carry over 120 people." },
        { pair: "🚲", hint: "B", fact: "Bicycles were invented in the 19th century." },
        { pair: "🏍️", hint: "M", fact: "Motorcycles can be faster than cars." },
        { pair: "🚜", hint: "T", fact: "Tractors help with farming tasks." },
        { pair: "🚕", hint: "T", fact: "Taxis first appeared in the 1600s (as horse carriages)." },
        { pair: "🚑", hint: "A", fact: "Ambulances often have mirrored writing on front." },
        { pair: "🚒", hint: "F", fact: "Fire trucks carry hundreds of gallons of water." },
        { pair: "🚚", hint: "T", fact: "Trucks move over 70% of goods in the U.S." },
        { pair: "🚎", hint: "E", fact: "Electric buses produce no emissions." }
    ]
};

const levelConfig = {
    easy: { gridClass: "easy-grid", pairs: 6, time: 60, next: "medium" },
    medium: { gridClass: "medium-grid", pairs: 12, time: 90, next: "hard" },
    hard: { gridClass: "hard-grid", pairs: 16, time: 120, next: null }
};

let gameCards = [];
let flippedCards = [];
let matchedPairs = 0;
let score = 0;
let timeLeft;
let timerInterval;
let gameStarted = false;

document.addEventListener("DOMContentLoaded", () => {
    if (gameBoard) {
        gameBoard.className = `game-board ${levelConfig[level].gridClass}`;
        applySavedTheme();
        setLevel();
        startGame();
    }

    // Request music play on first user interaction
    document.body.addEventListener("click", startBackgroundMusic, { once: true });
});
function startBackgroundMusic() {
    bgMusic.play().catch((err) => {
        console.warn("Autoplay blocked:", err);
    });
}
function setLevel() {
    let levelData = levelConfig[level];
    const baseCards = cardSets[level].slice(0, levelData.pairs);
    gameCards = [];

    baseCards.forEach(card => {
        gameCards.push({ type: "emoji", value: card.pair, fact: card.fact });
        gameCards.push({ type: "hint", value: card.hint, pair: card.pair, fact: card.fact });
    });

    timeLeft = levelData.time;
    matchedPairs = 0;
    score = 0;
    timerDisplay.textContent = timeLeft;
    scoreDisplay.textContent = score;
}

function startGame() {
    gameBoard.innerHTML = "";
    shuffleCards();
    createBoard();
}

function shuffleCards() {
    gameCards.sort(() => Math.random() - 0.5);
}

function createBoard() {
    gameCards.forEach((cardData) => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.value = cardData.value;
        card.dataset.type = cardData.type;
        card.dataset.pair = cardData.pair || cardData.value;
        card.dataset.fact = cardData.fact;
        card.textContent = "?";
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });
}

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

function flipCard() {
    if (this.textContent !== "?" || flippedCards.length >= 2) return;

    this.textContent = this.dataset.value;
    flippedCards.push(this);
    startTimer();

    if (flippedCards.length === 2) {
        setTimeout(checkMatch, 700);
    }
}

function checkMatch() {
    const [card1, card2] = flippedCards;

    if (
        card1.dataset.pair === card2.dataset.pair &&
        card1.dataset.type !== card2.dataset.type
    ) {
        // Match found
        score += 10;
        matchedPairs++;
        matchSound.play();
        card1.style.pointerEvents = "none";
        card2.style.pointerEvents = "none";
        showFact(card1.dataset.fact);

        if (matchedPairs === gameCards.length / 2) {
            completeLevel();
        }
    } else {
        // No match
        mismatchSound.play();
        setTimeout(() => {
            card1.textContent = "?";
            card2.textContent = "?";
        }, 400);
    }

    flippedCards = [];
    scoreDisplay.textContent = score;
}

function showFact(fact) {
    const factBox = document.createElement("div");
    factBox.classList.add("fact-popup");
    factBox.textContent = fact;
    document.body.appendChild(factBox);

    setTimeout(() => {
        factBox.remove();
    }, 3000);
}

function completeLevel() {
    clearInterval(timerInterval);
    setTimeout(() => {
        alert(`🎉 You completed the ${level.toUpperCase()} level!`);
        const next = levelConfig[level].next;
        if (next) {
            localStorage.setItem("selectedLevel", next);
            window.location.href = next + ".html";
        } else {
            alert("You’ve completed all levels! Restarting...");
            resetGame();
        }
    }, 800);
}

function endGame() {
    clearInterval(timerInterval);
    alert(`⏰ Time's up! Your Score: ${score}`);
    resetGame();
}

function resetGame() {
    localStorage.setItem("selectedLevel", "easy");
    window.location.href = "easy.html";
}

function applySavedTheme() {
    const savedTheme = localStorage.getItem("selectedTheme") || "light";
    document.body.className = savedTheme;
}

// Volume Control
const volumeSlider = document.getElementById("volume-slider");

volumeSlider.addEventListener("input", () => {
    const volume = parseFloat(volumeSlider.value);
    matchSound.volume = volume;
    mismatchSound.volume = volume;
    bgMusic.volume = volume;
});
const initialVolume = parseFloat(volumeSlider.value);
matchSound.volume = initialVolume;
mismatchSound.volume = initialVolume;
bgMusic.volume = initialVolume;
