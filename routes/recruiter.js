var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();
const passport=require('passport')
const auth =require('../routes/passport-setup')
const app = require('../app');
const userHelper = require('../helpers/userHelper');
const recruiterHelper=require('../helpers/recruiterHelper')
require('./passport-setup')






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









module.exports = router;