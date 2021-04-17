var express = require("express");
const { response, resource, render, request } = require("../app");
var router = express.Router();
const passport = require("passport");
const auth = require("../routes/passport-setup");
const app = require("../app");
const userHelper = require("../Controllers/userHelper");
const notificationHelper = require("../Controllers/NotificationController");

require("./passport-setup");
const config = require("../config/twilio");
const { static } = require("express");
const client = require("twilio")(config.accountSID, config.authToken);
const fs = require("fs");
const PDFDocument = require("pdfkit");
var base64ToImage = require("base64-to-image");
const recruiterHelper = require("../Controllers/recruiterHelper");
const adminHelper=require('../Controllers/adminHelpers')
const messageController = require("../Controllers/messageController");

//middlevare for session checking
const verifygoogleLogin = (req, res, next) => {
  var userfound = req.session.email;
  if (req.user) {
    req.session.email = req.user.email;
    let sessionis = req.session.email;
    console.log("inside home session present", sessionis);
    let userIs = req.session.email;
    if (userIs) {
      next();
    }
  } else {
    res.redirect("/");
  }
};

//middleware for checking session userside

const verifyLoggedIn = (req, res, next) => {
  let userfound = req.session.user;
  if (userfound) {
    next();
  } else {
    res.redirect("/");
  }
};
//middleware for check if premium

const verifyIfPremium = (req, res, next) => {
  let userfound = req.session.user;
  if (userfound.premium) {
    next();
  } else {
    res.render("notPremium", { recruiter: true, userfound });
  }
};

//middleware for 404 checking google
function isLoggedIn(req, res, next) {
  if (req.user.email) {
    req.session.user = req.user.email;

    console.log("req.bodyyy", req.user.email);
  }

  req.user ? next() : res.sendStatus(401);
}

//to home

router.get("/", async (req, res) => {
  let userfound = req.session.user;

  if (userfound) {
    if (userfound.type == "employee") {
      let premium = await userHelper.isPremium(userfound._id).then((result) => {
        console.log("premium", result);
        let home = true;
        res.render("employee/home", { user: true, home, userfound, result });
      });
    } else if (userfound.type == "recruiter") {
      let home = 1;
      res.render("recruiter/home", { recruiter: true, userfound, home });
    }
    
    else if (userfound.type == "admin") {
  
  let usersCount=await    adminHelper.getUsersCount()
  let premiumUsers= await adminHelper.premiumUsers()
  let revenue=await premiumUsers*199
  let JobsCount=await adminHelper.JobsCount()
  console.log("Glfasl",usersCount);
      res.render("admin/home", { admin: true,usersCount,premiumUsers,revenue,JobsCount });
    }
  } else {
    let nouser = 1;
    res.render("employee/index", { user: true, nouser });
  }
});

router.get("/login", (req, res) => {
  let userfound = req.session.user;
  if (userfound) {
    res.redirect("/");
  } else {
    let no = 1;
    let nouser = 1;
    res.render("employee/login", { user: true, nouser, no });
  }
});

//login manual

router.post("/login", (req, res) => {
  console.log("keri");
  userHelper.doLogin(req.body).then((response) => {
    if (response.status == 3) {
      res.send(response);
    } else if (response.status == 2) {
      console.log("pwd err");
      res.send(response);
    } else if (response.type == "employee") {
      req.session.user = response;
      res.send(response);
    } else if (response.type == "recruiter") {
      req.session.user = response;
      res.send(response);
    } else if (response.type == "admin") {
      req.session.user = response;

      res.send(response);
    }
  });
});

//google get page
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

// router.get('/home',verifygoogleLogin,isLoggedIn,(req,res)=>{

//     console.log("at home ");

//     res.send('success')
// })

//userhome defalult router
router.get("/home", isLoggedIn, (req, res) => {
  let userfound = req.session.user;
  console.log("heeree##", userfound);
  res.render("employee/index", { user: true, userfound });
});

router.get(
  "/google/callback",
  passport.authenticate("google", {
    successRedirect: "/home",
    failureRedirect: "/failure",
  })
);

router.get("/failure", (req, res) => {
  res.send("failed");
});

router.get("/signup", (req, res) => {
  let no = 1;
  let nouser = 1;
  res.render("employee/signup", { user: true, no, nouser });
});

//manual signup
router.post("/signup", async (req, res) => {
  console.log(req.body);
  await userHelper.doSignUp(req.body).then((response) => {
    console.log("htmsl", response);
    if (response.status == false) {
      let sess = true;
      res.render("employee/signup", { user: true, sess });
      sess = false;
    } else {
      let signupSuccess = true;
      let no = true;
      let nouser = 1;
      res.render("employee/login", { user: true, signupSuccess, nouser, no });
      signupSuccess = false;
      no = false;
    }
  });
});

//linkedin

