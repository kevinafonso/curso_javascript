const canvas = document.querySelector("canvas")
const ctx = canvas.getContext("2d")

const score = document.querySelector(".score-value")
const finalScore = document.querySelector(".final-score > span")
const menu = document.querySelector(".menu-screen")
const buttonPlay = document.querySelector(".btn-play")
const congrats = document.querySelector(".congrats")
const rankingList = document.querySelector(".ranking-list")
const nameForm = document.querySelector(".name-form")
const nameInput = document.querySelector(".name-input")
const buttonSave = document.querySelector(".btn-save")

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

// 100 cores vivas e claras (saturação 100%, luminosidade 55% a 70%),
// todas bem longe do preto do fundo
const foodColors = Array.from({ length: 100 }, (_, i) =>
    `hsl(${Math.round(i * 3.6)}, 100%, ${[55, 62, 70][i % 3]}%)`
)

const randomColor = () => {
    return foodColors[Math.floor(Math.random() * foodColors.length)]
}

const food = {
    x: randomPosition(),
    y: randomPosition(),
    color: randomColor()
}

let direction            // direção em que a cobrinha está andando
let directionQueue = []  // viradas pedidas, executadas uma por movimento
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
    // a cada movimento, aplica no máximo UMA virada da fila
    if (directionQueue.length) direction = directionQueue.shift()

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

// ---------- RANKING (TOP 3) COMPARTILHADO (Firebase Firestore) ----------

// >>> COLE AQUI a configuração que o Firebase mostra ao criar o app web
const firebaseConfig = {
    apiKey: "AIzaSyCcLyEEe2NExMeyZEDYcHiVKfN7FG9Jrd4",
    authDomain: "snake-muller.firebaseapp.com",
    projectId: "snake-muller",
    storageBucket: "snake-muller.firebasestorage.app",
    messagingSenderId: "208189229510",
    appId: "1:208189229510:web:4b53e495d86f83d1e30ac7"
}

const firebaseVersion = "10.14.1"
const maxRanking = 25

// Cada score é apagado automaticamente pelo Firestore depois deste prazo (política TTL).
// Se aumentar acima de 120, ajuste também o limite "duration.value(120, 'd')" nas regras.
const scoreLifetimeDays = 90
const maxNameLength = 12
const medals = ["🥇", "🥈", "🥉"]
document.querySelector(".ranking-title").textContent = `🏆 Top ${maxRanking}`

// Pontuação que ainda está esperando o nome do jogador
let pending = null

// Carrega o Firebase só quando precisa (funciona até abrindo o index.html direto)
let firebasePromise = null
const getFirebase = () => {
    if (!firebasePromise) {
        const base = `https://www.gstatic.com/firebasejs/${firebaseVersion}`
        firebasePromise = Promise.all([
            import(`${base}/firebase-app.js`),
            import(`${base}/firebase-firestore.js`)
        ]).then(([app, firestore]) => ({
            ...firestore,
            db: firestore.getFirestore(app.initializeApp(firebaseConfig))
        })).catch((error) => {
            firebasePromise = null
            throw error
        })
    }
    return firebasePromise
}

// Busca os 3 maiores scores do banco: lista de { name, score }
const loadRanking = async () => {
    const { db, collection, query, orderBy, limit, getDocs } = await getFirebase()
    const top = query(collection(db, "scores"), orderBy("score", "desc"), limit(maxRanking))
    const snapshot = await getDocs(top)

    return snapshot.docs.map((doc) => ({ name: doc.data().name, score: doc.data().score }))
}

// Grava um novo score no banco
const saveScore = async (name, score) => {
    const { db, collection, addDoc, serverTimestamp } = await getFirebase()
    const expireAt = new Date(Date.now() + scoreLifetimeDays * 24 * 60 * 60 * 1000)
    await addDoc(collection(db, "scores"), { name, score, createdAt: serverTimestamp(), expireAt })
}

// Devolve a posição em que a pontuação entra (0 = 1º lugar) ou -1 se não entra
const findPosition = (ranking, points) => {
    if (points <= 0) return -1

    const position = ranking.findIndex((entry) => points > entry.score)
    if (position === -1 && ranking.length < maxRanking) return ranking.length

    return position
}

