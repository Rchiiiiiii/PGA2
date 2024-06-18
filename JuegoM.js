const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const astronautImg = document.getElementById('astronaut');
const astronautWidth = 50;
const astronautHeight = 60;
let astronautX = (canvas.width - astronautWidth) / 2;
let astronautY = canvas.height - astronautHeight -65;
let astronautSpeedX = 0.0055;
let astronautSpeedY = 0.0055;

const livesDisplay = document.getElementById('lives');
const levelDisplay = document.getElementById('level');
const gameOverMessage = document.getElementById('gameOverMessage');
const retryButton = document.getElementById('retryButton');
let lives = 20;
let gameOver = false;

const objectImg = document.getElementById('object');
const objects = [];
const objectWidth = 300;
const objectHeight = 300;

let level = 1;
let objectSpeed = 4;
const maxLevel = 10;
const levelUpInterval = 15000;

let objectCreationInterval = 1500;
let objectCreationTimer;
let levelUpTimer;

let breathing = true;
let breathIncrement = 0.00050;
let breathScale = 1;

const introMessage = document.getElementById('introMessage');
const countdownMessage = document.getElementById('countdownMessage');
const countdownElement = document.getElementById('countdown');

let gameStarted = false;

let animationPaused = false;
let animationFrameId;

function pauseAnimations() {
    cancelAnimationFrame(animationFrameId);
    clearInterval(objectCreationTimer);
    clearInterval(levelUpTimer);
    animationPaused = true;
}

function resumeAnimations() {
    animationFrameId = requestAnimationFrame(gameLoop);
    objectCreationTimer = setInterval(createObject, objectCreationInterval);
    levelUpTimer = setInterval(levelUp, levelUpInterval);
    animationPaused = false;
}

document.getElementById('pauseButton').addEventListener('click', () => {
    if (!animationPaused) {
        pauseAnimations();
    }
});

document.getElementById('resumeButton').addEventListener('click', () => {
    if (animationPaused) {
        resumeAnimations();
    }
});

function createObject() {
    const x = Math.random() * (canvas.width - objectWidth);
    objects.push({ x, y: 0 });
}

function updateObjects() {
    for (let i = 0; i < objects.length; i++) {
        objects[i].y += objectSpeed;
        if (objects[i].y > canvas.height) {
            objects.splice(i, 1);
            i--;
        }
    }
}

function drawObjects() {
    for (const obj of objects) {
        ctx.drawImage(objectImg, obj.x, obj.y, objectWidth, objectHeight);
    }
}

function checkCollision() {
    for (let i = 0; i < objects.length; i++) {
        if (objects[i].x < astronautX + astronautWidth &&
            objects[i].x + objectWidth > astronautX &&
            objects[i].y < astronautY + astronautHeight &&
            objects[i].y + objectHeight > astronautY) {
            objects.splice(i, 1);
            i--;
            lives--;
            livesDisplay.textContent = `Vidas: ${lives}`;
            if ((level === maxLevel && lives <= 0) || (level !== maxLevel && lives <= 0)) {
                gameOver = true;
                gameOverMessage.style.display = 'block';
                if (level === maxLevel) {
                    showEndScreen();
                }
                cancelAnimationFrame(gameLoop);
                clearInterval(objectCreationTimer);
                clearInterval(levelUpTimer);
            }
        }
    }
}

function drawAstronaut() {
    ctx.save();
    ctx.translate(astronautX + astronautWidth / 2, astronautY + astronautHeight / 2);
    ctx.scale(breathScale, breathScale);
    ctx.translate(-(astronautX + astronautWidth / 2), -(astronautY + astronautHeight / 2));
    ctx.drawImage(astronautImg, astronautX, astronautY, astronautWidth, astronautHeight);
    ctx.restore();
}

function gameLoop() {
    if (!gameOver && !animationPaused) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updateObjects();
        drawObjects();
        checkCollision();
        drawAstronaut();
        astronautX += astronautSpeedX;
        astronautY += astronautSpeedY;
        if (astronautX < 0) astronautX = 0;
        if (astronautX > canvas.width - astronautWidth) astronautX = canvas.width - astronautWidth;
        if (astronautY < 0) astronautY = 0;
        if (astronautY > canvas.height - astronautHeight) astronautY = canvas.height - astronautHeight;
        animateBreathing();
    }

    animationFrameId = requestAnimationFrame(gameLoop);
}

function moveAstronaut(direction) {
    const moveSpeed = 15;
    if (direction === 'left') {
        astronautSpeedX = -moveSpeed;
    } else if (direction === 'right') {
        astronautSpeedX = moveSpeed;
    } else if (direction === 'up') {
        astronautSpeedY = -moveSpeed;
    } else if (direction === 'down') {
        astronautSpeedY = moveSpeed;
    }
}

