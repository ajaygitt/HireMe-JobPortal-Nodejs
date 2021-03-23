var db = require('../config/connection')
var collection = require('../config/dbcollections')
var bcrypt = require('bcrypt')
const { USER_COLLECTION } = require('../config/dbcollections')
const { response } = require('express')


module.exports={



signUp:(recruiterData)=>{




return new Promise (async(resolve,reject)=>{

 let response={}
    let emailexist=await db.get().collection(collection.USER_COLLECTION).findOne({email:recruiterData.email})

if(emailexist){
console.log("emailalready exissttttttt");
response.status=false
resolve(response)

}

else{

   let password = await bcrypt.hash(recruiterData.password, 10);
   console.log("pass hashed",password);

db.get().collection(collection.USER_COLLECTION).insertOne({company_name:recruiterData.company_name,
    recruiter_name:recruiterData.recruiter_name,
    email:recruiterData.email,
    phonenumber:recruiterData.phonenumber,
    address:recruiterData.address,
    skills:recruiterData.skills,
    experience:recruiterData.experience,
    city:recruiterData.city,
    password:password,
    type:"recruiter",


}).then((response)=>{
    response.status=true;
    response.ops[0].status=true
    console.log("ivide cgange",response.ops[0]);
    resolve(response.ops[0]);
 


    
})
}

})





}









}








