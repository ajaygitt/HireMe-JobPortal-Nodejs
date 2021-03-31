const { response } = require('express');
var express = require('express');
const adminHelpers = require('../helpers/adminHelpers');
const userHelpers=require('../helpers/userHelper')
var router = express.Router();





router.get('/recruiters-management',(req,res)=>{
    let keyword="recruiter"
        adminHelpers.getEmployees(keyword).then((users)=>{
            let rec=true
            console.log("mm",users);
            res.render('admin/usermanagement',{ admin: true,users,rec })
        })
    })




router.get('/employees-management',(req,res)=>{
let keyword="employee"
    adminHelpers.getEmployees(keyword).then((users)=>{
        console.log("users",users);
        let emp=true
        res.render('admin/usermanagement',{admin:true,users,emp})
    })
})
//admin blocks user

router.post('/blockUser',(req,res)=>{

    console.log("req.boyd",req.body.id);
adminHelpers.blockUser(req.body.id).then((response)=>{

res.json(response)

})


})

//unblock user

router.post('/unblockUser',(req,res)=>{
    console.log("kk");

    adminHelpers.unblockUser(req.body.id).then((response)=>{
        res.json(response)
    })
})

router.get('/job-management',(req,res)=>{
    console.log("da");
userHelpers.viewAllJobs().then((jobs)=>{

    res.render('admin/jobmanagement',{admin:true,jobs})
})
})

module.exports = router;
