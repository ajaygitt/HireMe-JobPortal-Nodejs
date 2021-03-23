var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();
const passport=require('passport')
const auth =require('../routes/passport-setup')
const app = require('../app');
const userHelper = require('../helpers/userHelper');
require('./passport-setup')
const config=require("../config/twilio")
const client=require('twilio')(config.accountSID,config.authToken)

//middlevare for session checking
const verifygoogleLogin=(req,res,next)=>{
    if(req.user){
    req.session.email=req.user.email
    let sessionis=req.session.email
        console.log("inside home session present",sessionis);
    let userIs=req.session.email
    if(userIs)
    {
        next()
    }
}
    else{
        res.redirect('/')
    }
}



//middleware for checking session userside

const verifyLoggedIn=(req,res,next)=>{
let userfound=req.session.user
if(userfound)
{
    
    next()
}
else
{
    res.redirect('/')
}

}







//middleware for 404 checking google
function isLoggedIn(req,res,next){
if(req.user.email){
req.session.user=req.user.email

console.log("req.bodyyy",req.user.email);
}

    req.user ? next():res.sendStatus(401);
}

//to home

router.get('/',(req,res)=>{
   
   let userfound=req.session.user

   if(userfound)
   {
       if(userfound.type=="employee")
       {
     
    res.render('employee/index',{user:true,userfound})
       }
       else if(userfound.type=="recruiter")
       {
           res.render('recruiter/home',{recruiter:true,userfound})
       }
   }
   else{
       res.render('employee/index',{user:true})
   }
})


 router.get('/login',(req,res)=>{
    let userfound=req.session.user
    if(userfound)
    {
       res.redirect('/')
    }
    else{
    let no=1
   res.render("employee/login",{user:true,no})
    }
 })


 //login manual

router.post('/login',(req,res)=>{
  
 console.log("keri");
 userHelper.doLogin(req.body).then((response)=>{

 console.log("response",response);
   
 if(response.status==3)
 {
    
     res.send(response)
 }
 else if(response.status==2){
     
     console.log("pwd err");
     res.send(response)
 }
 else if(response.type=="employee"){

    req.session.user=response
    res.send(response)
 }
 else if( response.type=="recruiter")
 {
    req.session.user=response
     res.send(response)
 }
  
    
 
 })
})








//google get page
router.get('/auth/google',
passport.authenticate('google',{scope:['email','profile']})
)

// router.get('/home',verifygoogleLogin,isLoggedIn,(req,res)=>{
 
    
//     console.log("at home ");

//     res.send('success')
// })

//userhome defalult router
router.get('/home',isLoggedIn,(req,res)=>{

    let userfound=req.session.user
    console.log("heeree##",userfound);
res.render('employee/index',{user:true,userfound})

})






router.get('/google/callback',
passport.authenticate('google',{
  
    successRedirect:'/home',
    failureRedirect:'/failure'
})

)

router.get('/failure',(req,res)=>{
    res.send("failed")
})



router.get('/signup',(req,res)=>{
    let no=1
    res.render('employee/signup',{user:true,no})
})


//manual signup
router.post('/signup',async(req,res)=>{
    console.log(req.body);
await userHelper.doSignUp(req.body).then((response)=>{

    console.log("htmsl",response);
    if(response.status==false)
    {
        let sess=true
      res.render('employee/signup',{user:true,sess})
      sess=false
    }
    else{
        let signupSuccess=true;
let no=true
         res.render('employee/login',{user:true,signupSuccess,no})
        signupSuccess=false;
        no=false
    }
})

})








//linkedin

router.get('/auth/linkedin',
  passport.authenticate('linkedin', { state: 'SOME STATE'  }),
  function(req, res){

    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  });
router.get('/auth/linkedin/callback', passport.authenticate('linkedin', {
  successRedirect: '/home',
  failureRedirect: '/failure'
}));


//logout

router.get('/logout',(req,res)=>{

    req.session.destroy()
    res.redirect('/')
})


router.get('/otpLogin',(req,res)=>{

    console.log("employee");
    let no=1
    res.render('employee/otpLogin',{user:true,no})

})


router.post('/otpLogin',async(req,res)=>{

    console.log("reqboody",req.body);
   await userHelper.verifyPhoneNumber(req.body).then((response)=>{

if(response.status==true)
{
    req.session.phone=req.body.phone;

  client.verify.services(config.serviceID).verifications.create({

    to:`+91${req.body.phone}`,
    channel:`sms`
  }).then((data)=>{
      if(data)
      {
      res.send(response)
      }
      else
      {
          res.send(response)
      }
  })

}
   
else{
    res.send(response)
}
    })

})


router.get('/otpVerify',(req,res)=>{
let no=1
let userfound=req.session.user
if(userfound)
{
   res.redirect('/')
}else{
    res.render('employee/otpVerify',{user:true,no})
}
})

router.post('/otpVerify',(req,res)=>{
    let userfound=req.session.user
    if(userfound)
    {
       res.redirect('/')
    }
    else{



    let response={}
let otp=req.body.otp
let phoneis=req.session.phone
console.log("the phone number is",phoneis);
client.verify.services(config.serviceID).verificationChecks.create({

   to:`+91${phoneis}`,
   code:otp
}).then((data)=>{
    console.log("data",data);
    if(data.valid){

 userHelper.getByphoneNumber(phoneis).then((response)=>{
    
    response.status=true
    req.session.user=response
    res.send(response)
    req.session.phone=null;
 })
            
    }
    else
    {
        console.log("err otp");
        response.status=false
        res.send(response)
        req.session.phone=null

       
    }
})
    }

})







module.exports = router;