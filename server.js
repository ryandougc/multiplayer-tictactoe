const express       = require('express')
const app           = express()
const server        = require('http').Server(app)
const io            = require('socket.io')(server)

const games         = {}
const WINNING_COMBINATIONS = [
    ['0', '1', '2'],
    ['3', '4', '5'],
    ['6', '7', '8'],
    ['0', '3', '6'],
    ['1', '4', '7'],
    ['2', '5', '8'],
    ['0', '4', '8'],
    ['2', '4', '6']
]
let userDisconnect  = ""


app.set('views', './views')
app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use(express.urlencoded({ extended: true}))

app.get('/', (req, res) => {
    res.render('index', { games: games })
})

app.post('/game', (req, res) => {
    if(games[req.body.games] != null){
        return res.redirect('/')
    }
    games[req.body.game] = {
        users: {   
        }, active: false
        , turn: 'circle'
        ,restart: 0
        ,roles: {
            circle: {
                taken: false,
                turn: true
            }, x: {
                taken: false,
                turn: false
            }
        }, tiles: []
    }
    res.redirect(req.body.game)
    
    //Send message that new game was created
    io.emit('game-created', req.body.game)
})

app.get('/:game', (req, res) => {
    if(games[req.params.game] == null){
        return res.redirect('/')
    }
    res.render('game', { gameName: req.params.game })
})

server.listen(3000)

io.on('connection', socket => {
    socket.on('new-user', (game, name) => {
        if( game == userDisconnect.game && name == userDisconnect.user.name ){
            delete games[game].users[userDisconnect.user.id]
            games[game].users[socket.id] = {
                name: name
                ,role: userDisconnect.user.role
            }

            clearTimeout(userDisconnect.timeout)
            userDisconnect = ""
            socket.emit('user-reconnected', { tiles: games[game].tiles, gameName: game })
            io.sockets.to(game).emit('other-user-reconnected', { tiles: games[game].tiles, user: games[game].users[socket.id] })
        }else {
            socket.join(game)
            games[game].users[socket.id] = { name: name }

            //Set circle or X for user
            if (games[game].roles['circle'].taken && !games[game].roles['x'].taken) {
                games[game].roles['x'].taken = true
                games[game].users[socket.id].role = 'x'
            } else if (!games[game].roles['circle'].taken && games[game].roles['x'].taken) {
                games[game].roles['circle'].taken = true
                games[game].users[socket.id].role = 'circle'
            } else if (!games[game].roles['circle'].taken && !games[game].roles['x'].taken) {
                games[game].roles['circle'].taken = true
                games[game].users[socket.id].role = 'circle'
            } else {
                games[game].users[socket.id].role = 'spec'
            }

            socket.emit('user-connected', games[game].users[socket.id])
            socket.broadcast.to(game).emit('other-user-connected', games[game].users[socket.id])

            //Start game once 2 people are in and the variables are set
            if (
                Object.keys(games[game].users).length >= 2
                && games[game].roles['circle'].taken === true
                && games[game].roles['x'].taken === true
            ) {
                initGame(game)
                io.sockets.to(game).emit('start-game', { turn: games[game].turn, gameName: game })
            }
        }
    })
    socket.on('place-mark', data => {
        //Update game tile
        games[data.game].tiles[data.cell].checked = true
        games[data.game].tiles[data.cell].shape = data.currentTurn

        //Swap Turns
        let newTurn
        if (data.currentTurn === "circle") {
            newTurn = "x"
        }else if (data.currentTurn === "x") {
            newTurn = "circle"
        }

        games[data.game].turn = newTurn
        games[data.game].roles[data.currentTurn].turn = false
        games[data.game].roles[newTurn].turn = true

        //Check for win or draw
        let win = WINNING_COMBINATIONS.some(combination => {
            return combination.every(index => {
                return games[data.game].tiles[index].shape == data.currentTurn
            })
        })
        let draw = games[data.game].tiles.every(tile => {
            return tile.shape == 'x' || tile.shape == 'circle'
        })

        if (win) {
            games[data.game].active = false
            io.sockets.to(data.game).emit('win', data.currentTurn)
        } else if (draw) {
            games[data.game].active = false
            io.sockets.to(data.game).emit('lose')
        } else {
            socket.emit('not-turn')
            socket.broadcast.to(data.game).emit('turn')
            io.sockets.to(data.game).emit('place-mark', {
                newTurn: newTurn
                ,currentTurn: data.currentTurn
                ,cell: data.cell
            })
        }
    })
    socket.on('request-restart', gameName => {
        ++games[gameName].restart
        if (games[gameName].restart === 2) {
            initGame(gameName)
            io.sockets.to(gameName).emit('start-game', { turn: games[gameName].turn, gameName: gameName })
        }else {
            socket.broadcast.to(gameName).emit('request-restart')
        }
    })
    socket.on('disconnect', () => {
        getUserGames(socket).forEach(game => {
            userDisconnect = {
                timeout: setTimeout(disconnectUser, 15000)
                ,game: game
                ,user: {
                    id: socket.id
                    ,name: games[game].users[socket.id].name
                    ,role: games[game].users[socket.id].role
                }
            }
            
            function disconnectUser() {
                //Make the shape available in the lobby when a user leaves
                let userRole = games[game].users[socket.id].role
                games[game].roles[userRole].taken = false
                games[game].active = false

                //Send the disconnect message and then delete the user
                io.sockets.to(game).emit('user-disconnected', games[game].users[socket.id])
                delete games[game].users[socket.id]
            }
        })
    })
})

function getUserGames(socket) {
    return Object.entries(games).reduce((names, [name, game]) => {
        if (game.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

function initGame(gameName) {
    games[gameName].active = true
    games[gameName].tiles = []
    games[gameName].turn = 'circle'
    games[gameName].restart = 0

    let tileCount = 0
    while (tileCount < 9) {
        games[gameName].tiles[`cell${tileCount}`] = {
            id: `cell${tileCount}`
            ,checked: false
            ,shape: null
        }   
        tileCount++         
    }
}

function checkWin() {
    return WINNING_COMBINATIONS.some(combination => {
        return combination.every(index => {
            return cellElements[index].classList.contains()
        })
    })
}