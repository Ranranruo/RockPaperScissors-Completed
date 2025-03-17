import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const game = io.of('/game');

game.on('connection', (socket) => {
  console.log("conn");
});

interface room {
  name: string,
  people: any[]
}

const rooms: room[] = [];

// URL 인코딩된 본문을 파싱하는 미들웨어 추가
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
});

app.get('/create', (req, res) => {
  res.sendFile(__dirname + '/create.html');
});

app.get('/join', (req, res) => {
  res.sendFile(__dirname + '/join.html');
});
app.get('/room', (req, res) => {
  res.sendFile(__dirname + '/room.html');
})

io.on('connection', (socket) => {
    socket.on('create', (name) => {
      if (rooms.some(room => room.name === name)) return socket.emit('already', name);
        rooms.push({
            name,
            people: [],
        });
        socket.emit('join', name);
        io.emit('rooms', rooms);
    });
    socket.on('rooms', () => {
      socket.emit('rooms', rooms);
    });
    socket.on('join', (name) => {
      if(!rooms.some(room => room.name == name)) return socket.emit('noroom', name);
      if(rooms.some(room => room.people.length >= 2 && room.name == name)) return socket.emit('already', name);
      rooms.map(room => {
        if(room.name == name) room.people.push(socket.id);
        return room;
      });
      io.emit('rooms', rooms);
      const currnetRoom = rooms.find(room => room.name == name);
      io.to(name).emit('people', currnetRoom!.people.length);
    });
    socket.on('disconnect', () => {
      const idx = rooms.findIndex(room => room.people[0] == socket.id || room.people[1] == socket.id);
      rooms[idx]?.people?.forEach((people, currentIdx) => {
        if(people == socket.id) {
          rooms[idx]?.people?.splice(currentIdx, 1);
          io.emit('rooms', rooms);
          socket.leave(rooms[idx].name);
        }
      })
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