router.get(
  "/auth/linkedin",
  passport.authenticate("linkedin", { state: "SOME STATE" }),
  function (req, res) {
    // The request will be redirected to LinkedIn for authentication, so this
    // function will not be called.
  }
);
router.get(
  "/auth/linkedin/callback",
  passport.authenticate("linkedin", {
    successRedirect: "/home",
    failureRedirect: "/failure",
  })
);

//logout

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.redirect("/");
});

router.get("/otpLogin", (req, res) => {
  console.log("employee");
  let no = 1;
  let nouser = 1;
  res.render("employee/otpLogin", { user: true, nouser, no });
});

router.post("/otpLogin", async (req, res) => {
  console.log("reqboody", req.body);
  await userHelper.verifyPhoneNumber(req.body).then((response) => {
    if (response.status == true) {
      req.session.phone = req.body.phone;

      client.verify
        .services(config.serviceID)
        .verifications.create({
          to: `+918156803272`,
          channel: `sms`,
        })
        .then((data) => {
          console.log(data);
          if (data) {
            res.send(response);
          } else {
            res.send(response);
          }
        });
    } else {
      res.send(response);
    }
  });
});

router.get("/otpVerify", (req, res) => {
  let no = 1;
  let userfound = req.session.user;
  if (userfound) {
    res.redirect("/");
  } else {
    let nouser = 1;
    res.render("employee/otpVerify", { nouser, user: true, no });
  }
});

router.post("/otpVerify", (req, res) => {
  let userfound = req.session.user;
  if (userfound) {
    res.redirect("/");
  } else {
    let response = {};
    let otp = req.body.otp;
    let phoneis = req.session.phone;
    console.log("the phone number is", phoneis);
    client.verify
      .services(config.serviceID)
      .verificationChecks.create({
        to: `+91${phoneis}`,
        code: otp,
      })
      .then((data) => {
        console.log("data", data);
        if (data.valid) {
          userHelper.getByphoneNumber(phoneis).then((response) => {
            response.status = true;
            req.session.user = response;
            res.send(response);
            req.session.phone = null;
          });
        } else {
          console.log("err otp");
          response.status = false;
          res.send(response);
          req.session.phone = null;
        }
      });
  }
});

router.get("/checkout", verifyLoggedIn, (req, res) => {
  res.render("employee/checkout", { user: true });
});

router.get("/checkout", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  res.render("recruiter/checkout", { recruiter: true, userfound });
});

router.post("/checkout", verifyLoggedIn, (req, res) => {
  let response = {};
  let value = req.body.type;
  let userid = req.body.userid;
  console.log("userid is", userid);
  if (value == "razorpay") {
    userHelper.generateRazorPay(userid).then((response) => {
      response.type = "razorpay";
      console.log("the resposne is here catched", response);
      res.send(response);
    });
  } else {
    response.type = "paypal";
    res.send(response);
  }
});

router.post("/verify-payment", verifyLoggedIn, (req, res) => {
  console.log("reqqq body of veify ", req.body);

  let userid = req.session.user._id;

  userHelper
    .verifyPayment(req.body, userid)
    .then(() => {})
    .catch(() => {
      let response = {};
      response.success = true;

      req.session.user.premium = true;
      res.send(response);
    });
});

//view all jobs
router.get("/viewjobs", verifyLoggedIn, (req, res) => {
  userHelper.viewAllJobs().then((jobs) => {
    let length = jobs.length;
    console.log("legth is ", length);
    let pageNumber = [
      { page: 1 },
      { page: 2 },
      { page: 3 },
      { page: 4 },
      { page: 5 },
      { page: 6 },
    ];

    const page = parseInt(req.query.page);

    const limit = parseInt(req.query.limit);

    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    jobs = jobs.slice(startIndex, endIndex);

    if (!jobs[0]) {
      console.log("end");
    }

    console.log("jobs are", jobs);
    let userfound = req.session.email;
    let prev = page - 1;
    let next = page + 1;
    if (prev == 0) {
      prev = 1;
    }
    res.render("employee/browse-jobs", {
      user: true,
      jobs,
      userfound,
      pageNumber,
      prev,
      next,
    });
  });
});

//single jobview
router.get("/jobPage", verifyLoggedIn, (req, res) => {
  let id = req.query.job;
  let userfound = req.session.user;
  userHelper.viewSingleJob(id).then((jobs) => {
    userHelper.checkIfApplied(id, userfound._id).then((response) => {
      if (response.status == "notexists") {
        var applied = false;

        res.render("employee/job-single", {
          user: true,
          jobs,
          applied,
          userfound,
        });
      } else if (response.status == "jobexists") {
        var applied = true;

        res.render("employee/job-single", {
          user: true,
          jobs,
          applied,
          userfound,
        });
      }
    });
  });
});

