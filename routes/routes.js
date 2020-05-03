const express           = require('express')
const router            = express.Router({mergeParams: true})

router.get('/', (req, res) => {
    res.render('index', { games: games })
})

router.post('/game', (req, res) => {
    if(games[req.body.games] != null || games[req.body.games]) return res.redirect('/')
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

router.get('/:game', (req, res) => {
    setTimeout(() => {
        console.log(games[req.params.game])
        if(games[req.params.game] == null){
            return res.redirect('/')
        }
        res.render('game', { gameName: req.params.game })
    }, 500)
})

module.exports = router