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
        { pair: "🐶", hint: "D", name: "Dog", fact: "Dogs can learn over 1000 words!" },
        { pair: "🐱", hint: "C", name: "Cat", fact: "Cats sleep for 70% of their lives." },
        { pair: "🐰", hint: "R", name: "Rabbit", fact: "Rabbits' teeth never stop growing." },
        { pair: "🐼", hint: "P", name: "Panda", fact: "Pandas eat for up to 14 hours a day." },
        { pair: "🦊", hint: "F", name: "Fox", fact: "Foxes use 40 different sounds to communicate." },
        { pair: "🐸", hint: "F", name: "Frog", fact: "Frogs absorb water through their skin." }
    ],
    medium: [
        { pair: "🍎", hint: "A", name: "Apple", fact: "Apples float because 25% of their volume is air." },
        { pair: "🍌", hint: "B", name: "Banana", fact: "Bananas are berries, but strawberries aren't." },
        { pair: "🍉", hint: "W", name: "Watermelon", fact: "Watermelons are 92% water." },
        { pair: "🍓", hint: "S", name: "Strawberry", fact: "Strawberries are the only fruit with seeds outside." },
        { pair: "🍇", hint: "G", name: "Grapes", fact: "Grapes explode in the microwave!" },
        { pair: "🍊", hint: "O", name: "Orange", fact: "Oranges are a hybrid of pomelo and mandarin." },
        { pair: "🍒", hint: "C", name: "Cherry", fact: "Cherries contain melatonin that helps sleep." },
        { pair: "🥝", hint: "K", name: "Kiwi", fact: "Kiwis contain more vitamin C than oranges." },
        { pair: "🍍", hint: "P", name: "Pineapple", fact: "Pineapples regenerate!" },
        { pair: "🥥", hint: "C", name: "Coconut", fact: "Coconuts kill more people than sharks each year." },
        { pair: "🍋", hint: "L", name: "Lemon", fact: "Lemons can power light bulbs." },
        { pair: "🍐", hint: "P", name: "Pear", fact: "Pears are related to apples and roses." }
    ],
    hard: [
        { pair: "🚗", hint: "C", name: "Car", fact: "Cars were invented in 1886." },
        { pair: "✈️", hint: "P", name: "Plane", fact: "Planes fly at about 35,000 feet." },
        { pair: "🚀", hint: "R", name: "Rocket", fact: "Rockets can exceed speeds of 25,000 mph!" },
        { pair: "🚁", hint: "H", name: "Helicopter", fact: "Helicopters can hover in one place." },
        { pair: "🚤", hint: "S", name: "Speedboat", fact: "Speedboats can reach 100 mph." },
        { pair: "🚂", hint: "T", name: "Train", fact: "Trains can run on electricity or steam." },
        { pair: "🛳️", hint: "S", name: "Ship", fact: "Cruise ships can carry 6000+ passengers." },
        { pair: "🚌", hint: "B", name: "Bus", fact: "Some buses can carry over 120 people." },
        { pair: "🚲", hint: "B", name: "Bicycle", fact: "Bicycles were invented in the 19th century." },
        { pair: "🏍️", hint: "M", name: "Motorcycle", fact: "Motorcycles can be faster than cars." },
        { pair: "🚜", hint: "T", name: "Tractor", fact: "Tractors help with farming tasks." },
        { pair: "🚕", hint: "T", name: "Taxi", fact: "Taxis first appeared in the 1600s (as horse carriages)." },
        { pair: "🚑", hint: "A", name: "Ambulance", fact: "Ambulances often have mirrored writing on front." },
        { pair: "🚒", hint: "F", name: "Fire Truck", fact: "Fire trucks carry hundreds of gallons of water." },
        { pair: "🚚", hint: "T", name: "Truck", fact: "Trucks move over 70% of goods in the U.S." },
        { pair: "🚎", hint: "E", name: "Electric Bus", fact: "Electric buses produce no emissions." }
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
        gameCards.push({ type: "emoji", value: card.pair, fact: card.fact, name: card.name });
        gameCards.push({ type: "hint", value: card.hint, pair: card.pair, fact: card.fact, name: card.name });
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
        // Create card container
        const cardContainer = document.createElement("div");
        cardContainer.classList.add("card-container");

        // Create card inner wrapper
        const cardInner = document.createElement("div");
        cardInner.classList.add("card-inner");

        // Card front (with "?")
        const cardFront = document.createElement("div");
        cardFront.classList.add("card-front");
        cardFront.textContent = "?";

        // Card back (with emoji or hint)
        const cardBack = document.createElement("div");
        cardBack.classList.add("card-back");
        cardBack.textContent = cardData.value;

        // Attach data to card inner
        cardInner.dataset.value = cardData.value;
        cardInner.dataset.type = cardData.type;
        cardInner.dataset.pair = cardData.pair || cardData.value;
        cardInner.dataset.fact = cardData.fact;
        cardInner.dataset.name = cardData.name;

        // Add click listener
        cardInner.addEventListener("click", flipCard);

        // Assemble card
        cardInner.appendChild(cardFront);
        cardInner.appendChild(cardBack);
        cardContainer.appendChild(cardInner);

        // Label for the name — only for emoji cards
        if (cardData.type === "emoji") {
            const label = document.createElement("div");
            label.classList.add("label");
            label.textContent = "";
            cardContainer.appendChild(label);
        }

        gameBoard.appendChild(cardContainer);
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
    if (this.classList.contains("flipped") || flippedCards.length >= 2) return;

    this.classList.add("flipped");

    const label = this.parentElement.querySelector(".label");
    if (label) {
        label.textContent = this.dataset.name;
    }

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

        // Disable matched cards
        card1.style.pointerEvents = "none";
        card2.style.pointerEvents = "none";

        // Show fact popup
        showFact(card1.dataset.fact);

        // Check if all pairs matched
        if (matchedPairs === gameCards.length / 2) {
            completeLevel();
        }
    } else {
        // No match — flip both cards back and clear labels
        mismatchSound.play();
        setTimeout(() => {
            card1.classList.remove("flipped");
            card2.classList.remove("flipped");

            const label1 = card1.parentElement.querySelector(".label");
            const label2 = card2.parentElement.querySelector(".label");
            if (label1) label1.textContent = "";
            if (label2) label2.textContent = "";
        }, 400);
    }

    // Reset flipped cards and update score
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
        alert(`🎉 You completed the ${level.toUpperCase()} level!\n\nYour Score: ${score} points`);
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

// Load saved volume or set to default (0.5)
const savedVolume = localStorage.getItem("gameVolume");
const initialVolume = savedVolume !== null ? parseFloat(savedVolume) : parseFloat(volumeSlider.value);

// Set initial volume to all audio elements
matchSound.volume = initialVolume;
mismatchSound.volume = initialVolume;
bgMusic.volume = initialVolume;

// Set slider to reflect the stored or default volume
volumeSlider.value = initialVolume;

// Update volume and save to localStorage on slider input
volumeSlider.addEventListener("input", () => {
    const volume = parseFloat(volumeSlider.value);

    // Apply new volume to all sounds
    matchSound.volume = volume;
    mismatchSound.volume = volume;
    bgMusic.volume = volume;

    // Save to localStorage
    localStorage.setItem("gameVolume", volume);
});