function stopAstronaut() {
    astronautSpeedX = 0;
    astronautSpeedY = 0;
}

function animateBreathing() {
    if (breathing) {
        breathScale += breathIncrement;
        if (breathScale > 1.0 || breathScale < 0.95) {
            breathIncrement = -breathIncrement;
        }
    }
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') {
        moveAstronaut('left');
    } else if (event.key === 'ArrowRight') {
        moveAstronaut('right');
    } else if (event.key === 'ArrowUp') {
        moveAstronaut('up');
    } else if (event.key === 'ArrowDown') {
        moveAstronaut('down');
    }
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight' || event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        stopAstronaut();
    }
});

document.getElementById('leftButton').addEventListener('touchstart', () => moveAstronaut('left'));
document.getElementById('leftButton').addEventListener('touchend', () => stopAstronaut());
document.getElementById('rightButton').addEventListener('touchstart', () => moveAstronaut('right'));
document.getElementById('rightButton').addEventListener('touchend', () => stopAstronaut());
document.getElementById('upButton').addEventListener('touchstart', () => moveAstronaut('up'));
document.getElementById('upButton').addEventListener('touchend', () => stopAstronaut());
document.getElementById('downButton').addEventListener('touchstart', () => moveAstronaut('down'));
document.getElementById('downButton').addEventListener('touchend', () => stopAstronaut());

retryButton.addEventListener('click', () => {
    lives = 20;
    livesDisplay.textContent = `Vidas: ${lives}`;
    level = 1;
    levelDisplay.textContent = `Nivel: ${level}`;
    objectSpeed = 4;
    objectCreationInterval = 4000;
    objects.length = 0;
    gameOverMessage.style.display = 'none';
    gameOver = false;
    clearInterval(objectCreationTimer);
    clearInterval(levelUpTimer);

    if (gameStarted) {
        startGame();
    } else {
        startIntroAndCountdown();
    }
});

function levelUp() {
    if (level < maxLevel) {
        level++;
        levelDisplay.textContent = `Nivel: ${level}`;
        objectSpeed += 1.5;
        objectCreationInterval *= 0.7;
        clearInterval(objectCreationTimer);
        objectCreationTimer = setInterval(createObject, objectCreationInterval);
    }
}

function startCountdown() {
    let countdown = 3;
    countdownElement.textContent = countdown;
    countdownMessage.style.display = 'flex';
    introMessage.style.display = 'none';
    const countdownInterval = setInterval(() => {
        countdown--;
        countdownElement.textContent = countdown;
        if (countdown === 0) {
            clearInterval(countdownInterval);
            countdownMessage.style.display = 'none';
            startGame();
        }
    }, 1000);
}

function startGame() {
    gameStarted = true;
    createObject();
    objectCreationTimer = setInterval(createObject, objectCreationInterval);
    levelUpTimer = setInterval(levelUp, levelUpInterval);
    gameLoop();
}

function startIntroAndCountdown() {
    elapsedTime = 0;
    introMessage.style.display = 'flex';
    countdownMessage.style.display = 'none';
    introAndCountdownInterval = setInterval(updateIntroAndCountdown, 1000);
}

const introDuration = 10000;
const countdownDuration = 3000;
let elapsedTime = 0;
const totalDuration = introDuration + countdownDuration;

function updateIntroAndCountdown() {
    elapsedTime += 1000;
    if (elapsedTime < introDuration) {
        introMessage.style.display = 'flex';
        countdownMessage.style.display = 'none';
    } else if (elapsedTime < totalDuration) {
        introMessage.style.display = 'none';
        countdownMessage.style.display = 'flex';
        let countdown = Math.ceil((totalDuration - elapsedTime) / 1000);
        countdownElement.textContent = countdown;
    } else {
        clearInterval(introAndCountdownInterval);
        countdownMessage.style.display = 'none';
        startGame();
    }
}

function showEndScreen() {
    // Detener la animación y limpiar el lienzo
    cancelAnimationFrame(animationFrameId);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Mostrar fondo negro
    ctx.fillStyle = 'black';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Mostrar mensaje de felicitaciones
    ctx.fillStyle = 'white';
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    const endMessage = "El final era inevitable, tu muerte llegaría pronto, pero luchaste por tu vida";
    ctx.fillText(endMessage, canvas.width / 2, canvas.height / 2);

    // Reproducir música de fondo
    const endMusic = document.getElementById('endMusic');
    endMusic.play();
}

startIntroAndCountdown();
