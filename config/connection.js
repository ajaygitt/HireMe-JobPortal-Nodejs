const mongoClient = require('mongodb').MongoClient
var dotenv=require('dotenv').config()
const state = {
    db:null 
}

module.exports.connect = function(done){
    // const url =process.env.MONGO_DB_URL
    const url = 'mongodb+srv://ajay:gamechanger1-@cluster0.s6tin.mongodb.net/myFirstDatabase?retryWrites=true&w=majority'
    const dbname = 'jobPortal'
   
    mongoClient.connect(url,(err,data)=>{
        
        if(err) return done(err)
        state.db=data.db(dbname) 
        done()
    })
}
module.exports.get=function(){
    return state.db
}