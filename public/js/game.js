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
const chat = document.querySelector('.chat')

const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')

if( !getCookie('name') ||  !getCookie('name') === "") {
    document.querySelector('.name-popup').classList.add('show')
}else {
    document.querySelector('.name-popup').classList.remove('show')
}

nameInputSubmit.addEventListener("click", () => {
    name = nameInput.value
    document.cookie = `name=${nameInput.value}`
    document.querySelector('.name-popup').classList.remove('show')
})

//User joins game
if (chat != null) {
    socket.emit('new-user', gameName, name)
}

if(messageForm != null){
    messageForm.addEventListener('submit', e => {
        e.preventDefault()
        const message = messageInput.value
        appendMessage('self', `You: ${message}`)
        socket.emit('send-chat-message', { gameName: gameName, message: message })
        messageInput.value = ''
    })
}

socket.on('game-created', game => {
    //Add a new game listing on the homepage
    const gameElement = document.createElement('div')
    gameElement.classList.add('game-card')

    const gameName = document.createElement('h4')
    gameName.innerText = game

    const gameLink = document.createElement('a')
    gameLink.href = `/${game}`
    gameLink.innerText = 'join'

    gameElement.append(gameName)
    gameElement.append(gameLink)

    gameContainer.append(gameElement)
})

socket.on('user-connected', user => {
    userShape = user.role
    turnMessage.innerText = "Waiting for opponent..."
    appendMessage('game', 'You connected')
})

socket.on('other-user-connected', user => {
    turnMessage.innerText = ""
    appendMessage('game', `${user.name} connected`)
})

socket.on('chat-message', data => {
    appendMessage('other', `${data.fromUser}: ${data.message}`)
})

socket.on('start-game', data => {
    currentTurn = data.turn
    startGame()
    swapTurns()

    appendMessage('game', 'Game Has Started !')
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
    restartButton.removeEventListener('click', requestRematch)
    restartButton.addEventListener('click', requestRematch)
    winningMessageTextElement.innerText = `${shape}'s Win!`
    winningMessageElement.classList.add('show')
})

socket.on('draw', () => {
    restartButton.removeEventListener('click', requestRematch)
    restartButton.addEventListener('click', requestRematch)
    winningMessageTextElement.innerText = `Its a Draw!`
    winningMessageElement.classList.add('show')
})

socket.on('request-restart', () => {
    appendMessage('game', 'Other player wants to play again')
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
    appendMessage('game', `${data.user.name} has reconnected`)
})

socket.on('user-disconnected', user => {
    appendMessage('game', `${user.name} has left!`)
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
        turnMessage.innerText = "It's Your Opponent's Turn"
    } else {
        cellElements.forEach(cell => {
            cell.classList.remove('none')
            cell.removeEventListener('click', handleClick)
            cell.addEventListener('click', handleClick, {once: true})
        })
        turnMessage.innerText = "It's Your Turn!"
    }
}

function requestRematch() {
    socket.emit('request-restart', gameName)
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

    let css
    if (userShape === 'circle') {
        css = `                
            .cell.x::before,
            .cell.x::after {
                background-color: rgb(156, 31, 31);
            }
        
            .cell.circle::before{
                background-color: #187bcd;
                float: right;
            }
        `,
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');
 
    }else if (userShape === 'x') {
        css = `                
            .cell.x::before,
            .cell.x::after {
                background-color: #187bcd;
            }
            
            .cell.circle::before{
                background-color: rgb(156, 31, 31);
                float: left;
            }
        `,
        head = document.head || document.getElementsByTagName('head')[0],
        style = document.createElement('style');

    }
    
    head.appendChild(style);
    style.type = 'text/css';
    style.appendChild(document.createTextNode(css));
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

function appendMessage(origin, message){
    const messageElement = document.createElement('div')
    const messageTimeStamp = document.createElement('div')
    messageElement.innerText = message
    messageTimeStamp.innerText = getCurrentTime()
    messageContainer.append(messageElement)

    if (origin === "game") {
        messageElement.classList.add('gameMessage')
    } else if (origin === "other") {
        messageElement.classList.add('otherMessage')
    } else if (origin === "self") {
        messageElement.classList.add('selfMessage')
    }

    if (messageContainer.scrollTop + messageContainer.clientHeight === messageContainer.scrollHeight) {
        messageContainer.scrollTop = messageContainer.scrollHeight;
    }
}

function getCurrentTime() {
    let currentTime = new Date()
    let hours = convert12to24(currentTime.getHours())
    let minutes = convert2digits(currentTime.getMinutes())
    let seconds = convert2digits(currentTime.getSeconds())

    return `${hours.hour}:${minutes}:${seconds}${hours.ampm}`
}

function convert12to24(hours) {
    if (hours == 0) return { hour: '12', ampm: 'am' }
    if (hours >= 1 && hours <= 12 ) return { hour: hours.toString(), ampm: 'am' }
    return { hour:(hours - 12).toString(), ampm: 'pm' }
}

function convert2digits(minutes) {
    return (minutes < 10) ? `${0}${minutes}` : minutes.toString()
}