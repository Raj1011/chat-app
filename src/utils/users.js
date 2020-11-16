const users = [];

// addUser, removeUser, getUser, getusersInRoom


/*
    method: addUser
    desc:   Add user into room
    params: id, username, room
*/
addUser = ({id, username, room}) =>{

    var username = username.trim().toLowerCase();
    var room   = room.trim().toLowerCase();
    
    //validate for valid username and room
    if(!username || !room){
        return {
            error: 'Username and room are required!'
        }
    } 

    const existingUser = users.find((user)=>{
        return user.username === username && user.room === room;
    })

    //validate existing user
    if(existingUser){
        return {
            error: 'User is in use!'
        }
    }

    let user = {id, username, room}
    users.push(user)
    return {user};
}



/*
    method: removeUser
    desc:   remove user from room
    params: id
*/
removeUser = (id) =>{

    const index = users.findIndex((user)=> user.id === id);
    
    if(index != -1){
        return users.splice(index,1)[0];
    }
}



/*
    method: getUser
    desc:   get user data by Id
    params: id
*/
getUser = (id) =>{

    return users.find((user)=> user.id === id);
    
}



/*
    method: getUsersInRoom
    desc:   get users in a room
    params: room
*/
getUsersInRoom = (room) =>{
    var room = room.trim().toLowerCase();
    return users.filter((user)=> user.room === room);
}




module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}