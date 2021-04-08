var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();
const passport=require('passport')
const auth =require('../routes/passport-setup')
const app = require('../app');
const userHelper = require('../Controllers/userHelper');
const recruiterHelper=require('../Controllers/recruiterHelper');
const notificationHelper=require('../Controllers/NotificationController')
const { myJobs } = require('../Controllers/recruiterHelper');
const { AwsPage } = require('twilio/lib/rest/accounts/v1/credential/aws');
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
let userfound=req.session.user
console.log("mm",userfound);
if(userfound.premium)
{
   res.render('recruiter/add-job',{recruiter:true,userfound})
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


})



router.get('/myJobs',verifyLoggedIn,(req,res)=>{

    let userfound=req.session.user
    console.log("usr",userfound);
let myJobs=recruiterHelper.myJobs(userfound._id).then((myJobs)=>{
let viewonly=true
    console.log("myJobs",myJobs);
    res.render('recruiter/manageJobs',{recruiter:true,viewonly,myJobs,userfound})
})

})

router.get('/manage-jobs',(req,res)=>{

    let userfound=req.session.user
    console.log("urr",userfound);
    let myJobs=recruiterHelper.myJobs(userfound._id).then((myJobs)=>{
console.log("err",myJobs);
        res.render('recruiter/manageJobs',{recruiter:true,myJobs,userfound,message:req.flash('message')})
    })
})

//recruiter profile
router.get('/recruiterProfile',async(req,res)=>{
    let userfound=req.session.user
    console.log("ljksa");
  let profile=await  recruiterHelper.viewMyProfile(userfound._id)

        res.render('recruiter/myProfile',{recruiter:true,userfound,profile})
    
})

//browse employees

router.get('/browse-employees',(req,res)=>{
    let userfound=req.session.user
    res.render('recruiter/browse-employees',{recruiter:true,userfound})
})
 
router.post('/deleteJob',(req,res)=>{
    let userfound=req.session.user
    let jobId=req.body.id
    recruiterHelper.deleteJob(jobId).then((response)=>{
   
        res.send(response)
    })
})

router.get('/editJob',(req,res)=>{
let id=req.query.job
let userfound=req.session.user
userHelper.viewSingleJob(id).then((job)=>{
    console.log("job id this",job);
res.render('recruiter/edit-job',{recruiter:true,job,userfound})

})
})

router.post('/editJob',(req,res)=>{
    let id=req.query.job
    let recid=req.session.user._id
    console.log("this isbody",req.body);
    recruiterHelper.editJob(id,req.body,recid).then(()=>{
        req.flash('message','Job edited successfully');
res.redirect('/manage-jobs')
    })
})


router.get('/viewApplications',(req,res)=>{
    let id=req.query.job
let userfound=req.session.user

    recruiterHelper.viewApplications(id).then((applications)=>{

console.log("job id is",id);

res.render('recruiter/viewApplicants',{recruiter:true,applications,id})
    })
})


router.get('/viewUserResume',(req,res)=>{
    let applicant=req.query.applicant
let jobId=req.query.job

console.log("these values aree",jobId,applicant);

recruiterHelper.checkIfconfirmed(applicant).then((applicant)=>{

console.log("applicant",applicant);
})





    recruiterHelper.viewMyProfile(applicant).then((applicant)=>{

        res.render('recruiter/viewResume',{recruiter:true,applicant,jobId,applicant})
    })

})


router.post('/approveJob',(req,res)=>{

console.log("Job,",req.body);
let userfound=req.session.user

 recruiterHelper.approveApplicant(req.body.user,req.body.job).then((response)=>{

    notificationHelper.sendApprovedNotification(req.body.user,req.body.job,userfound._id)


res.json(response);
})
})


router.post('/reject',(req,res)=>{

    let userfound=req.session.user
    recruiterHelper.rejectApplicant(req.body.user,req.body.job).then((response)=>{

        notificationHelper.sendRejectedNotification(req.body.user,req.body.job,userfound._id)

        res.json(response)
    })
})






module.exports = router;