// server/src/core/games/registry.js

const rpsGameHandler = require("./rpsGameHandler");
const snakeGameHandler = require("./snakeGameHandler");

module.exports.gameRegistry = {
    RPS: rpsGameHandler,
    //SNAKES: snakeGameHandler,
};
