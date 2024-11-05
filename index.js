const { LOADIPHLPAPI } = require('dns')
const e = require('express')
const express = require('express')
const app = express()
const http = require('http')
const server = http.createServer(app)
const path = require('path')
const PORT = process.env.PORT || 3000
const { Server } = require("socket.io");
const io = new Server(server, {
    cors: {
        origin: '*', 
        methods: ['GET', 'POST']
    },
    cookie: {
        name: 'session',
        httpOnly: true,
        maxAge: 8640000
    },
    connectTimeout: 50000
})

let games = {}

io.on('connection', (socket) => {
    socket.on('join', (gameId) => {
        if(!games[gameId]){
            games[gameId] = []
        }else{
            socket.emit("joined-racers", games[gameId])
        }
        games[gameId].map(racerId => {
            io.sockets.sockets.get(racerId).emit("joined-racers", [socket.id])
        })

        games[gameId].push(socket.id)
    })

    socket.on("current-user-answered", ({ answered, gameId, carId, userName }) => {
        games[gameId].map(racerId => {
            if(racerId == socket.id) return
            io.sockets.sockets.get(racerId).emit("racer-answered", {
                answered,
                racerId: socket.id,
                carId,
                userName
            })
        })
    })
    
    socket.on('disconnect', () => {
        io.emit("racer-left", socket.id)
        for(game in games) {
            let id = games[game].indexOf(socket.id)
            if(id > -1) {
                games[game].splice(games[game].indexOf(socket.id), 1)
                if(games[game].length == 0) delete games[game]
            }
        }
    })
})

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
})

app.get('/new', (req, res) => {
    const id = Math.random().toString(36).substr(2, 9)
    res.redirect(`/game/${id}?user_name=${req.query.user_name}`)
})

app.get('/game/:id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'game.html'))
})


server.listen(PORT, () => console.log(`Listening on port ${PORT}`))