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

let users = []; // Array to store registered users

io.on("connection", (socket) => {
    socket.on("register", (userName) => {
        // Check if a user with the same name already exists
        const existingUser = users.find(user => user.name === userName);
        if (!existingUser) {
            const user = {
                id: socket.id,
                name: userName,
                state: "waiting" // Initial state
            };
            users.push(user);

            if (users.length === 2) {
                // If there are exactly 2 users, set their state to 'ready'
                users.forEach(user => {
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
        const userIndex = users.findIndex(user => user.id === socket.id);
        if (userIndex !== -1) {
            users.splice(userIndex, 1); // Remove the user from the array

            // Check if there is exactly one user remaining
            if (users.length === 1) {
                users[0].state = "waiting"; // Set the state of the remaining user to "waiting"
            } else {
                // Check if there are users in the waiting state to promote to ready
                const waitingUsers = users.filter(user => user.state === "waiting");
                if (waitingUsers.length > 0) {
                    waitingUsers[0].state = "ready";
                }
            }
            io.emit("users-update", users); // Send the updated user array to all clients
        }
    });


    socket.on("send-message", (message) => {
        // Broadcasting message to all users
        socket.broadcast.emit("receive-msg", message);
    });
});

server.listen(3030, () => {
    console.log("server is started");
});
