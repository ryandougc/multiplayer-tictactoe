const socket = io('http://localhost:3000')
const X_CLASS = 'x'
const CIRCLE_CLASS = 'circle'
const WINNING_COMBINATIONS = [
    ['cell0', 'cell1', 'cell2'],
    ['cell3', 'cell4', 'cell5'],
    ['cell6', 'cell7', 'cell8'],
    ['cell0', 'cell3', 'cell6'],
    ['cell1', 'cell4', 'cell7'],
    ['cell2', 'cell5', 'cell8'],
    ['cell0', 'cell4', 'cell8'],
    ['cell2', 'cell4', 'cell6']
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
    //Add a new game listing on the homepage
    const gameElement = document.createElement('div')
    gameElement.innerText = game
    const gameLink = document.createElement('a')
    gameLink.href = `/${game}`
    gameLink.innerText = 'join'
    gameContainer.append(gameElement)
    gameContainer.append(gameLink)
})

socket.on('user-connected', user => {
    userShape = user.role
    console.log(user)
})

socket.on('other-user-connected', user => {
    console.log(`${user.name} has joined!`)
})

socket.on('start-game', data => {
    currentTurn = data.turn
    startGame()
    swapTurns()

    console.log('Game Started')
})

socket.on('place-mark', data => {
    currentTurn = data.game.turn
    let cell = document.getElementById(data.cell)

    //Get the tiles that have already been clicked
    let checkedTiles = []
    for (key in data.game.tiles) {
        if (data.game.tiles[key].checked) {
            checkedTiles.push(data.game.tiles[key])
        }
    }
    swapTurns()
    placeMark(checkedTiles, cell, data.pastTurn)
})

socket.on('win', shape => {
    restartButton.addEventListener('click', () => {
        socket.emit('request-restart', gameName)
    })
    winningMessageTextElement.innerText = `${shape}'s Win!`
    winningMessageElement.classList.add('show')
})

socket.on('request-restart', () => {
    console.log('Other player wants to play again')
})

socket.on('user-reconnected', data => {
    startGame()
    swapTurns()
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

function startGame() {
    winningMessageElement.classList.remove('show')
    cellElements.forEach(cell => {
        cell.classList.remove(X_CLASS)
        cell.classList.remove(CIRCLE_CLASS)
    })
    board.classList.add(userShape)
}

function handleClick(e) {
    const cell = e.target

    socket.emit('place-mark', { gameName: gameName, cell: cell.id, currentTurn: currentTurn })
    
    placeMark([], cell, currentTurn)
}

function swapTurns() {
    if(userShape != currentTurn) {
        cellElements.forEach(cell => {
            cell.removeEventListener('click', handleClick)
            cell.classList.add('none')
        })
        turnMessage.innerText = ""
    } else {
        cellElements.forEach(cell => {
            cell.classList.remove('none')
            cell.removeEventListener('click', handleClick)
            cell.addEventListener('click', handleClick, {once: true})
        })
        turnMessage.innerText = "It's Your Turn!"
    }
}

function isDraw() {
    return [...cellElements].every(cell => {
        return cell.classList.contains(X_CLASS) || cell.classList.contains(CIRCLE_CLASS)
    })
}

function placeMark(checkedTiles, cell, currentClass){
    if (checkedTiles.length !== 0) {
        checkedTiles.forEach(tile => {
            document.getElementById(tile.id).removeEventListener('click', handleClick)
        })
    }
    cell.classList.add(currentClass)
}

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