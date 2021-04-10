var db = require('../config/connection')
var collection = require('../config/dbcollections')
var bcrypt = require('bcrypt')
const { USER_COLLECTION, JOB_COLLECTION, appliedJobs } = require('../config/dbcollections')
const { response } = require('express')
const moment =require('moment')
const { reject } = require('lodash')
const { ObjectID } = require('bson')


module.exports={

    insertTextmessage:(obj)=>{
       

 db.get().collection(collection.MESSAGE_COLLECTION).insertOne(obj)
     
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
}



}