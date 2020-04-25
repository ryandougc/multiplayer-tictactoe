const socket = io('http://localhost:3000')
const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'
const WINNING_COMBINATIONS = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
]
const gameContainer = document.getElementById('game-container')
const board = document.getElementById('board')
const cellElements = document.querySelectorAll('[data-cell]')
const winningMessageElement = document.getElementById('winningMessage')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
const restartButton = document.getElementById('restartButton')
let circleTurn

//User joins game
if (board != null) {
    const name = prompt('What is your name?')
    socket.emit('new-user', gameName, name)
}

socket.on('game-created', game => {
    const gameElement = document.createElement('div')
    gameElement.innerText = game
    const gameLink = document.createElement('a')
    gameLink.href = `/${game}`
    gameLink.innerText = 'join'
    gameContainer.append(gameElement)
    gameContainer.append(gameLink)
})

socket.on('user-connected', user => {
    console.log(user)
})

socket.on('start-game', game => {
    startGame(game)
})

socket.on('init-game', () => {
    console.log('game started')
})

socket.on('user-disconnected', user => {
    console.log(`${user.name} has left!`)
})


restartButton.addEventListener('click', startGame)

function startGame(game) {
    socket.emit('init-game', game)

    circleTurn = false;
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
        cell.removeEventListener('click', handleClick)
        cell.addEventListener('click', handleClick, {once: true})
    })
    setBoardHoverClass()
    winningMessageElement.classList.remove('show')
}

function handleClick(e) {
    const cell = e.target
    const currentClass = circleTurn ? CIRCLE_CLASS : X_CLASS
    
    placeMark(cell, currentClass)

    if (checkWin(currentClass)) {
        endGame(false)
    } else if (isDraw()) {
        endGame(true)
    } else {
        swapTurns()
        setBoardHoverClass()
    }
}

function endGame(draw) {
    if (draw) {
        winningMessageTextElement.innerText = 'Draw!'
    } else {
        winningMessageTextElement.innerText = `${circleTurn ? "O's" : "X's"} Win!`
    }
    winningMessageElement.classList.add('show')
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
}

function placeMark(cell, currentClass){
    cell.classList.add(currentClass)
}

function swapTurns() {
    circleTurn = !circleTurn
}

function setBoardHoverClass() {
    board.classList.remove(X_CLASS)
    board.classList.remove(CIRCLE_CLASS)
    if (circleTurn) {
        board.classList.add(CIRCLE_CLASS)
    } else {
        board.classList.add(X_CLASS)
    }
}

function checkWin(currentClass) {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains(currentClass)
        })
    })
}