import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import db from './config/db.js'

dotenv.config();    
db();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {origin: "*"}
});

app.use(express.json());

//socket logic
io.on('connection', (socket)=>{
    console.log('user connected', socket.id);

    socket.on('send_message', (data)=>{
        io.emit('receive_message', data);
    })
    socket.on('disconnect', ()=>{
        console.log('user disconnected');
    });
});

server.listen(5000, ()=>{
    console.log('server running on port 5000')
})
