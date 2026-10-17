const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score-value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")

const audio = new Audio(`audio.mp3`)

const size = 15              // tamanho de cada quadradinho
const initialSpeed = 150     // velocidade inicial (ms entre cada movimento)
const speedStep = 1          // quanto acelera a cada comida
const minSpeed = 70          // limite: nunca fica mais rápido que isso
let currentSpeed = initialSpeed

const createSnake = () =>
    Array.from({ length: 6 }, (_, i) => ({ x: 60 + i * size, y: 240 }))

let snake = createSnake()

const incrementScore = () => {
    score.innerText = +score.innerText + 10
}

const increaseSpeed = () => {
    currentSpeed = Math.max(minSpeed, currentSpeed - speedStep)
}

const randomNumber = (min, max) => {
    return Math.round(Math.random() * (max - min) + min)
}

const randomPosition = () => {
    const number = randomNumber(0, canvas.width - size)
    return Math.round(number / size) * size
}

const randomColor = () => {
    const red = randomNumber(0, 255)
    const green = randomNumber(0, 255)
    const blue = randomNumber(0, 255)

    return `rgb(${red}, ${green}, ${blue})`
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let direction
let loopId
let isGameOver = false   // trava o jogo depois que a cobrinha morre

const drawFood = () => {
    const { x, y, color } = food

    ctx.shadowColor = color
    ctx.shadowBlur = 10
    ctx.fillStyle = color
    ctx.fillRect(x, y, size, size)
    ctx.shadowBlur = 0
}

const drawSnake = () => {
    ctx.fillStyle = "#ddd"

    snake.forEach((position, index) => {
        if (index == snake.length - 1) {
            ctx.fillStyle = "white"
        }
        ctx.fillRect(position.x, position.y, size, size)
    })
}

const moveSnake = () => {
    if (!direction) return

    const head = snake[snake.length - 1]

    if (direction == "right") snake.push({ x: head.x + size, y: head.y })
    if (direction == "left")  snake.push({ x: head.x - size, y: head.y })
    if (direction == "down")  snake.push({ x: head.x, y: head.y + size })
    if (direction == "up")    snake.push({ x: head.x, y: head.y - size })

    snake.shift()
}

const drawGrid = () => {
    ctx.lineWidth = 1
    ctx.strokeStyle = "#191919"

    for (let i = size; i < canvas.width; i += size) {
        ctx.beginPath()
        ctx.lineTo(i, 0)
        ctx.lineTo(i, canvas.height)
        ctx.stroke()

        ctx.beginPath()
        ctx.lineTo(0, i)
        ctx.lineTo(canvas.width, i)
        ctx.stroke()
    }
}

const chackEat = () => {
    const head = snake[snake.length - 1]

    if (head.x == food.x && head.y == food.y) {
        incrementScore()
        increaseSpeed()
        snake.push(head)
        audio.play()

        let x = randomPosition()
        let y = randomPosition()

        while (snake.find((position) => position.x == x && position.y == y)) {
            x = randomPosition()
            y = randomPosition()
        }

        food.x = x
        food.y = y
        food.color = randomColor()
    }
}

const checkCollision = () => {
    const head = snake[snake.length - 1]
    const canvasLimit = canvas.width - size
    const neckIndex = snake.length - 2

    const wallCollision =
        head.x < 0 || head.x > canvasLimit || head.y < 0 || head.y > canvasLimit

    const selfCollision = snake.find((position, index) => {
        return index < neckIndex && position.x == head.x && position.y == head.y
    })

    if (wallCollision || selfCollision) {
        gameOver()
    }
}

const gameOver = () => {
    isGameOver = true
    clearTimeout(loopId)
    direction = undefined

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    canvas.style.filter = "blur(2px)"
}

const gameLoop = () => {
    clearTimeout(loopId)

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawGrid()
    drawFood()
    moveSnake()
    drawSnake()
    chackEat()
    checkCollision()

    if (isGameOver) return   // morreu: não agenda o próximo movimento

    loopId = setTimeout(gameLoop, currentSpeed)
}
gameLoop()

// ---------- CONTROLES ----------

// Função única usada pelo teclado e pelo toque
const changeDirection = (newDirection) => {
    if (isGameOver) return   // ignora setas e deslizes depois de morrer
    if (newDirection == "right" && direction != "left")  direction = "right"
    if (newDirection == "left"  && direction != "right") direction = "left"
    if (newDirection == "down"  && direction != "up")    direction = "down"
    if (newDirection == "up"    && direction != "down")  direction = "up"
}

document.addEventListener("keydown", ({ key }) => {
    if (key == "ArrowRight") changeDirection("right")
    if (key == "ArrowLeft")  changeDirection("left")
    if (key == "ArrowDown")  changeDirection("down")
    if (key == "ArrowUp")    changeDirection("up")
})

// Deslizar o dedo
let touchStartX = 0
let touchStartY = 0
const minSwipe = 25 // distância mínima (px) para contar como deslize

document.addEventListener("touchstart", (event) => {
    const touch = event.changedTouches[0]
    touchStartX = touch.clientX
    touchStartY = touch.clientY
}, { passive: true })

document.addEventListener("touchend", (event) => {
    const touch = event.changedTouches[0]
    const dx = touch.clientX - touchStartX
    const dy = touch.clientY - touchStartY

    if (Math.max(Math.abs(dx), Math.abs(dy)) < minSwipe) return

    if (Math.abs(dx) > Math.abs(dy)) {
        changeDirection(dx > 0 ? "right" : "left")
    } else {
        changeDirection(dy > 0 ? "down" : "up")
    }
}, { passive: true })

buttonPlay.addEventListener("click", () => {
    score.innerText = "00"
    menu.style.display = "none"
    canvas.style.filter = "none"

    snake = createSnake()
    direction = undefined
    currentSpeed = initialSpeed
    isGameOver = false
    gameLoop()   // reinicia o loop, que foi parado no Game Over
})