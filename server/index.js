const express = require('express');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

app.use(cors());
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:3000",
        methods: ["GET", "POST"],
    }
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
        users = users.filter(user => user.socketId !== socket.id);
        socket.in(69).emit("user_update", users);
        // io.in(69).emit("receive_message", { message: `${disconnectingUser.name} left the room`, type: 'disconnect'});
    });

    socket.on("join_room", (data) => {
        socket.join(data.room);
        handleNewUser(data, socket.id);
        console.log(users);
        io.in(data.room).emit("user_update", users);
        io.in(data.room).emit("receive_message", { message: `${data.name} joined the room!`, type: 'connect'});
    });

    socket.on("send_message", (data) => {
        io.to(data.room).emit("receive_message", data);
        console.log(data);
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
                users = calculateScore(gameState, users);
                gameState = {
                    ...gameState,
                    selections: [],
                    playerTurnIndex: newPlayerTurnIndex,
                    guesserTurnIndex: newGuesserTurnIndex,
                    guessCycle: 1
                };
                if (newPlayerTurnIndex === 0) {
                    gameState = {
                        ...gameState,
                        round: 2
                    }
                }
                io.in(gameState.room).emit('game_state_update', gameState);
                io.in(gameState.room).emit('user_update', users);
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

server.listen(3001, () => {
    console.log('server is running');
});