const express = require("express");
const path = require('path');
const http = require('http');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { genrateMessage, genrateLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom }  = require('./utils/users');

const app = express();
const httpServer = http.createServer(app);

const io = socketio(httpServer);  // creating web socket server by providing node server.
const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));
// app.use("**cd", (req,res)=>{
//     res.send("Chat Apllication!")
// })




/*
   Listening to connection initiation
*/
let count = 0;
io.on('connection',(socket)=>{

    socket.on('join', ({username, room}, callback)=>{

        const { error, user }  = addUser({id: socket.id, username, room});

        if(error){
            return callback(error)
        }

        socket.join(user.room);
        //socket.broadcast.to(user.room).emit
        // socket.emit , io.emit, socket.broadcast.emit
        // io.to.emit, socket.broadcast.to.emit = > this is to broadcast emit/broadcast to particular room

        socket.emit('message', genrateMessage('Admin','Welcome!')); // Emitting to sender only
        socket.broadcast.to(user.room).emit('message', genrateMessage('Admin',`${user.username} has joined!`)) // Emitting to other clients except sender
        
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback();
    })



/*
   Listening clientMessage, when user send some message
   Get message from one client and broadcast to all clients in that room including sender as well.
*/
    socket.on('clientMessage', (msg, callback)=>{

        // checking offencive or abusive words
        const filter = new Filter();
        if(filter.isProfane(msg)){
            return callback('Profinity is not allowed!');
        }

        //find current user and room
        const user = getUser(socket.id);
        io.to(user.room).emit('message', genrateMessage(user.username,msg)); // emitting to all including sender.
       
        callback();
    })




/*
   Listening shareLocation, when user share location
   Get location from one client and broadcast to all clients in room including client itself.
*/
    socket.on('shareLocation', (locationObj, callback)=>{

        //find current user and room
        const user = getUser(socket.id);


        let locationMsg = `https://google.com/maps/?q=${locationObj.latitude},${locationObj.longitude}`;
        io.to(user.room).emit('locationMessage', genrateLocationMessage(user.username, locationMsg));

        callback();
    })




    
/*
   disconnect
   Emit when user diconnected
*/
    socket.on('disconnect', ()=>{
        const user = removeUser(socket.id);

        if(user){
            io.to(user.room).emit('message', genrateMessage('Admin', `${user.username} has left!`));

            //updating sidebar data
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            
        }
       
    })


});

httpServer.listen(port, ()=>{
    console.log(`Server is running on port ${port}!`);
})