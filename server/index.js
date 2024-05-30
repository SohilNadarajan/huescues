const express = require('express');
const path = require('path');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());
const server = http.createServer(app);

const port = process.env.PORT || 3001;

const io = new Server(server, {
    cors: {
        // origin: "http://localhost:3000",
        origin: "https://hues-and-cues-be1fbd9a0756.herokuapp.com/",
        methods: ["GET", "POST"],
    }
});

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'build')));

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

const animals = ["bear", "cat", "chicken", "deer", "dog", "giraffe", "koala", "lion", "panda", "polar-bear", "puffer-fish", "rabbit", "rhino", "sloth", "snake", "weasel"];
const handleNewUser = (data, socketId) => {
    const userIcons = users.map(user => user.icon);
    const availableAnimals = animals.filter(animal => !userIcons.includes(animal));
    const randomIndex = Math.floor(Math.random() * availableAnimals.length);
    const randomAnimal = availableAnimals[randomIndex];

    const newUser = {
        socketId: socketId,
        name: data.name,
        placing: users.length + 1,
        points: 0,
        icon: randomAnimal,
        room: data.room
    }
    users.push(newUser);
};

var allClients = [], users = [];
let gameState = {
    playerTurnIndex: 0,
    guesserTurnIndex: 1,
    round: 1,
};

const startGame = (room) => {
    gameState = {
        playerTurnIndex: 0,
        guesserTurnIndex: 0,
        round: 1,
        hint: '',
        guessCycle: 1,
        room,
        selections: []
    };
    io.in(room).emit('game_started', gameState);
}

const endGame = (room) => {
    const topUser = users.reduce((max, user) => user.points > max.points ? user : max, users[0]);
    io.to(room).emit('receive_message', { name: topUser.name, message: `${topUser.name} won with ${topUser.points} points!`, type: 'winner' });
    users = users.map(user => ({ ...user, points: 0 }));
    socket.in(room).emit("user_update", users);
    io.in(room).emit('end_game');
}

function calculateScore(gameState, users) {
    const { randomCoord, selections } = gameState;
    const [randomX, randomY] = randomCoord;
    
    let playerPoints = 0;
    const updatedUsers = users.map(user => {
        const userSelections = selections.filter(sel => sel.name === user.name);
        
        let totalPoints = 0;
        userSelections.forEach(selection => {
            const [col, row] = selection.coords.split('-').map(Number);
            const distance = Math.max(Math.abs(randomX - row), Math.abs(randomY - col)); // Chebyshev distance
            if (distance === 0) {
                totalPoints += 30;
                playerPoints += 10;
            } else if (distance === 1) {
                totalPoints += 20;
                playerPoints += 10;
            } else if (distance === 2) {
                totalPoints += 10;
                playerPoints += 10;
            }
        });
        
        return { ...user, points: user.points + totalPoints };
    });

    if (gameState.playerTurnIndex >= 0 && gameState.playerTurnIndex < updatedUsers.length) {
        updatedUsers[gameState.playerTurnIndex].points += playerPoints;
    }

    // Sort users by points in descending order to update their placing
    const sortedUsers = [...updatedUsers].sort((a, b) => b.points - a.points);

    // Update placing based on sorted order
    sortedUsers.forEach((user, index) => {
        user.placing = index + 1;
    });
    
    return updatedUsers;
}