router.post("/searchJob", verifyLoggedIn, (req, res) => {
  let keyword = req.body.keyword;
  let location = req.body.city;
  userHelper.seachJob(keyword, location).then((jobs) => {
    var stat = jobs;
    res.render("employee/browse-jobs", { user: true, jobs });
  });
});

router.post("/filter", verifyLoggedIn, verifyIfPremium, (req, res) => {
  console.log("reached here", req.body);

  if (req.body.keyword == "oldest" || req.body.keyword == "recent") {
    if (req.body.keyword == "oldest") {
      var keyword = -1;
    } else if (req.body.keyword == "recent") {
      var keyword = 1;
    }

    console.log("keyword is ", keyword);
    userHelper.filterJobsbyDate(keyword).then((result) => {
      let jobs = result;
      res.render("employee/browse-jobs", { user: true, jobs });
    });
  } else {
    if (req.body.keyword == "high") {
      var keyword = -1;
    } else {
      var keyword = 1;
    }

    userHelper.filterBysalary(keyword).then((result) => {
      console.log("result", result);
      let jobs = result;
      res.render("employee/browse-jobs", { user: true, jobs });
    });
  }
});

router.post("/searchByCity", verifyLoggedIn, (req, res) => {
  userHelper.findByCity(req.body.city).then((jobs) => {
    res.render("employee/browse-jobs", { user: true, jobs });
  });
});

router.get("/myProfile", verifyLoggedIn, async (req, res) => {
  let userfound = req.session.user;
  let id = req.query.id;
  console.log("id ", id);
  if (userfound) {
    id = userfound._id;
  }
  await userHelper.ViewMyProfile(id).then(async (profile) => {
    let resume = await userHelper.viewResume(id);
    console.log("profile is ", profile);
    console.log("c v is", resume);

    let profileProgress = await userHelper
      .profileProgress(profile, resume)
      .then((progress) => {
        console.log("progress", progress);

        res.render("employee/myprofile", {
          user: true,
          profile,
          progress,
          resume,
          userfound,
          message: req.flash("message"),
        });
      });
  });
});

router.post("/addNewSkill", verifyLoggedIn, async (req, res) => {
  console.log("req", req.body);
  let userfound = req.session.user;
  var str = req.body.form_data;
  var rest = str.slice(6);
  console.log("data is", res, userfound);

  await userHelper.addSkill(rest, userfound._id).then((response) => {
    console.log("this is response", response);
    res.send(response);
  });
});

router.post("/addBio", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  console.log("req", req.body);
  userHelper.addBio(req.body, userfound._id).then((response) => {
    console.log("res", response);

    res.send(response.status);
  });
});

router.post("/addthisEmployment", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  console.log("data is", req.body);
  userHelper.addEmployment(req.body, userfound._id).then((response) => {
    console.log("heheh", response);
    req.session.user = response.user;
    console.log("ses", req.session.user);
    res.send(response.status);
  });
});

router.post("/addResume", verifyLoggedIn, async (req, res) => {
  let userfound = req.session.user;
  console.log("re", req.body);

  let Fullname = req.session.user.full_name;
  let email = userfound.email;
  let phonenumber = userfound.phonenumber;
  let education = req.body.education;
  let experience = req.body.experience;
  let company = req.body.company;
  let dob = req.body.dob;
  let address = req.body.address;
  let fb = req.body.fb;
  let insta = req.body.insta;
  let linkedin = req.body.linkedin;
  let skype = req.body.skype;

  //make pdf copy of resume
  const bio = [
    { Fullname: Fullname },
    { email: email },
    { gender: userfound.gender },

    { phonenumber: phonenumber },
    { education: education },
    { experience: experience },
    { company: company },
    { dob: dob },
    { address: address },
    { fb: fb },
    { insta: insta },
    { linkedin: linkedin },
    { skype: skype },
  ];

  let id = userfound._id;

  let i = 1000;
  bio.forEach((bio) => {
    i++;
    let doc = new PDFDocument();

    doc.pipe(fs.createWriteStream("public/resumes/users-cv/" + id + ".pdf"));

    doc
      .fillColor("#444444")
      .fontSize(20)
      .text("Made with HireMe JobPortal © Ajay Pradeep\n", 110, 57)
      .fontSize(10)
      .text("DIGITAL RESUME (pdf copy)")
      .moveDown();

    doc.text(
      `Name:${Fullname} \n

 email:${email}\n
 dob:${dob}\n
 Phone Number:${phonenumber} \n
 Education :${education}\n
 Experience:${experience}\n
 company currently working on:${company}\n
 address:${address}\n
 Facebook:${fb}\n
 InstaGram:${insta}\n
 linkedin:${linkedin}\n
 skype:${skype}

 `,
      10,
      125,
      { width: 500 }
    );

    doc.end();
    console.log(bio.Fullname);
  });

  await userHelper.cvAdded(id);

  userHelper.addResume(req.body, userfound._id).then((response) => {
    req.flash("message", "Resume saved successfully as Pdf");
    res.redirect("/myProfile");
  });
});

