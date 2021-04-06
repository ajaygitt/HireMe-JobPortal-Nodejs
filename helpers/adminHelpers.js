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
console.log("here is here");
let user=await db.get().collection(USER_COLLECTION).findOne({_id:ObjectId(id)})

console.log("this is user",user);
if(user.type=="recruiter")
{

console.log("yes reccc");

let status= await   db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{
    $set:{
        blocked:true
    }
}).then(async()=>{

await db.get().collection(JOB_COLLECTION).remove({recruiter:id})

}).then(()=>{

    response.blocked=true
    resolve(response)
})

}



else
{


let response={}
    let status= await   db.get().collection(collection.USER_COLLECTION).updateOne({_id:ObjectId(id)},{
            $set:{
                blocked:true
            }
        }).then(()=>{
             response.blocked=true
            resolve(response)
        })
    }
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

},

findRecruiter:(id)=>{
    return new Promise((resolve,reject)=>{

        db.get().collection(collection.USER_COLLECTION).findOne({_id:ObjectId(id)}).then((result)=>{
console.log("the result is",result);
            resolve(result)
        })
    })
},

deleteJob:(id)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(JOB_COLLECTION).removeOne({_id:ObjectId(id)}).then((response)=>{
            resolve(response)
        })
    })
}




}