var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var db= require('./config/connection')
var dotenv=require('dotenv')
var dotenv=require('dotenv').config()
const isOnline=require('is-online');
var fileUpload=require('express-fileupload')

//flash
var flush=require('connect-flash')
//router initialization
var adminRouter = require('./routes/admin');
var recruiterRouter=require('./routes/recruiter')
var employeeRouter = require('./routes/employee');
var moment =require('moment')
//google auth

const passport=require('passport')
const googleAuth=require('passport-google-oauth20');
const { Passport } = require('passport');


var hbs=require('express-handlebars')
var session=require('express-session')
var app = express();

var publicDir = require('path').join(__dirname,'/public'); 
// for socketio chat
var messageController=require('./Controllers/messageController')
var http=require('http')
var socketio=require('socket.io')
var server=http.createServer(app);
const io=socketio(server)
const getUrls=require('get-urls')
const SocketIOFileUpload=require('socketio-file-upload');
const {userJoin, getCurrentUser } = require('./chat/users');
var msgFormat=require('./chat/message')
var fs=require('fs');
const { ObjectID } = require('bson');









io.on('connection', socket=>
{

  console.log("new User is connectedddd");
  
var uploader=new SocketIOFileUpload()
uploader.dir=path.join(__dirname, '/public/image-chats');
uploader.listen(socket)

socket.on('joinChat',({sender,receiver})=>{

  const user = userJoin(socket.id,sender,receiver)
  socket.join(receiver)
})

socket.on('chatMessage',msg=>{
  const text=msg;

  let url =getUrls(text);
console.log("the link is ",url);
if(msg!='')
{
  const user=getCurrentUser(socket.id)
  console.log("üser is",user);
  console.log("message",msg);
let id=user.id
console.log("the id is",id);
let newReceiver=user.receiver

console.log("ithan sender",user.sender);
console.log("ithan receiver",newReceiver);

let first= user.sender.length-24
let senderis=user.sender.slice(0,first)
let receiveris=newReceiver.slice(0,first)


io.to(user.sender).emit('message',msgFormat.formatMessage(user.sender,msg,senderis))
     io.to(newReceiver).emit('message',msgFormat.formatMessage(newReceiver,msg,senderis))



    




let obj={
  socket:id,
  sender: user.sender,
  sender_id:ObjectID(senderis) ,
  receiver_id:ObjectID(receiveris) ,
  receiver:newReceiver,
  message:msg
}


messageController.insertTextmessage(obj)

console.log("the result is ",obj);
}

})

// for file Upload 

uploader.on("saved",function(event){
  console.log("file ethiyittund",event.file);
  const user = getCurrentUser(socket.id)
  let date=new Date()
  date=moment(date).format("YYYY/MM/DD")
let time=moment(new Date()).format("h:mm:ss")
let reciever=user.receiver
console.log("this is receiver",time);

let uniqueid=moment(new Date()).format("ss")
console.log("uniqu id",uniqueid);
let sender=user.sender
let newimageId=sender+reciever

console.log("the total id is",newimageId);
console.log("the file name",event.file.name);
var file=path.join(__dirname,'/public/image-chats/'+event.file.name)
console.log("the file issss",file);
var ext =path.extname(file)
newimageId=newimageId+uniqueid+ext

var newfileis = path.join(__dirname, '/public/image-chats/'+newimageId)


console.log("new file name is",newimageId);
fs.rename(file,newfileis,(err)=>{
console.log("written the name");
  if(err)
  {
    console.log("err",err);
  }
})
event.file.name=newimageId

let id=user.id
let newReceiver=user.receiver
let first= user.sender.length-24
let senderis=user.sender.slice(0,first)
let receiveris=newReceiver.slice(0,first)

io.to(user.sender).emit('file', msgFormat.formatFileMessage(user.sender,newimageId,ext,senderis))
     io.to(newReceiver).emit('file', msgFormat.formatFileMessage(newReceiver,newimageId,ext,senderis))


     if(ext=='.jpg'||ext=='.jpeg'||ext=='.png')
     {


 

     let messageis={
      socket:id,
      sender_id:ObjectID(senderis) ,
      receiver_id:ObjectID(receiveris) ,
      image:newimageId,
      sender:user.sender,
      receiver:newReceiver,
      ext:ext,
      time:new Date()

     }
     messageController.insertImageMessage(messageis)
    }

    else if(ext=='.mp4'||ext=='.mkv'||ext=='.webm')
    {
      console.log("ividelum ethio");
      let messageis={
        socket:id,
        video:newimageId,
        sender_id:ObjectID(senderis) ,
      receiver_id:ObjectID(receiveris) ,
        sender:user.sender,
        receiver:newReceiver

      }
      messageController.insertVideo(messageis)
    }
   

})


})
//server
var port=3000;
server.listen(port,(err)=>{
  if(err)
  {
    console.log("server connection err",err);
  }
  else{
    console.log("connected to server at PORT",port);
  }
});
app.set('port',port);




app.use(express.static(publicDir));

app.use(express.json())
app.use(SocketIOFileUpload.router)
app.use(session({
  secret: 'keyboard cat',
 cookie:{maxAge:5000000}
}))

app.use(passport.initialize());
app.use(passport.session())
app.use(flush());
app.use(function (req, res, next) {
  res.set(
    "Cache-Control",
    "no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0"
  );
  next();
});






isOnline().then(online => {
  if(online){
      console.log("We have internet");
  }else{
      console.log("No internet");
  }
});

//db connect
db.connect((err) => {
  if (err) {
    console.log("Error in connection");
  } else {
    console.log("Database connected successdully");
  }
});



// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.engine('hbs',hbs({extname:'hbs',defaultLayout:'layout',layoutsDir:__dirname+'/views/layout',partialsDir:__dirname+'/views/partials'}))
app.use(fileUpload())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
// app.use(express.bodyParser());

app.use('/', employeeRouter);
app.use('/admin', adminRouter);
app.use('/', recruiterRouter);
app.use('/recruiter',recruiterRouter)




app.use(express.static('public'))
app.use(express.static('public/css'))
app.use(express.static('public/images'))
app.use(express.static('/public/images'))


// 



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
  
});



app.use(passport.initialize());
app.use(passport.session());



module.exports = app;