io.on("connection", (socket) => {
    console.log(`user connected: ${socket.id}`);
    allClients.push(socket);

    socket.on('disconnect', function() {
        console.log('Got disconnect!');

        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        const userToRemove = users.find(user => user.socketId === socket.id);
        if (userToRemove) {
            io.in(userToRemove.room).emit("receive_message", { name: userToRemove.name, message: `${userToRemove.name} left the room`, type: 'disconnect'});
        }
        users = users.filter(user => user.socketId !== socket.id);
        socket.in(69).emit("user_update", users);
        // let disconnectingUser = users.find(user => user.socketId == socket.id);
        // io.in(69).emit("receive_message", { name: disconnectingUser.name, message: `${disconnectingUser.name} left the room`, type: 'disconnect'});
    });

    socket.on('leave_page', () => {
        console.log('left');
        var i = allClients.indexOf(socket);
        allClients.splice(i, 1);
        const userToRemove = users.find(user => user.socketId === socket.id);
        if (userToRemove) {
            io.in(userToRemove.room).emit("receive_message", { name: userToRemove.name, message: `${userToRemove.name} left the room`, type: 'disconnect'});
        }
        users = users.filter(user => user.socketId !== socket.id);
        socket.in(69).emit("user_update", users);
    });

    socket.on("join_room", (data) => {
        socket.join(data.room);
        handleNewUser(data, socket.id);
        // console.log(users);
        io.in(data.room).emit("user_update", users);
        io.in(data.room).emit("receive_message", { message: `${data.name} joined the room!`, type: 'connect'});
    });

    socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", data);
        // console.log(data);
    });

    socket.on("start_game", (data) => {
        startGame(data.room);
    });

    socket.on("start_player_turn", (data) => {
        io.to(data.room).emit("receive_message", { name: data.name, message: `${data.name} is thinking...`, type: 'notif' });
    });

    socket.on("player_second_hint", (data) => {
        io.to(data.room).emit("receive_message", { name: data.name, message: `${data.name} is refining their hint...`, type: 'notif' });
    });

    socket.on("send_hint", (moveData) => {
        let newGuesserTurnIndex = (gameState.guesserTurnIndex + 1) % users.length;
        if (gameState.guessCycle === 2) {
            newGuesserTurnIndex = ((gameState.guesserTurnIndex - 1) + users.length) % users.length;
        }
        gameState = {
            ...gameState,
            ...moveData,
            hint: moveData.hint,
            guesserTurnIndex: newGuesserTurnIndex
        };
        io.in(gameState.room).emit('game_state_update', gameState);
    });

    socket.on("send_guess", (guessData) => {
        let newGuesserTurnIndex = 0;
        if (gameState.guessCycle === 1) {
            newGuesserTurnIndex = (gameState.guesserTurnIndex + 1) % users.length;
            if (newGuesserTurnIndex === gameState.playerTurnIndex) {
                gameState = {
                    ...gameState,
                    selections: [...gameState.selections, guessData],
                    guesserTurnIndex: newGuesserTurnIndex,
                    guessCycle: 2
                };
                io.in(gameState.room).emit('game_state_update', gameState);
                return;
            }
        }
        if (gameState.guessCycle === 2) {
            newGuesserTurnIndex = ((gameState.guesserTurnIndex - 1) + users.length) % users.length;
            if (newGuesserTurnIndex === gameState.playerTurnIndex) {
                newGuesserTurnIndex = (newGuesserTurnIndex + 1) % users.length;
                const newPlayerTurnIndex = newGuesserTurnIndex;
                // calculate points and update users
                gameState = {
                    ...gameState,
                    selections: [...gameState.selections, guessData]
                };
                io.in(gameState.room).emit('game_state_update', gameState);
                users = calculateScore(gameState, users);
                io.in(gameState.room).emit('user_update', users);
                io.in(gameState.room).emit('display_turn_results');
                gameState = {
                    ...gameState,
                    selections: [],
                    playerTurnIndex: newPlayerTurnIndex,
                    guesserTurnIndex: newGuesserTurnIndex,
                    guessCycle: 1
                };
                if (newPlayerTurnIndex === 0) {
                    let nextRound = gameState.round + 1;
                    if (nextRound == 4) {
                        endGame(gameState.room);
                        return;
                    }
                    gameState = {
                        ...gameState,
                        round: nextRound
                    }
                }
                setTimeout(() => io.in(gameState.room).emit('game_state_update', gameState), 5000);
                return;
            }
        }
        gameState = {
            ...gameState,
            selections: [...(gameState.selections || []), guessData],
            guesserTurnIndex: newGuesserTurnIndex
        };
        io.in(gameState.room).emit('game_state_update', gameState);
    });
});

server.listen(port, () => {
    console.log('server is running');
});