const express       = require('express')
const app           = express()
const server        = require('http').Server(app)
const io            = require('socket.io')(server)

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
        }, roles: {
            circle: {
                taken: false,
                turn: true
            }, x: {
                taken: false,
                turn: false
            }
        }, tiles: {

        }
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

        //Start game once 2 people are in and the variables are set
        if (
            Object.keys(games[game].users).length
            && games[game].roles['circle'].taken === true
            && games[game].roles['x'].taken === true
        ) {
            io.sockets.to(game).emit('start-game', game)
        }
    })
    socket.on('init-game', game => {
        startGame(game)
        socket.emit('init-game')
    })
    socket.on('disconnect', () => {
        getUserGames(socket).forEach(game => {
            //Make the chape available in the lobby when a user leaves
            let userRole = games[game].users[socket.id].role
            games[game].roles[userRole].taken = false

            //Send the disconnect message and then delete the user
            io.sockets.to(game).emit('user-disconnected', games[game].users[socket.id])
            delete games[game].users[socket.id]
        })
    })
})

function getUserGames(socket) {
    return Object.entries(games).reduce((names, [name, game]) => {
        if (game.users[socket.id] != null) names.push(name)
        return names
    }, [])
}

function startGame(game) {
    let tileCount = 1
    while (tileCount <= 8) {
        games[game].tiles[tileCount] = {
            id: `cell${tileCount}`
            ,checked: false
            ,shape: null
        }            

        tileCount++
    }
}