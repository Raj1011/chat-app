
const socket = io();

// Elements
var $messageForm = document.querySelector('#msg-form');
var $messageFormInput = $messageForm.querySelector('input');
var $messageFormButton = $messageForm.querySelector('button');
var $sendLocationButton = document.querySelector('#share-location');
var $messages = document.querySelector('#messages');

// Templates
var $messageTemplate = document.querySelector('#message-template').innerHTML;
var $locationTemplate = document.querySelector('#location-template').innerHTML;
var $sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;


// Query string parsing
var {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});



/*
    method: autoscroll
    desc:   On new message, scroll down to bottom of message container.
    params: 
*/
autoscroll = () =>{

    //new message element
    const $newMessage = $messages.lastElementChild;

    //height of new message
    const newMessageStyles = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    //visible height 
    const visibleHeight = $messages.offsetHeight;

    //Height of message container
    const containerHeight  = $messages.scrollHeight;

    //How far i have scrolled?
    const scrollOffset = $messages.scrollTop + visibleHeight;


    if(containerHeight - newMessageHeight <= scrollOffset ){
        $messages.scrollTop = $messages.scrollHeight;
    }

}



/*
    Event: messsage
    desc:   Listening general messages from server.
    params: 
*/
socket.on('message', (msg)=>{

    const html = Mustache.render($messageTemplate, {
        username: msg.username,
        message: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
});


/*
    Event: locationMessage
    desc:  listening location messages from server
    params: 
*/
socket.on('locationMessage', (message)=>{

    const html = Mustache.render($locationTemplate, {
        username: message.username,
        url: message.url,
        createdAt: moment(message.createdAt).format('h:mm a')
    });

    $messages.insertAdjacentHTML('beforeend', html);
    autoscroll();
})


/*
    Event: join
    desc:  Emit user data to server on user join
    params: 
*/
socket.emit('join', {username, room}, (error)=>{
    
    if(error){
        alert(error);
        location.href('/')
    }
});


/*
    Event: roomData
    desc:   listening roomData to sidebar data on user join/leave
    params: 
*/
socket.on('roomData',({room, users})=>{
    
    const html = Mustache.render($sidebarTemplate, {
        room: room,
        users: users
    });

    document.querySelector("#sidebar").innerHTML = html;

});



/*
    EventListener function: submit Message
    desc:   When user submit message
    params: 
*/
$messageForm.addEventListener('submit', (e)=>{
    e.preventDefault();
  
    //disable send button
    $messageFormButton.setAttribute('disabled', 'disabled');
    let msg= $messageFormInput.value;

    socket.emit('clientMessage',msg, (error)=>{
        //enable send button
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value = '';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }

        console.log("Message delivered!");
    });

    // socket.on('broadcastMsg', (message)=>{
    //     console.log(message);
    // })
});



/*
    EventListener function: share Location
    desc:   When user share location
    params: 
*/
$sendLocationButton.addEventListener('click',()=>{

    if(!navigator.geolocation){
        return alert('Your browser does not support Geolocation!');
    }
     
    //disable share location button
     $sendLocationButton.setAttribute('disabled', 'disabled');
     
    navigator.geolocation.getCurrentPosition((position)=>{
        socket.emit('shareLocation', locationObj = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, ()=>{
            //enable share location button after acknowledgement
            $sendLocationButton.removeAttribute('disabled');
            console.log('Location shared!');
        })
    })
});



