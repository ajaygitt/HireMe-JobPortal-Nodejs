var db = require('../config/connection')
var collection = require('../config/dbcollections')
var bcrypt = require('bcrypt')
const { USER_COLLECTION, JOB_COLLECTION, appliedJobs, MESSAGE_COLLECTION } = require('../config/dbcollections')
const { response } = require('express')
const moment =require('moment')
const { reject } = require('lodash')
const { ObjectID } = require('bson')


module.exports={

    insertTextmessage:(obj)=>{
       

 db.get().collection(collection.MESSAGE_COLLECTION).insertOne({socket:obj.socket,sender:obj.sender,sender_id:obj.sender_id,receiver_id:obj.receiver_id,receiver:obj.reciever,message:obj.message,time:new Date()})
     
    },

insertImageMessage:(obj)=>{

db.get().collection(collection.MESSAGE_COLLECTION).insertOne(obj)

},

sendChat:(sender,receiver)=>{
    return new Promise(async(resolve,reject)=>{

    let messages=await    db.get().collection(collection.MESSAGE_COLLECTION).find({$and:[{sender:sender,receiver:receiver}]}).toArray()

resolve(messages)
    })
},

receivedChat:(sender,reciever)=>{
    return new Promise(async(resolve,reject)=>{
        let messageis=await db.get().collection(collection.MESSAGE_COLLECTION).find({$and:[{sender:sender,receiver:reciever}]}).toArray()
        resolve(messageis)
    })
},

getInbox:(id)=>{
    return new Promise(async(resolve,reject)=>{

let inbox=await db.get().collection(MESSAGE_COLLECTION).aggregate([
    
    {$match:


    {sender_id:ObjectID(id)}
    
},
{
$project:{
    sender_id:1,
    receiver_id:1,
    message:1,
    time:1
}
},
{
    $lookup:{
        from:collection.USER_COLLECTION,
        foreignField:'_id',
        localField:'receiver_id',
        as:'result'
    }
},


{
$unwind:'$result'
},

{
    $project:{
        userid:'$result._id',
        email:'$result.email',
        full_name:'$result.full_name',
        message:1,
        time:1,
        recruiter_name:1


    }
}
    
    
]).toArray()

resolve(inbox)
console.log("dal",inbox);

    })
           
}



}