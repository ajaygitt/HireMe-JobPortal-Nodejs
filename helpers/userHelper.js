var db = require("../config/connection");
var collection = require("../config/dbcollections");
var bcrypt = require("bcrypt");
const { USER_COLLECTION } = require("../config/dbcollections");
const { response } = require("express");

module.exports = {
  doSignUp: (userData) => {
    let email = userData.email;

    return new Promise(async (resolve, reject) => {
      let emailexist = 0;
      emailexist = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: email });

      if (emailexist != null) {
        response.status=false
        resolve(response);
        console.log("emailexisttt", response);
      } 
      else if (emailexist == null) {
        console.log("userData", userData);
        let password = await bcrypt.hash(userData.password, 10);
        let user = db
          .get()
          .collection(USER_COLLECTION)
          .insertOne({
            full_name: userData.full_name,
            email: userData.email,
            phonenumber: userData.phonenumber,
            education: userData.education,
            experience: userData.experience,
            gender: userData.gender,
            qualification: userData.qualification,
            city: userData.city,
            password: password,
            type: "employee",
          })
          .then((result) => {
            resolve(result.ops[0]);
            console.log("opd dataaa", result.ops[0]);
          });
      }
    });
  },


googleSignup:(userData)=>{
return new Promise(async(resolve,reject)=>{

    console.log("emial",userData);
    let emailexist = 0;
    emailexist = await db
      .get()
      .collection(USER_COLLECTION)
      .findOne({ email:userData.email });

      if(emailexist){
let response=emailexist
          resolve(response)
      }
      else{
        await  db.get().collection(USER_COLLECTION).insertOne({fullname:userData.fullname,email:userData.email,picture:userData.picture}).then((response)=>{
            resolve(response)
        })
      }

})
},





  doLogin: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {

        let password1=await bcrypt.hash(userData.password, 10);
      
      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        

     let status= await bcrypt.compare(userData.password,user.password)

if(status==true)
{
     resolve(user);
}
else{
response.status=2;
resolve(response)
}

      }


      else {
        response.status = 3;
        resolve(response);
      }
    });
  },


  verifyPhoneNumber:(phoneNumber)=>{
    let respone={}
return new Promise(async(resolve,reject)=>{


  let user=await db.get().collection(USER_COLLECTION).findOne({phonenumber:phoneNumber.phone})
  if(user){
  
    response.status=true
    resolve(response)
  }
  else{
    console.log("nn",user);
    response.status=false
    resolve(response)
  }

  })

  },

  getByphoneNumber:(phoneNumber)=>{

    return new Promise(async(resolve,reject)=>{
    let user=await  db.get().collection(USER_COLLECTION).findOne({phonenumber:phoneNumber})
    if(user)
    {
      resolve(user)
    }
    else{
      reject()
    }
    })
  }




};


