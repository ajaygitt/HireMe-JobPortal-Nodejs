 const moment = require('moment')

 module.exports={
     formatMessage:(userName,text)=>
     {
         return{
             userName,
             text,
             time:moment().format('h:mm a')
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