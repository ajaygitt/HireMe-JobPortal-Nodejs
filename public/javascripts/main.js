const chatForm = document.getElementById('chat-input')
console.log("chat form",chatForm)
console.log("here is the chat js")
const chatMessages = document.querySelector('.chat-messages');

const myuserid=document.getElementById('myidis').value



const {sender,receiver} = Qs.parse(location.search,{
    ignoreQueryPrefix: true
})
console.log("here")
console.log("sender and receiver is",sender,receiver);



const socket = io.connect()
var siofu=new SocketIOFileUpload(socket)
siofu.listenOnInput(document.getElementById("upload_input"))

socket.emit('joinChat',{sender,receiver})
socket.on('message', message => {
    console.log("client",socket.id);
    console.log("hai guys")
    console.log(message);  
    outputMessage(message)
    chatMessages.scrollTop=chatMessages.scrollHeight
})


socket.on('file',data=>{
    console.log(data,"file is this")
    console.log("data ext is",data.extention);

    if(data.extention=='.jpg'||data.extention=='.jpeg'||data.extention=='.png')
    {
        console.log("the data is and image and image is called");
        imageFile(data)
    }
    
else if (data.extention=='.mp4'||data.extention=='.mkv'||data.extention=='.webm')
{
console.log("this is video")

videoFile(data)
}



})



chatForm.addEventListener('submit', (e) => {
    e.preventDefault()
    const msg = e.target.elements.msg.value
    // const img = e.target.files.files[0]
    // console.log("files",img);
    socket.emit('chatMessage', msg)
    e.target.elements.msg.value = ''
    e.target.elements.msg.focus()
}) 


function outputMessage(message) {

   let msgis=message.text






  console.log("message is this s s",msgis)
    const par = document.getElementsByClassName('chat-messages')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    console.log("the destructured msg is",message.userName)
const userid=message.userName

let first= message.userName.length-24
let senderforCheck=message.userName.slice(0,24)


console.log("username",myuserid);
console.log("the sender for check is ",senderforCheck);

if(senderforCheck==myuserid)
{

    console.log("executing inside if @@@@@@@@@@@@@@@@@@@@@@@@@1")

    div.innerHTML = ` <div
       class="msg-img"
       style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"
      ></div>

      <div class="msg-bubble">
        <div class="msg-info">
          <div class="msg-info-name">Sajad</div>
          <div class="msg-info-time">${message.time}</div>
        </div>

        <div class="msg-text">
        ${msgis} 
        </div>
      </div>
    </div>`
}


else
{
    var text = 'Find me at http://www.example.com and also at http://stackoverflow.com';
    var html = urlify(text);
    console.log("thi si link",html)

console.log("in the else condition >>>>>>>>>>>>");

    div.innerHTML = ` <div class="msg right-msg  ">
    <div
     class="msg-img"
     style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"
    ></div>

    <div class="msg-bubble ">
      <div class="msg-info">
        <div class="msg-info-name">Hireme test</div>
        <div class="msg-info-time">  ${message.time}</div>
      </div>

      <div class="msg-text">
     ${msgis}
      </div>
    </div>
  </div>`

function urlify(text) {

    var text=message.text
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    return text.replace(urlRegex, function(url) {
      return '<a href="' + url + '">' + url + '</a>';
    })
    
  }

 

}



    var br = document.createElement("br");
    
    par[0].appendChild(br)
    

    document.querySelector('.chat-messages').appendChild(div)
}

function imageFile(data)
{
console.log("entered to image function")
    const par = document.getElementsByClassName('chat-messages')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    console.log("the destructured msg is",data.userName)

    div.innerHTML = `
    
    




    <div class="msg right-msg  ">
    <div
     class="msg-img"
     style="background-image: url(https://image.flaticon.com/icons/svg/145/145867.svg)"
    ></div>

    <div class="msg-bubble ">
      <div class="msg-info">
        <div class="msg-info-name">Hireme test</div>
        <div class="msg-info-time"> ${data.userName}</div>
      </div>

      <div class="msg-text">
      <img src="http://localhost:3000/image-chats/${data.file}" style="width:150px;height:150px" class="img-responsive m-auto" alt="">
      </div>
    </div>
  </div>
`

var br = document.createElement("br");
    
par[0].appendChild(br)


document.querySelector('.chat-messages').appendChild(div)
}

//video file rendering
function videoFile(data){


    console.log("entered to image function")
    const par = document.getElementsByClassName('chat-messages')
    const div = document.createElement('div')
    div.classList.add('conversation-list')
    console.log("the destructured msg is",data.userName)

    div.innerHTML = `<div class="ctext-wrap-content" style="padding-left:7px">
    <p class="conversation-name pt-1 pb-1" style="margin-bottom:0px;margin-left:0px">${data.userName} :</p>
    <p class="mb-0" style="padding-left:20px">
   
        

    <video width="320" height="240" controls>
    <source src="http://localhost:5000/image-chats/${data.file}"" type="video/mp4">
  
  Your browser does not support the video tag.
  </video>

    </p>
    
    <p class="chat-time mb-0"><i class=" ri-chat-check-line align-middle"></i>
        <span class="class="fa fa-check"">  ethii</span>
    </p>
    
</div>`

var br = document.createElement("br");
    
par[0].appendChild(br)


document.querySelector('.chat-messages').appendChild(div)

}