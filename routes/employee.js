var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();
const passport=require('passport')
const auth =require('../routes/passport-setup')
const app = require('../app');
require('./passport-setup')

function isLoggedIn(req,res,next){
    req.user ? next():res.sendStatus(401);
}



router.get('/',(req,res)=>{
    res.render('employee/index')
})


 router.get('/login',(req,res)=>{
    let no=1
   res.render("employee/login",{no})
 })


router.get('/auth/google',
passport.authenticate('google',{scope:['email','profile']})
)

router.get('/home',isLoggedIn,(req,res)=>{
    console.log("sess",req.session.passport);
    res.send('success')
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
    res.render('employee/signup',{no})
})









module.exports = router;
