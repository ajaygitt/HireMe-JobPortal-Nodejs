 const moment = require('moment')

 module.exports={
     formatMessage:(userName,text,senderis)=>
     {
         return{
             userName,
             text,
             time:moment().format('h:mm a'),
             senderis
         }
     },
     formatFileMessage:(userName,file,extention)=>
     {
         return {
             userName,
            file,
            extention,
            time:moment().format('h:mm a')
         }
     }
 }