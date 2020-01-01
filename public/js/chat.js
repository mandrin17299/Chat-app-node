const socket =io();

$messageForm= document.querySelector('#message-form');
$messageFormInput = $messageForm.querySelector('input');
$messageFormButton  =$messageForm.querySelector('button');
$sendlocationButton = document.querySelector('#send-location');
$messages = document.querySelector('#messages');
// template messages
$messagetemplate = document.querySelector('#message-templates').innerHTML;
$locationtemplate = document.querySelector('#location-template').innerHTML;
$sidebartemplate = document.querySelector('#sidebar-template').innerHTML;
$sidebar = document.querySelector('#sidebar');
//user query details
const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})
//console.log(username);
const autoscroll=()=>{
    // new message element 
    const $newMessage = $messages.lastElementChild
    // ht of new message
    const newMessageStyles= getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyles.marginBottom);
    const newMessageHeight= $newMessage.offsetHeight+newMessageMargin;

    // visile ht
    const visibleHeight=$messages.offsetHeight
    // ht of msf container
    const containerHeight=$messages.scrollHeight

    // how far i scrolled
    const scrollOffset= $messages.scrollTop+visibleHeight

    if(containerHeight-newMessageHeight<=scrollOffset){
        $messages.scrollTop=$messages.scrollHeight
    }


}

socket.on('message',(message)=>{
    console.log(message);
    const html= Mustache.render($messagetemplate,{
        username:message.username,
        message: message.text,
     createdAt:moment(message.createdAt).format('h:mm a')});
    $messages.insertAdjacentHTML('beforeend',html);
    autoscroll();

})
socket.on('locationmessage',(location)=>{
  //  console.log(url);
    const html = Mustache.render($locationtemplate, {
        username:location.username,
        url: location.url,
    createdAt : moment(location.createdAt).format('h:mm a')});
     $messages.insertAdjacentHTML('beforeend',html);
     autoscroll();
})


socket.on('roomData',({room, users})=>{
    const html = Mustache.render($sidebartemplate,{
           room,
           users
    })
    $sidebar.innerHTML=html;
})
 
$messageForm.addEventListener('submit',(e)=>{
    e.preventDefault();
    $messageFormButton.setAttribute('disabled','disabled')
    const message = e.target.elements.message.value;
   
    socket.emit('sendmessage',message,(error)=>{
        $messageFormButton.removeAttribute('disabled');
        $messageFormInput.value='';
        $messageFormInput.focus();
        if(error){
            return console.log(error);
        }
            console.log('Message sent');
    

    });
})
 document.querySelector('#send-location').addEventListener('click',()=>{
     if(!navigator.geolocation){
         return alert('Your browser does not support location sharing')
     }
         $sendlocationButton.setAttribute('disabled','disabled');
       navigator.geolocation.getCurrentPosition((position)=>{
           const location= {latitude :position.coords.latitude,
                      longitude:position.coords.longitude
       }
       socket.emit('send-location',location,()=>{
           $sendlocationButton.removeAttribute('disabled');
           console.log('Message Sent')
       });
     } );
 })
 socket.emit('join',{username , room},(error)=>{
     if(error){
          alert(error);
          location.search('/');
     }
 });
// socket.on('countupdated',(count)=>{
//     console.log('Count has been updated',count);
// })
// document.querySelector('#increment').addEventListener('click',()=>{
//     console.log('clicked');
//     socket.emit('increment');
// })