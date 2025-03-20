import { io } from "./server";

interface people {
    id: string;
    rps: 'rock' | 'paper' | 'scissors' | null;
}
interface game {
    count: number;
    people: people[];
    name: string;
    timer: any;
}

const game = () => {
    const games: game[] = [];
    const gameIo = io.of("/game");
    gameIo.on("connection", (socket) => {
        socket.on("start", (name) => {
            const idx: number = games.findIndex(game => game.name == name);
            if(idx != -1) {
                games[idx].people.push({id: socket.id, rps: null});
            } else {
                const game: game = {
                    count: 10,
                    people: [{
                        id: socket.id,
                        rps: null
                    }],
                    name,
                    timer: null
                };
                game.timer = setInterval(()=>{
                    const idx: number = games.findIndex(game => game.name == name)
                    games[idx].count -= 1;
                    gameIo.to(name).emit("count", games[idx].count);
                    if(games[idx].count == 0) {
                        console.log("a");
                        gameIo.to(games[idx].people[0].id).emit('result', {you: games[idx].people[0].rps, opponent: games[idx].people[1].rps});
                        gameIo.to(games[idx].people[1].id).emit('result', {you: games[idx].people[1].rps, opponent: games[idx].people[0].rps});
                        clearInterval(games[idx].timer);
                    }
                }, 1100);
                games.push(game);
            }
            socket.join(name);
            socket.on('rps', (rps) => {
                const idx: number = games.findIndex(game => game);
                console.log(games[idx]);
                const peopleIdx = games[idx].people.findIndex(people => people.id == socket.id);
                games[idx].people[peopleIdx].rps = rps;
                console.log(games[idx].people[peopleIdx]);
            });
        });


        socket.on('disconnect', () => {
            
        });
        
    });

    // const findBySocketId = (socketId) => {
    // }
};

export default game;
