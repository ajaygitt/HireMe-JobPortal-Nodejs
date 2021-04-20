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
     formatFileMessage:(userName,file,extention,senderis)=>
     {
         return {
             userName,
            file,
            extention,
            senderis,
            time:moment().format('h:mm a')
         }
     }
 }