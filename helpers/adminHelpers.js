var db = require("../config/connection");
var collection = require("../config/dbcollections");
var bcrypt = require("bcrypt");
const { USER_COLLECTION, JOB_COLLECTION } = require("../config/dbcollections");
const { response } = require("express");
const { ObjectId } = require("bson");
const { resource } = require("../app");


module.exports = {

getEmployees:(keyword)=>{

    return new Promise(async(resolve,reject)=>{

       await db.get().collection(USER_COLLECTION).find({type:keyword}).toArray().then((response)=>{

            resolve(response)
        })
    })
},


blockUser:(id)=>{

    return new Promise(async(resolve,reject)=>{
let response={}
    let status= await   db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{
            $set:{
                blocked:true
            }
        }).then(()=>{
             response.blocked=true
            resolve(response)
        })

        })
},

unblockUser:(id)=>{

    return new Promise(async(resolve,reject)=>{
        let response={}
            let status= await   db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{
                    $set:{
                        blocked:false
                    }
                }).then(()=>{
                     response.blocked=false
                    resolve(response)
                })
        
                })

}




}