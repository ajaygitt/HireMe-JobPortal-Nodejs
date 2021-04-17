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

        return new Promise(async(resolve,reject)=>{

       
console.log("hihihihi",obj);

        let collectionExist=await db.get().collection(MESSAGE_COLLECTION).findOne({sender_id:ObjectID(obj.sender_id)})

        if(collectionExist)
        {
            db.get().collection(MESSAGE_COLLECTION).updateOne({
                sender_id:obj.sender_id
            },
            {
                $push:{
                    message:obj.message
                }
            })
        }
        else
        {
            
            db.get().collection(collection.MESSAGE_COLLECTION).insertOne(obj)
        }
    })
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
    receiver_id:1
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
        fullname:'$result.full_name'

    }
}
    
    
]).toArray()

resolve(inbox)
console.log("dal",inbox);

    })
           
}



}