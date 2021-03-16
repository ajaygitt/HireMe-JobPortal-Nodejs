var db = require('../config/connection')
var collection = require('../config/dbcollections')
var bcrypt = require('bcrypt')
const { USER_COLLECTION } = require('../config/dbcollections')


module.exports={

doSignUp:(userData)=>{
    return new Promise((resolve,reject)=>{
        db.get().collection(USER_COLLECTION).insertOne(userData).then((result)=>{
            resolve(result)
        })
    })
}






}