router.post("/uploadCv", verifyLoggedIn, async (req, res) => {
  console.log("req.body isisi", req.files);

  let userfound = req.session.user;
  let id = userfound._id;
  let cv = req.files.image;
  console.log("cvv", cv);
  cv.mv("./public/resumes/users-cv/" + id + ".pdf", async (err, done) => {
    if (err) {
      console.log("pdf upload err", err);
    } else {
      await userHelper.cvAdded(id);

      req.flash("message", "saved successfully");
      res.redirect("/myProfile");
    }
  });
});

router.post("/uploadProfilepicture", verifyLoggedIn, (req, res) => {
  let image = req.files.profilepic;
  console.log("pro", image);
  let userfound = req.session.user;
  let id = userfound._id;
  image.mv("./public/images/profilePic/" + id + ".jpg", async (err, done) => {
    if (err) {
      console.log("err");
    } else {
      await userHelper.addProPic(id);
      req.flash("message", "Profile Pic uploaded Successfully");
      res.redirect("/myProfile");
    }
  });
});

router.post("/crop", verifyLoggedIn, async (req, res) => {
  console.log("reached");
  let id = req.session.user._id;
  let imgs = req.body.image;

  var base64Str = imgs;
  var path = "./public/images/profilePic/";
  var optionalObj = { fileName: id, type: "jpg" };

  base64ToImage(base64Str, path, optionalObj);
  await userHelper.addProPic(id);
  let response = {
    status: true,
  };
  res.send(response);
});

router.get("/viewResumePdf", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  let id = userfound._id;

  res.render("employee/embededpdf", { recruiter: true, userfound });
});

router.get("/crop", (req, res) => {
  res.render("employee/crop", { user: true });
});

router.post("/applyJob", verifyIfPremium, verifyLoggedIn, async (req, res) => {
  console.log("reached", req.body);

  let jobId = req.body.jobid;
  let name = req.body.name;
  let message = req.body.message;
  let userid = req.session.user._id;
  console.log("msg is ", message);
  await userHelper.applyJob(jobId, userid, name, message).then((response) => {
    res.json(response);
  });
});

router.get(
  "/viewMyApplications",
  verifyLoggedIn,
  verifyIfPremium,
  (req, res) => {
    let userfound = req.session.user;

    userHelper.myApplications(userfound._id).then((jobs) => {
      console.log("jkfdsa", jobs);

      res.render("employee/myApplications", { user: true, jobs });
    });
  }
);

router.get("/notifications", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  notificationHelper.getNotification(userfound._id).then((notifications) => {
 
    res.render("employee/notifications", { user: true, notifications });
  });
});
router.post("/removeNotification", verifyLoggedIn, (req, res) => {
  let userfound = req.session.user;
  notificationHelper.removeNotification(req.body.id).then((response) => {
    res.json(response);
  });
});

router.get("/browseRecruiter", verifyIfPremium, verifyLoggedIn, (req, res) => {
  userHelper.browseAllRecruiter().then((recruiters) => {
    console.log(recruiters);
    let userfound = req.session.user;
    res.render("employee/browse-recruiters", {
      user: true,
      userfound,
      recruiters,
    });
  });
});

router.get("/ViewRecruiter", (req, res) => {
  let id = req.query.recruiter;
  let userfound = req.session.user;

  recruiterHelper.getRecruiterById(id).then((recruiter) => {
    res.render("employee/recruiterDetails", {
      recruiter: true,
      recruiter,
      userfound,
    });
  });
});

router.post("/chat", async (req, res) => {
  let senderid = req.query.sender;
  let receiverid = req.query.receiver;
  console.log("sender id is ", senderid);
  console.log("receiver is ", receiverid);
  let user = receiverid;
  //  let sender=senderid+receiverid
  //  let receiver=receiverid+senderid

  let userfound = req.session.user;

  let first = senderid.length - 24;
  let senderis = senderid.slice(0, first);
  let receiveris = receiverid.slice(0, first);
  console.log("sender is this @@@@@@@@@@@@@@@@@@@@###########", senderis);
  console.log("the receiver is %%%%%%%%%%%%%%%%%%", receiveris);

  let sendChat = await messageController.sendChat(senderid, receiverid);

  let receivedchats = await messageController.receivedChat(
    receiverid,
    senderid
  );
  let Recieverdetails = await recruiterHelper.getRecruiterById(receiveris);

  console.log("senderchat", Recieverdetails);

  res.render("employee/chat", {
    userfound,
    recruiter: true,
    Recieverdetails,
    sendChat,
    receivedchats,
  });
});

module.exports = router;
