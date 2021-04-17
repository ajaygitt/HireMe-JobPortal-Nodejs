var db = require('../config/connection')
var collection = require('../config/dbcollections')
var bcrypt = require('bcrypt')
const { USER_COLLECTION, JOB_COLLECTION, appliedJobs } = require('../config/dbcollections')
const { response } = require('express')
const moment =require('moment')
const { reject } = require('lodash')
const { ObjectID } = require('bson')
const adminHelpers = require('./adminHelpers')


module.exports={

    sendApprovedNotification:(user,job,recruiter)=>{

        return new Promise(async(resolve,reject)=>{

            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne({
 
sender:ObjectID(recruiter),
receiver:ObjectID(user),
jobId:ObjectID(job),
notification:"Congratulations You have been selected for the following Job the recruiter will contact you soon",
date:moment(new Date()).format('DD/MM/YYYY HH:mm:ss'),
positiveNotification:true


            })
        })
    },

    sendRejectedNotification:(user,job,recruiter)=>{
        return new Promise(async(resolve,reject)=>{

            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne({
 
sender:ObjectID(recruiter),
receiver:ObjectID(user),
jobId:ObjectID(job),
notification:"SORRY!! You have been rejected.. Keep trying",
date:moment(new Date()).format('DD/MM/YYYY HH:mm:ss'),
positiveNotification:false
            })
        })

    },


    getNotification:(id)=>{

        return new Promise((resolve,reject)=>{

            db.get().collection(collection.NOTIFICATION_COLLECTION).find({$or:[ {receiver:ObjectID(id)} ,{receiver:"everyone"}]}).toArray().then((notifications)=>{

                resolve(notifications)
            })
        })
    },

    removeNotification:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.NOTIFICATION_COLLECTION).remove({_id:ObjectID(id)}).then((response)=>{

                resolve(response)
            })
        })
    },

    sendNotificationByAdmin:(data)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.NOTIFICATION_COLLECTION).insertOne({sender:"admin",receiver:'everyone',notification:data}).then((result)=>{

                resolve(result);

            })
        })
    }

}