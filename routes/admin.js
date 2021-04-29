const { response } = require("express");
var express = require("express");
const adminHelpers = require("../Controllers/adminHelpers");
const NotificationController = require("../Controllers/NotificationController");
const userHelpers = require("../Controllers/userHelper");
var router = express.Router();

router.get("/recruiters-management", (req, res) => {
  let keyword = "recruiter";
  adminHelpers.getEmployees(keyword).then((users) => {
    let rec = true;
    console.log("mm", users);
    res.render("admin/usermanagement", { admin: true, users, rec });
  });
});

router.get("/employees-management", (req, res) => {
  let keyword = "employee";
  adminHelpers.getEmployees(keyword).then((users) => {
    console.log("users", users);
    let emp = true;
    res.render("admin/usermanagement", { admin: true, users, emp });
  });
});
//admin blocks user

router.post("/blockUser", (req, res) => {
  console.log("req.boyd", req.body.id);
  adminHelpers.blockUser(req.body.id).then((response) => {
    res.json(response);
  });
});

//unblock user

router.post("/unblockUser", (req, res) => {
  adminHelpers.unblockUser(req.body.id).then((response) => {
    res.json(response);
  });
});

router.get("/job-management", (req, res) => {
  userHelpers.viewAllJobs().then((jobs) => {
    res.render("admin/jobmanagement", { admin: true, jobs });
  });
});

router.get("/viewJob", (req, res) => {
  userHelpers.viewAllJobs().then((jobs) => {
    let viewJob = 1;

    console.log("d", jobs);
    res.render("admin/jobmanagement", { viewJob, admin: true, jobs });
  });
});

router.get("/viewRecruiter", (req, res) => {
  let log = req.query.recrutier;

  adminHelpers.findRecruiter(log).then((recruiteris) => {
    console.log("reached", recruiteris);

    res.render("admin/profiles", { admin: true, recruiteris });
  });
});

router.post("/deleteJob", (req, res) => {
  console.log("hkask");
  console.log("hai gusy", req.body);
  let id = req.body.id;
  adminHelpers.deleteJob(id).then((response) => {
    res.send(response);
  });
});

router.get("/send-Notification", (req, res) => {
  res.render("admin/sendNotification", { admin: true });
});

router.post("/sendNotification", (req, res) => {
  NotificationController.sendNotificationByAdmin(req.body.data).then(
    (response) => {
      res.send(response);
    }
  );
});

module.exports = router;
