var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();
const passport=require('passport')
const auth =require('../routes/passport-setup')
const app = require('../app');
const userHelper = require('../helpers/userHelper');
const recruiterHelper=require('../helpers/recruiterHelper')
require('./passport-setup')


const verifyLoggedIn=(req,res,next)=>{
    let userfound=req.session.user
    if(userfound.type=="recruiter")
    {
        console.log("recruiterrrs",userfound);
        
        next()
    }
    else
    {
        res.redirect('/')
    }
    
    }



router.get('/signupRecruiter',(req,res)=>{

    res.render('recruiter/signup',{recruiter:true})
})


router.post('/recruiterSignup',(req,res)=>{

    
recruiterHelper.signUp(req.body).then((response)=>{


    console.log("respone",response);

res.send(response)



})
  
})



router.get('/loginu',(req,res)=>{

    console.log("@@@@@@@@@@",req.body);
   res.render('recruiter/home')
})



// routing

router.get('/checkout',verifyLoggedIn,(req,res)=>{

let userfound=req.session.user
res.render('recruiter/checkout',{recruiter:true,userfound})

})

router.post('/checkout',verifyLoggedIn,(req,res)=>{
let response={}
let value=req.body.type
let userid=req.body.userid
console.log("userid is",userid);
if(value=="razorpay")
{
    userHelper.generateRazorPay(userid).then((response)=>{

        response.type="razorpay"
        console.log("the resposne is here catched",response);
        res.send(response)
    })
  
}
else
{
    response.type="paypal"
    res.send(response)
}
})


router.post('/verify-payment',verifyLoggedIn,(req,res)=>{

    console.log("reqqq body of veify ",req.body);

let userid=req.session.user._id
console.log("!!!!!!!!!!!!!!!!!!!!!!!!!",userid);
    userHelper.verifyPayment(req.body,userid).then(()=>{
        
        
    }).catch(()=>{
      let  response={}
        response.success=true
        res.send(response)
        console.log("#############################");
    })


})


router.get('/add-job',verifyLoggedIn,(req,res)=>{
let recruiterfound=req.session.user
console.log("mm",recruiterfound);
if(recruiterfound.premium)
{
   res.render('recruiter/add-job',{recruiterfound,recruiter:true})
}
else
{
console.log("not a premium member");
}
})

router.post('/add-job',verifyLoggedIn,(req,res)=>{

    let alert=require('alert')
    console.log("daata",req.body);
    let image=req.files.image

console.log(image);

let recruiterid=req.session.user._id

recruiterHelper.postJob(req.body,recruiterid).then((response)=>{
    console.log("response formaskheloper",response);
let image=req.files.image
let id=response
image.mv('./public/icons/'+id+'.jpg',(err,done)=>{
    if(!err)
    {
        res.redirect('/')
    }
    else
    {
        console.log("errrer");
    }
})



    
})


// console.log("the added image is ",req.files.image);

})




module.exports = router;