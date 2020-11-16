
/*
    method: genrateMessage
    desc:   genrate and return message object for client
    params: username, message 
*/
const genrateMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt: new Date().getTime()
    }
}


/*
    method: genrateLocationMessage
    desc:   genrate and return location message object for client
    params: username, url
*/
const genrateLocationMessage = (username, url) =>{
    return {
        username,
        url,
        createdAt: new Date().getTime()        
    }
}

module.exports = {
    genrateMessage,
    genrateLocationMessage
}