const express = require('express');
const http = require('http');
const path= require('path');
const socketio = require('socket.io');
const app = express();
const port = process.env.PORT||3000;
const Server= http.createServer(app);
const io = socketio(Server);
const Filter = require('bad-words');
const {generateMessage,generateLocation}=require('./utils/messages');
const {addUser , removeUser ,getUser , getUserInRoom}=require('./utils/users');


const publicPathDirectory=path.join(__dirname,'../public');
app.use(express.static(publicPathDirectory));

io.on('connection',(socket)=>{
    console.log('New connection formed');
   

      socket.on('join',  ({username,room},callback)=>{
          
          const {error ,user} = addUser({id:socket.id, username :username,room:room});
            if(error){
                    return    callback(error);
            }
            socket.join(user.room);
            socket.emit('message',generateMessage('Admin','Welcome!'));
            socket.broadcast.to(user.room).emit('message', generateMessage('Admin',`${user.username} has joined`));
              //   console.log(user.room);
            io.to(user.room).emit('roomData',{
                room : user.room,
                users:getUserInRoom(user.room)
            })
            callback();
      })


     socket.on('sendmessage',(msg,callback)=>{
         const user = getUser(socket.id);
         const filter = new Filter();
         if(filter.isProfane(msg)){
             return callback('Goli beta no masti');
         }
         io.to(user.room).emit('message',generateMessage(user.username,msg));
         callback();
     })
    // socket.emit('countupdated',count);
    // socket.on('increment', ()=>{
    //     count++;
    //     io.emit('countupdated',count);
    // })
    socket.on('send-location',(location,callback)=>{
        const user = getUser(socket.id);
      io.to(user.room).emit('locationmessage',generateLocation(user.username,`https://google.com/maps?q=${location.latitude},${location.longitude}`));
      callback();
    })
    socket.on('disconnect',()=>{
           const user = removeUser(socket.id);
        //   console.log(user);
           if(user){
        io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`));
        io.to(user.room).emit('roomData',{
            room : user.room,
            users:getUserInRoom(user.room)
        })
           }
          
    })
    
})

Server.listen(port,()=>{
console.log(`Server is running at port ${port}`);
})