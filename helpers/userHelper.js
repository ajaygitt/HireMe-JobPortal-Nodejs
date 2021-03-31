var db = require("../config/connection");
var collection = require("../config/dbcollections");
var bcrypt = require("bcrypt");
const { USER_COLLECTION, JOB_COLLECTION } = require("../config/dbcollections");
const { response } = require("express");
const Razorpay=require('razorpay');
const { ObjectId } = require("bson");
const { resource } = require("../app");
var instance=new Razorpay({

  key_id:'rzp_test_3URBQ8j8qtsLhB',
  key_secret: 'U8nhJZH5oxQoudiSGQVWYSw5'
})

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
  },



  generateRazorPay:(Userid)=>{
return new Promise((resolve,reject)=>{

  var options={
    amount:199*100,
    currency:"INR",
    receipt:""+Userid
  };
  instance.orders.create(options,function(err,order){

    if(err){
      console.log("err",err);
    }
    else{
      console.log("order iiss",order);
      resolve(order)
    }
  })
})

  },

  verifyPayment: (details,userid) => {
    console.log("hopee",details);
    return new Promise(async(resolve, reject) => {
let premium=await db.get().collection(USER_COLLECTION).updateOne({_id:ObjectId(userid)},{$set:{
  premium:true
}})

        const crypto = require('crypto');
        let hmac = crypto.createHmac('sha256', 'Mf0VLj5ZCqBtTObi3Zy79LO3');
        hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
        hmac = hmac.digest('hex')
        if (hmac == details['payment[razorpay_signature]'])
         {


            resolve()
        }
        else {


            reject()
        }
    })

},

isPremium:(userid)=>{
return new Promise(async(resolve,reject)=>{

  let user= await db.get().collection(USER_COLLECTION).findOne({_id:ObjectId(userid)})
  if(user)
  {
    resolve(user)
  }
  else{
    reject
  }
})

},

viewAllJobs:()=>{

  return new Promise(async(resolve,reject)=>{

    let jobs=await db.get().collection(JOB_COLLECTION).find().toArray()
if(jobs)
{
  resolve(jobs)
}
else
{
  reject()
}

  })
}



};


