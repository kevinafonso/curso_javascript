const mario = document.querySelector('.mario');
const pipe = document.querySelector('.pipe');

const score = document.querySelector(".score-value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")
const canvas = mario.parentElement; // elemento que recebe o blur no game over

// Guarda a imagem original do Mario para poder restaurar depois
const marioOriginalSrc = mario.src;

const START_DELAY = 1000; // tempo de espera antes de iniciar (em milissegundos)

let gameRunning = false;
let loop;

const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

const jump = () => {
    // Não pula se o jogo não está rodando ou se já está no ar
    if (!gameRunning || mario.classList.contains('jump')) return;

    mario.classList.add('jump');

    setTimeout(() => {
        mario.classList.remove('jump');
        // Só pontua se o jogo ainda estiver rodando
        if (gameRunning) incrementScore();
    }, 650);
}

const gameOver = () => {
    gameRunning = false;

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"
}

const startLoop = () => {
    loop = setInterval(() => {
        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80) {
            pipe.style.animation = 'none';
            pipe.style.left = `${pipePosition}px`;

            mario.style.animation = 'none';
            mario.style.bottom = `${marioPosition}px`;

            mario.src = 'imagens/game-over.png';
            mario.style.width = '75px';
            mario.style.marginLeft = '50px';

            clearInterval(loop);
            gameOver();
        }
    }, 10);
}

const startGame = () => {
    // Trava o jogo e para qualquer loop antigo
    gameRunning = false;
    clearInterval(loop);

    // Segura o cano parado (fora da tela)
    pipe.style.animation = 'none';
    pipe.style.left = '';

    // Restaura o Mario
    mario.classList.remove('jump');
    mario.style.animation = '';
    mario.style.bottom = '';
    mario.style.width = '';
    mario.style.marginLeft = '';
    mario.src = marioOriginalSrc;

    score.innerText = "00";
    menu.style.display = "none";
    canvas.style.filter = "none";

    // Espera 1 segundo e só então libera o jogo
    setTimeout(() => {
        pipe.offsetWidth; // força o navegador a reiniciar a animação
        pipe.style.animation = '';

        gameRunning = true;
        startLoop();
    }, START_DELAY);
}

// Teclado: só a barra de espaço
document.addEventListener('keydown', (event) => {
    if (event.code === 'Space') {
        event.preventDefault();
        jump();
    }
});

// Mouse + toque no celular
document.addEventListener('pointerdown', (event) => {
    if (event.target.closest('.menu-screen')) return;
    jump();
});

buttonPlay.addEventListener("click", startGame);

// Inicia o jogo ao carregar a página (com a espera)
startGame();