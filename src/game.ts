import { io } from "./server";

const game = () => {
    const game = io.of("/game");
    game.on('connection', (socket) => {
        socket
    });

}

export default game;