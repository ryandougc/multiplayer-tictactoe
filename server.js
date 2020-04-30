const express       = require('express')
const app           = express()
const server        = require('http').Server(app)
const io            = require('socket.io')(server)

const { 
    setUserRole,
    initGame,
    swapTurns,
    checkWin,
    getUserGames
}                   = require('./serverLogic')
const games         = {}

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
        }, tiles: {}
    }
    res.redirect(req.body.game)
    
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
    socket.on('new-user', (gameName, userName) => {
        //Add a new user into a game
        socket.join(gameName)

        //Set the users role
        let userRole = setUserRole(games[gameName], socket.id)
        games[gameName].roles[userRole].taken = true
        games[gameName].users[socket.id] = { 
            name: userName,
            role: userRole,
            restart: false
        }

        socket.emit('user-connected', games[gameName].users[socket.id])
        socket.broadcast.to(gameName).emit('other-user-connected', games[gameName].users[socket.id])

        //Start game once 2 people are in and the variables are set
        if (
            Object.keys(games[gameName].users).length >= 2
            && games[gameName].roles['circle'].taken === true
            && games[gameName].roles['x'].taken === true
        ) {
            games[gameName] = initGame(games[gameName])

            io.sockets.to(gameName).emit('start-game', {
                turn: games[gameName].turn, 
                gameName: gameName
            })
        }
    })
    socket.on('place-mark', data => {
        if (games[data.gameName].active) {
            //Update game tile
            games[data.gameName].tiles[data.cell].checked = true
            games[data.gameName].tiles[data.cell].shape = data.currentTurn

            //Check for win or draw
            let win = checkWin(games[data.gameName])

            if (win) {
                games[data.gameName].active = false
                io.sockets.to(data.gameName).emit('win', data.currentTurn)
            } else if (false) {
                games[data.gameName].active = false
                io.sockets.to(data.gameName).emit('lose')
            }

            //Swap Turns
            let newTurn = swapTurns(games[data.gameName].turn)
            games[data.gameName].turn = newTurn
            games[data.gameName].roles[games[data.gameName].turn].turn = false
            games[data.gameName].roles[newTurn].turn = true

            io.sockets.to(data.gameName).emit('place-mark', {
                game: games[data.gameName]
                ,pastTurn: data.currentTurn
                ,cell: data.cell
            })
        }
    })
    socket.on('request-restart', gameName => {
        //Check if the user has already requested a rematch
        if (games[gameName].users[socket.id].restart) return 

        games[gameName].users[socket.id].restart = true
        games[gameName].restart++

        if (games[gameName].restart !== 2) return socket.broadcast.to(gameName).emit('request-restart')
        
        games[gameName] = initGame(games[gameName])

        let newTurn = swapTurns(games[gameName].turn)
        games[gameName].turn = newTurn

        io.sockets.to(gameName).emit('start-game', {
            turn: games[gameName].turn,
            gameName: gameName
        })
    })
    socket.on('disconnect', () => {
        getUserGames(games, socket.id).forEach(gameName => {
            let userShape = games[gameName].users[socket.id].role
            
            games[gameName].active = false
            games[gameName].roles[userShape].taken = false
            
            socket.broadcast.to(gameName).emit('user-disconnected', games[gameName].users[socket.id])
            delete games[gameName].users[socket.id]
        })
    })
})