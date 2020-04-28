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
let currentTurn
let userShape
let name = getCookie('name')

const nameInput = document.getElementById('inputName')
const nameInputSubmit = document.getElementById('nameInputSubmit')
const gameContainer = document.getElementById('game-container')
const board = document.getElementById('board')
const cellElements = document.querySelectorAll('[data-cell]')
const winningMessageElement = document.getElementById('winningMessage')
const winningMessageTextElement = document.querySelector('[data-winning-message-text]')
const restartButton = document.getElementById('restartButton')
const turnMessage = document.getElementById('turnMessage')

if (nameInput != null) {
    nameInputSubmit.addEventListener('click', () => {
        name = nameInput.value
        document.cookie = `name=${nameInput.value}`
    })
}

//User joins game
if (board != null) {
    socket.emit('new-user', gameName, name)
}

socket.on('game-created', game => {
    const gameElement = document.createElement('div')
    gameElement.innerText = game
    const gameLink = document.createElement('a')
    gameLink.href = `/${game}`
    gameLink.innerText = 'join'
    // gameContainer.append(gameElement)
    // gameContainer.append(gameLink)
})

socket.on('user-connected', user => {
    console.log(user)
    userShape = user.role
})

socket.on('other-user-connected', user => {
    console.log(`${user.name} has joined!`)
})

socket.on('start-game', data => {
    currentTurn = data.turn
    // socket.emit('init-game', data.gameName)
    startGame(data.gameName)
    console.log('game started')
    swapTurns()
})

// socket.on('init-game', () => {
//     console.log('game started')

// })

socket.on('place-mark', data => {
    let cell = document.getElementById(data.cell)
    placeMark(cell, data.currentTurn)
})

socket.on('not-turn', () => {
    cellElements.forEach(cell => {
        cell.removeEventListener('click', handleClick)
        cell.classList.add('none')
    })
    turnMessage.innerText = ""
})

socket.on('turn', () => {
    cellElements.forEach(cell => {
        cell.removeEventListener('click', handleClick)
        cell.addEventListener('click', handleClick, {once: true})
        cell.classList.remove('none')
    })
    turnMessage.innerText = "It's Your Turn!"
})

socket.on('win', shape => {
    winningMessageTextElement.innerText = `${shape}'s Win!`
    winningMessageElement.classList.add('show')
})

socket.on('request-restart', () => {
    console.log('Other player wants to play again')
})

socket.on('user-reconnected', data => {
    startGame(data.gameName)
    data.tiles.forEach( tile => {
        if (tile.checked) {
            document.getElementById(tile.id).classList.add(tile.shape)
        } 
    })
})

socket.on('other-user-reconnected', data => {
    console.log(`${data.user.name} has reconnected`)
})

socket.on('user-disconnected', user => {
    console.log(`${user.name} has left!`)
})

function startGame(gameName) {
    winningMessageElement.classList.remove('show')
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
    })
    board.classList.add(userShape)
}

function handleClick(e) {
    const cell = e.target
    const currentTurn = userShape
    
    socket.emit('place-mark', { game: gameName, cell: cell.id, currentTurn: currentTurn })
    placeMark(cell, currentTurn)
}

function swapTurns() {
    if(userShape !== currentTurn) {
        cellElements.forEach(cell => {
            cell.removeEventListener('click', handleClick)
            cell.classList.add('none')
        })
        turnMessage.innerText = ""
    } else {
        cellElements.forEach(cell => {
            cell.removeEventListener('click', handleClick)
            cell.addEventListener('click', handleClick, {once: true})
            cell.classList.remove('none')
        })
        turnMessage.innerText = "It's Your Turn!"
    }
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
}

function placeMark(cell, currentClass){
    cell.classList.add(currentClass)
}

// function swapTurns() {
//     circleTurn = !circleTurn
// }


function getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
        c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
        }
    }
    return "";
}