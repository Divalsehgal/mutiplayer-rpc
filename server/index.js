const express = require('express');
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require('cors');

app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: 'https://localhost:5173',
        methods: ['GET', 'POST']
    }
});

let users = {}; // Array to store registered users
let rooms = {}; // Object to store room details

io.on("connection", (socket) => {
    socket.on("register", (userName) => {
        // Check if a user with the same name already exists
        const existingUser = Object.values(users).find(user => user.name === userName.toLowerCase());
        if (!existingUser) {
            const user = {
                id: socket.id,
                name: userName,
                state: "waiting" // Initial state
            };
            users[socket.id] = user;
            if (Object.values(users).length === 2) {
                // If there are exactly 2 users, set their state to 'ready'
                Object.values(users).forEach(user => {
                    user.state = "ready";
                });
            }

            io.emit("users-update", users); // Send the updated user array to all clients
        } else {
            // If user already exists, you can handle it accordingly, for example:
            socket.emit("user-already-exists", { message: "User already exists with this name." });
        }
    });

    socket.on("disconnect", () => {
        // Find the user who disconnected
        const userIds = Object.keys(users);
        const userIndex = userIds.findIndex(id => users[id].id === socket.id);
        if (userIndex !== -1) {
            const userId = userIds[userIndex];
            delete users[userId]; // Remove the user from the object

            // Check if there is exactly one user remaining
            if (Object.keys(users).length === 1) {
                const remainingUserId = Object.keys(users)[0];
                users[remainingUserId].state = "waiting"; // Set the state of the remaining user to "waiting"
            } else {
                // Check if there are users in the waiting state to promote to ready
                const waitingUsers = Object.values(users).filter(user => user.state === "waiting");
                if (waitingUsers.length > 0) {
                    waitingUsers[0].state = "ready";
                }
            }
            io.emit("users-update", users); // Send the updated user object to all clients
        }
    });


    socket.on("start-game", () => {
        const readyUsers = Object.values(users).filter(user => user.state === "ready");

        if (readyUsers.length === 2) {
            const initiatingUser = readyUsers.find(user => user.id === socket.id);
            const otherUser = readyUsers.find(user => user.id !== socket.id);
            if (initiatingUser && otherUser) {
                const roomName = "room-" + Math.random().toString(36).substr(2, 5); // Generate a random room name
                initiatingUser.state = "playing";
                initiatingUser.room = roomName;
                rooms[roomName] = { p1Choice: null, p2Choice: null }; // Initialize room object
                io.emit("users-update", users); // Update user states for all clients
                io.to(initiatingUser.id).emit("game-started", roomName); // Inform the initiating user about the game start

                // Inform the other user about the game and provide the room name
                io.to(otherUser.id).emit("join-game", roomName);
            }
        } else {
            // Handle if there are not enough users in the ready state
            socket.emit("not-enough-users", { message: "Not enough users in the ready state to start the game." });
        }
    });

    socket.on("join-room", (roomName) => {
        socket.join(roomName);
        const user = Object.values(users).find(user => user.id === socket.id);
        if (user) {
            user.state = "playing";
            user.room = roomName;
            io.emit("users-update", users); // Update user states for all clients
        }
    });

    socket.on("p1Choice", (data) => {
        if (getUserState(socket.id) === "playing") {
            let rpsValue = data.rpsValue;
            if (rooms[data?.roomUniqueId]) {
                rooms[data.roomUniqueId].p1Choice = rpsValue;
                if (rooms[data.roomUniqueId].p2Choice != null) {
                    declareWinner(data.roomUniqueId);
                }
            }
        }
    });

    socket.on("p2Choice", (data) => {
        if (getUserState(socket.id) === "playing") {
            let rpsValue = data.rpsValue;
            if (rooms[data?.roomUniqueId]) {
                rooms[data.roomUniqueId].p2Choice = rpsValue;
                if (rooms[data.roomUniqueId].p1Choice != null) {
                    declareWinner(data.roomUniqueId);
                }
            }
        }
    });

    function getUserState(userId) {
        const user = Object.values(users).find(user => user.id === userId);
        return user ? user.state : null;
    }

    function declareWinner(roomUniqueId) {
        let p1Choice = rooms[roomUniqueId].p1Choice;
        let p2Choice = rooms[roomUniqueId].p2Choice;
        let winner = null;
        if (p1Choice === p2Choice) {
            winner = "draw";
        } else if (p1Choice == "Paper") {
            if (p2Choice == "Scissor") {
                winner = "Player 1";
            } else {
                winner = "Player 1";
            }
        } else if (p1Choice == "Rock") {
            if (p2Choice == "Paper") {
                winner = "Player 2";
            } else {
                winner = "Player 1";
            }
        } else if (p1Choice == "Scissor") {
            if (p2Choice == "Rock") {
                winner = "Player 2";
            } else {
                winner = "Player 1";
            }
        }
        io.emit("result", {
            winner: winner
        });
        rooms[roomUniqueId].p1Choice = null;
        rooms[roomUniqueId].p2Choice = null;
    }

    socket.on("send-message", (message) => {
        // Broadcasting message to all users
        socket.broadcast.emit("receive-msg", message);
    });
});

server.listen(3030, () => {
    console.log("server is started");
});
