const { response } = require('express');
var express = require('express');
var router = express.Router();

router.get('/ad',(req,res)=>{
    res.render('employee/index')
})




module.exports = router;
