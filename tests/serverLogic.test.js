const { 
    setUserRole,
    initGame,
    swapTurns,
    checkState,
    getUserGames
}                   = require('../serverLogic')

const games = {
    'test': {
        users: {   
            'test1': {
                name: 'test1'
            },
            'test2': {
                name: 'test2'
            },
            'test3': {
                name: 'test3'
            }
        },
        active: false, 
        turn: 'circle',
        restart: 0,
        roles: {
            circle: {
                taken: false,
                turn: true
            }, 
            x: {
                taken: false,
                turn: false
            }
        },
        tiles: {}
    }
}

test('should output user role: circle', () => {
    const role = setUserRole(games['test'])

    games['test'].roles[role].taken = true

    //Expected output to be a circle
    expect(games['test'].roles[role].taken).toBeTruthy()
})

test('should output user role: x', () => {
    const role = setUserRole(games['test'])

    games['test'].roles[role].taken = true

    //Expected output to be a circle
    expect(role).toBe('x')
})

test('should output user role: spec', () => {
    const role = setUserRole(games['test'])

    //Expected output to be a circle
    expect(role).toBe('spec')
})

test('should output active game', () => {
    const game = initGame(games['test'])

    games['test'] = game
    for (var tileId in games['test'].tiles) {
        games['test'].tiles[tileId].checked = true
    }

    expect(game.active).toBeTruthy()
})

test('should output undefined', () => {
    const state = checkState(games['test'])

    expect(state).toBe(true)
})

test('should output x', () => {
    const newTurn = swapTurns(games['test'].turn)

    games['test'].turn = newTurn

    expect(newTurn).toBe('x')
})

test('should output circle', () => {
    const newTurn = swapTurns(games['test'].turn)

    expect(newTurn).toBe('circle')
})

test('should output the name of a user', () => {
    const gameName = getUserGames(games, 'test1')

    expect(gameName[0]).toBe('test')
})