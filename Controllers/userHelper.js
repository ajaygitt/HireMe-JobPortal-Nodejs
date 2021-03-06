var db = require("../config/connection");
var collection = require("../config/dbcollections");
var bcrypt = require("bcrypt");
const {
  USER_COLLECTION,
  JOB_COLLECTION,
  RESUME_COLLECTION,
  appliedJobs,
  MESSAGE_COLLECTION,
  QUESTIONS_COLLECTION,
} = require("../config/dbcollections");
const { response } = require("express");
const Razorpay = require("razorpay");
const { ObjectId, ObjectID } = require("bson");
const { resource } = require("../app");
const { resolve } = require("path");
var lodash = require("lodash");
const { reject } = require("lodash");
const moment = require("moment");
var instance = new Razorpay({
  key_id: "rzp_test_3URBQ8j8qtsLhB",
  key_secret: "U8nhJZH5oxQoudiSGQVWYSw5",
});

module.exports = {
  doSignUp: (userData) => {
    let email = userData.email;

    return new Promise(async (resolve, reject) => {
      let emailexist = 0;
      emailexist = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: email });

      if (emailexist != null) {
        response.status = false;
        resolve(response);
        console.log("emailexisttt", response);
      } else if (emailexist == null) {
        console.log("userData", userData);
        let password = await bcrypt.hash(userData.password, 10);
        let user = db
          .get()
          .collection(USER_COLLECTION)
          .insertOne({
            full_name: userData.full_name,
            email: userData.email,
            phonenumber: userData.phonenumber,
            education: userData.education,
            experience: userData.experience,
            gender: userData.gender,
            skills: [userData.skill],
            areaOfIntrest: userData.interest,
            city: userData.city,
            password: password,
            type: "employee",
          })
          .then((result) => {
            resolve(result.ops[0]);
            console.log("opd dataaa", result.ops[0]);
          });
      }
    });
  },

  googleSignup: (userData) => {
    return new Promise(async (resolve, reject) => {
      console.log("emial", userData);
      let emailexist = 0;
      emailexist = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: userData.email });

      if (emailexist) {
        let response = emailexist;
        resolve(response);
      } else {
        await db
          .get()
          .collection(USER_COLLECTION)
          .insertOne({
            full_name: userData.fullname,
            email: userData.email,
            picture: userData.picture,
            type: "employee",
          })
          .then((response) => {
            resolve(response);
          });
      }
    });
  },

  doLogin: (userData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let password1 = await bcrypt.hash(userData.password, 10);

      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ email: userData.email });
      if (user) {
        let status = await bcrypt.compare(userData.password, user.password);

        if (status == true) {
          resolve(user);
        } else {
          response.status = 2;
          resolve(response);
        }
      } else {
        response.status = 3;
        resolve(response);
      }
    });
  },

  verifyPhoneNumber: (phoneNumber) => {
    let respone = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ phonenumber: phoneNumber.phone });
      if (user) {
        response.status = true;
        resolve(response);
      } else {
        console.log("nn", user);
        response.status = false;
        resolve(response);
      }
    });
  },

  getByphoneNumber: (phoneNumber) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ phonenumber: phoneNumber });
      if (user) {
        resolve(user);
      } else {
        reject();
      }
    });
  },

  generateRazorPay: (Userid) => {
    return new Promise((resolve, reject) => {
      var options = {
        amount: 199 * 100,
        currency: "INR",
        receipt: "" + Userid,
      };
      instance.orders.create(options, function (err, order) {
        if (err) {
          console.log("err", err);
        } else {
          console.log("order iiss", order);
          resolve(order);
        }
      });
    });
  },

  verifyPayment: (details, userid) => {
    console.log("hopee", details);
    return new Promise(async (resolve, reject) => {
      let premium = await db
        .get()
        .collection(USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userid) },
          {
            $set: {
              premium: true,
            },
          }
        );

      const crypto = require("crypto");
      let hmac = crypto.createHmac("sha256", "Mf0VLj5ZCqBtTObi3Zy79LO3");
      hmac.update(
        details["payment[razorpay_order_id]"] +
          "|" +
          details["payment[razorpay_payment_id]"]
      );
      hmac = hmac.digest("hex");
      if (hmac == details["payment[razorpay_signature]"]) {
        resolve();
      } else {
        reject();
      }
    });
  },

  isPremium: (userid) => {
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectId(userid) });
      if (user) {
        resolve(user);
      } else {
        reject;
      }
    });
  },

  viewAllJobs: () => {
    return new Promise(async (resolve, reject) => {
      let jobs = await db.get().collection(JOB_COLLECTION).find().toArray();
      if (jobs) {
        resolve(jobs);
      } else {
        reject();
      }
    });
  },

  viewSingleJob: (id) => {
    return new Promise((resolve, reject) => {
      let job = db
        .get()
        .collection(JOB_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  seachJob: (keyword, location) => {
    return new Promise(async (resolve, reject) => {
      console.log("key");
      let key2 = keyword.charAt(0).toLowerCase();

      await db
        .get()
        .collection(JOB_COLLECTION)
        .find({
          $or: [
            { jobTitle: { $regex: keyword } },
            { tags: { $regex: keyword } },
            { description: { $regex: keyword } },
            { company_name: { $regex: keyword } },
            { company_name: { $regex: key2 } },
            { jobTitle: { $regex: key2 } },
          ],
        })
        .toArray()
        .then((result) => {
          console.log("result is ", result);

          if (location) {
            if (result[0]) {
              var picked = lodash.filter(
                result,
                (x) => x.location === location
              );

              console.log("location isisis sorted form", picked);

              resolve(picked);
            } else {
              resolve(result);
            }
          } else {
            resolve(result);
          }
        });
    });
  },

  filterJobsbyDate: (keyword) => {
    return new Promise(async (resolve, reject) => {
      let res = await db
        .get()
        .collection(JOB_COLLECTION)
        .find()
        .sort({ dateposted: keyword })
        .toArray();

      if (res) {
        resolve(res);
        console.log("reslut is", res);
      } else {
        reject();
      }
      // db.restaurants.find().sort( { "borough": 1, "_id": 1 } )
    });
  },

  filterBysalary: (keyword) => {
    return new Promise(async (resolve, reject) => {
      let res = await db
        .get()
        .collection(JOB_COLLECTION)
        .find()
        .sort({ sallary: keyword })
        .toArray();

      if (res) {
        resolve(res);
      } else {
        reject();
      }
    });
  },

  findByCity: (keyword) => {
    return new Promise(async (resolve, reject) => {
      let res = await db
        .get()
        .collection(JOB_COLLECTION)
        .find({ location: { $regex: keyword } })
        .toArray();

      if (res) {
        resolve(res);
      } else {
        reject();
      }
    });
  },

  ViewMyProfile: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectId(id) })
        .then((myProfile) => {
          resolve(myProfile);
        });
    }).catch((err) => {
      res.send("err", err);
    });
  },

  addSkill: (skill, userid) => {
    console.log("skill", skill, userid);
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(userid) },
          { $push: { skills: { skills: skill } } }
        )
        .then(() => {
          let response = {
            status: true,
          };
          resolve(response);
        });
    });
  },
  addBio: (data, id) => {
    return new Promise(async (resolve, reject) => {
      let useris = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectId(id) });
      if (useris.bio) {
        resolve();
      } else {
        let user = await db
          .get()
          .collection(USER_COLLECTION)
          .updateOne(
            { _id: ObjectId(id) },
            {
              $push: {
                bio: {
                  careerBio: data.ca,
                  personalBio: data.va,
                },
              },
            }
          );
        let response = {
          user: useris,
          status: true,
        };
        resolve(response);
      }
    });
  },

  addEmployment: (data, id) => {
    return new Promise(async (resolve, reject) => {
      let employment = data.emp;
      let company = data.cmp;

      db.get()
        .collection(USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $push: {
              employment: { employment, company: company },
            },
          }
        );
      let useris = await db
        .get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectId(id) });

      let response = {
        user: useris,
        status: true,
      };
      resolve(response);
    });
  },

  addResume: (data, id) => {
    return new Promise(async (resolve, reject) => {
      console.log("here");

      let userexist = await db
        .get()
        .collection(collection.RESUME_COLLECTION)
        .findOne({ userid: id });

      if (userexist) {
        db.get()
          .collection(collection.RESUME_COLLECTION)
          .updateOne(
            { userid: id },
            {
              $set: {
                full_name: data.full_name,
                description: data.description,
                language: data.language,
                education: data.ed1,
                education2: data.ed2,
                college: data.college,
                experience: data.experience,
                company: data.companyy,
                address: data.address,
                fb: data.fb,
                insta: data.insta,
                linkedin: data.linkedin,
                skype: data.skype,
                dob: data.dob,
              },
            }
          );
        resolve();
      } else {
        await db.get().collection(collection.RESUME_COLLECTION).insertOne({
          userid: id,
          full_name: data.full_name,
          description: data.description,
          language: data.language,
          education: data.ed1,
          education2: data.ed2,
          college: data.college,
          experience: data.experience,
          company: data.companyy,
          address: data.address,
          fb: data.fb,
          insta: data.insta,
          linkedin: data.linkedin,
          skype: data.skype,
          dob: data.dob,
        });

        resolve();
      }
    });
  },

  viewResume: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.RESUME_COLLECTION)
        .findOne({ userid: id })
        .then((cv) => {
          resolve(cv);
        });
    });
  },

  addProPic: (id) => {
    console.log("k got");
    return new Promise((resolve, reject) => {
      db.get()
        .collection(USER_COLLECTION)
        .updateOne(
          { _id: ObjectId(id) },
          {
            $set: {
              proPic: true,
            },
          }
        );
      resolve();
    });
  },

  profileProgress: (profile, resume) => {
    return new Promise(async (resolve, reject) => {
      console.log("profile is", profile);
      if (resume) {
        let proArray = Object.values(resume);
        console.log("profile array is", proArray);
        console.log("ary lngth", proArray.length);
        var empties = proArray.length - proArray.filter(String).length;

        console.log("the empties are", empties);

        var level;

        if (empties <= 2) {
          let res = {
            level: 99,
          };
          level = res;
        }

        if (empties >= 3 && empties <= 5) {
          let res = {
            level: 87,
          };
          level = res;
        }

        if (empties >= 6 && empties <= 8) {
          let res = {
            level: 60,
          };
          level = res;
        }

        if (empties >= 9 && empties <= 11) {
          let res = {
            level: 45,
          };
          level = res;
        }
        if (empties >= 12 && empties <= 14) {
          let res = {
            level: 35,
          };
          level = res;
        }

        resolve(level);
      } else {
        let res = {
          level: 40,
        };
        level = res;
        resolve(level);
      }
    });
  },

  cvAdded: (id) => {
    return new Promise(async (resolve, reject) => {
      let cv = await db
        .get()
        .collection(RESUME_COLLECTION)
        .findOne({ userid: id });

      if (cv) {
        db.get()
          .collection(RESUME_COLLECTION)
          .updateOne(
            { userid: id },
            {
              $set: {
                pdfcv: true,
              },
            }
          );
      } else {
        db.get()
          .collection(RESUME_COLLECTION)
          .insertOne({ userid: id, pdfcv: true });
      }

      resolve();
    });
  },

  applyJob: (jobId, userid, name, message) => {
    return new Promise(async (resolve, reject) => {
      console.log("name,msg,", name, message);
      let collectionExist = await db
        .get()
        .collection(appliedJobs)
        .findOne({ userid: ObjectID(userid) });

      let jobObj = {
        job: ObjectID(jobId),
        message: message,
        status: "applied",
        appliedDate: moment(new Date()).format("DD/MM/YYYY"),
      };

      if (collectionExist) {
        console.log("akfs", collectionExist.jobs);
        console.log("jobid id di d", jobId);
        let JobExist = await collectionExist.jobs.findIndex(
          (a) => a.job == jobId
        );

        console.log("the job exist is ssi s", JobExist);

        if (JobExist != -1) {
          console.log("job  exists", JobExist);

          let response = {};
          response.status = "jobexists";
          resolve(response);
        } else {
          console.log("job not esisiists exist", JobExist);

          db.get()
            .collection(appliedJobs)
            .updateOne(
              { userid: ObjectID(userid) },
              {
                $push: {
                  jobs: jobObj,
                },
              }
            );
        }
      }
      // mapping to be implemented pending-1
      else {
        db.get()
          .collection(appliedJobs)
          .insertOne({ userid: ObjectID(userid), jobs: [jobObj] });
      }
      let response = {
        status: true,
      };
      // applied successfull response
      resolve(response);
    }).catch(() => {
      let response = {
        status: false,
      };
      resolve(response);
    });
  },

  //view applied jobs list user's
  myApplications: (userid) => {
    return new Promise(async (resolve, reject) => {
      console.log("thisisi");

      let jobis = await db
        .get()
        .collection(collection.appliedJobs)
        .aggregate([
          {
            $match: {
              userid: ObjectID(userid),
            },
          },
          {
            $unwind: "$jobs",
          },
          {
            $project: {
              jobs: "$jobs.job",
              message: "$jobs.message",
              status: "$jobs.status",
            },
          },
          {
            $lookup: {
              from: collection.JOB_COLLECTION,
              localField: "jobs",
              foreignField: "_id",
              as: "jobis",
            },
          },
          {
            $project: {
              jobs: 1,
              message: 1,
              status: 1,
              jobis: { $arrayElemAt: ["$jobis", 0] },
            },
          },
        ])
        .toArray();

      resolve(jobis);
      console.log("the job is ", jobis);
    });
  },

  checkIfApplied: (jobid, userid) => {
    return new Promise(async (resolve, reject) => {
      console.log("the job id od", jobid);
      let collectionExist = await db
        .get()
        .collection(appliedJobs)
        .findOne({ userid: ObjectID(userid) });

      if (collectionExist) {
        let JobExist = collectionExist.jobs.findIndex((a) => a.job == jobid);

        console.log("the job exist is ssi s", JobExist);

        if (JobExist != -1) {
          console.log("job  exists", JobExist);

          let response = {};
          response.status = "jobexists";
          resolve(response);
        } else {
          console.log("from else true not exist");
          let response = {
            status: "notexists",
          };
          resolve(response);
        }
      } else {
        console.log("frm coln nt exsts");
        let response = {
          status: "notexists",
        };
        resolve(response);
      }
    });
  },

  browseAllRecruiter: () => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER_COLLECTION)
        .find({ type: "recruiter" })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  // getInbox:(id)=>{
  // db.get().collection(collection.MESSAGE_COLLECTION).aggregate([

  // {
  //   $match:{

  //     sender:id
  //   }
  // }

  // ])

  // },

  getSentMessages: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MESSAGE_COLLECTION)
        .aggregate([
          {
            $match: {
              sender_id: id,
            },
          },
          {
            $lookup: {
              from: collection.MESSAGE_COLLECTION,
              localField: "sender_id",
              foreignField: "_id",
              as: "list",
            },
          },
          {
            $project: {
              _id: 1,
            },
          },
        ])

        .toArray()
        .then((messages) => {
          resolve(messages);
        });
    });
  },

  getReceivedMessages: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(collection.MESSAGE_COLLECTION)
        .find({ receiver_id: id })
        .toArray()
        .then((messages) => {
          resolve(messages);
        });
    });
  },

  recentJobs: () => {
    return new Promise(async (resolve, reject) => {
      let result = await db
        .get()
        .collection(JOB_COLLECTION)
        .find()
        .sort({ dateposted: -1 })
        .toArray();

      result = result.slice(0, 4);

      resolve(result);
    });
  },

  loadQuestions: () => {
    return new Promise(async (resolve, reject) => {
      let question = await db
        .get()
        .collection(QUESTIONS_COLLECTION)
        .find()
        .toArray();

      console.log("fi", question);
      resolve(question);
    });
  },

  loadNextQuestion: () => {
    return new Promise((resolve, reject) => {
      db.get().collection(QUESTIONS_COLLECTION).find();
    });
  },

  // insertquestion:(data)=>{
  //   db.get().collection(QUESTIONS_COLLECTION).insertOne(data)
  // }

  checkAnswer: (id, ans) => {
    return new Promise(async (resolve, reject) => {
      let answer = await db
        .get()
        .collection(QUESTIONS_COLLECTION)
        .findOne({ _id: ObjectID(id) });
      console.log("ans", ans);
      if (answer) {
        if (answer.correct == ans) {
          resolve((answer = true));
        } else {
          resolve((answer = false));
        }
      }
    });
  },
};