// Coloca o novo registro na posição certa e corta o que passar do Top 3
const insertEntry = (ranking, position, entry) => {
    const updated = [...ranking]
    updated.splice(position, 0, entry)
    return updated.slice(0, maxRanking)
}

const renderRanking = (ranking, highlight) => {
    rankingList.innerHTML = ""

    // sempre desenha as 25 posições; as ainda vazias aparecem com "—"
    for (let i = 0; i < maxRanking; i++) {
        const item = document.createElement("li")
        const entry = ranking[i]
        const place = i < medals.length ? medals[i] : `${i + 1}º`

        if (entry) {
            item.textContent = `${place} ${entry.name}: ${entry.score}`
        } else {
            item.textContent = `${place} —`
            item.classList.add("empty")
        }

        if (i === highlight) item.classList.add("new-record")
        rankingList.appendChild(item)
    }

    // rola a lista até a linha do jogador
    const mine = rankingList.querySelector(".new-record")
    if (mine) mine.scrollIntoView({ block: "nearest" })
}

const renderMessage = (text) => {
    rankingList.innerHTML = ""
    const item = document.createElement("li")
    item.textContent = text
    rankingList.appendChild(item)
}

// Chamado quando a partida termina
const showResult = async (points) => {
    congrats.innerText = ""
    congrats.classList.remove("first")
    nameForm.style.display = "none"
    pending = null
    renderMessage("Carregando ranking...")

    let ranking
    try {
        ranking = await loadRanking()
    } catch (error) {
        if (isGameOver) renderMessage("Ranking indisponível no momento")
        return
    }

    if (!isGameOver) return // a pessoa já começou outra partida

    const position = findPosition(ranking, points)

    if (position === -1) {
        renderRanking(ranking, -1)
        return
    }

    congrats.classList.toggle("first", position === 0)
    congrats.innerText = position === 0
        ? "🏆 PARABÉNS! Você é o número 1 agora!"
        : `🎉 Parabéns! Você entrou no Top ${maxRanking} (${position + 1}º lugar)!`

    // mostra uma prévia do ranking e pede o nome
    pending = { points, position }
    nameInput.value = ""
    nameForm.style.display = "flex"
    renderRanking(insertEntry(ranking, position, { name: "Você", score: points }), position)
    nameInput.focus()
}

// Salva a pontuação pendente com o nome digitado
const commitPending = async () => {
    if (!pending) return

    const { points, position } = pending
    const name = nameInput.value.trim().slice(0, maxNameLength) || "Anônimo"

    pending = null
    nameForm.style.display = "none"

    try {
        await saveScore(name, points)
        const updated = await loadRanking()
        if (isGameOver) renderRanking(updated, position)
    } catch (error) {
        if (isGameOver) congrats.innerText = "Não foi possível salvar seu score. Tente de novo mais tarde."
    }
}

buttonSave.addEventListener("click", commitPending)

nameInput.addEventListener("keydown", (event) => {
    if (event.key == "Enter") commitPending()
})

const gameOver = () => {
    isGameOver = true
    clearTimeout(loopId)
    direction = undefined
    directionQueue = []

    menu.style.display = "flex"
    finalScore.innerText = score.innerText
    showResult(+score.innerText)
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
const opposites = { left: "right", right: "left", up: "down", down: "up" }

const changeDirection = (newDirection) => {
    if (isGameOver) return   // ignora setas e deslizes depois de morrer

    // compara com a última virada pedida (ou com a direção atual).
    // Antes do primeiro movimento a cobrinha está virada para a direita.
    const last = directionQueue.length
        ? directionQueue[directionQueue.length - 1]
        : (direction ?? "right")

    if (newDirection == last) return               // mesma direção
    if (newDirection == opposites[last]) return    // voltar em cima de si mesma
    if (directionQueue.length >= 2) return         // fila cheia

    directionQueue.push(newDirection)
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
    commitPending()   // se esqueceu de salvar, grava como "Anônimo"
    score.innerText = "00"
    menu.style.display = "none"
    canvas.style.filter = "none"

    snake = createSnake()
    direction = undefined
    directionQueue = []
    currentSpeed = initialSpeed
    isGameOver = false
    gameLoop()   // reinicia o loop, que foi parado no Game Over
})

// Impede que arrastar o dedo selecione o jogo ou os textos (exceto o campo de nome)
document.addEventListener("selectstart", (event) => {
    if (event.target !== nameInput) event.preventDefault()
})