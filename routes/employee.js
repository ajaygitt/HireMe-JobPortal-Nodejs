var express = require('express');
const { response, resource, render } = require('../app');
var router = express.Router();


router.get('/',(req,res)=>{
    res.render('employee/index')
})


router.get('/login',(req,res)=>{
    let no=1
    res.render("employee/login",{no})
})
module.exports = router;
