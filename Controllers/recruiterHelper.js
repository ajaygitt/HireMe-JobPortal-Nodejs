var db = require("../config/connection");
var collection = require("../config/dbcollections");
var bcrypt = require("bcrypt");
const {
  USER_COLLECTION,
  JOB_COLLECTION,
  appliedJobs,
} = require("../config/dbcollections");
const { response } = require("express");
const moment = require("moment");
const { reject } = require("lodash");
const { ObjectID } = require("bson");

module.exports = {
  signUp: (recruiterData) => {
    return new Promise(async (resolve, reject) => {
      let response = {};
      let emailexist = await db
        .get()
        .collection(collection.USER_COLLECTION)
        .findOne({ email: recruiterData.email });

      if (emailexist) {
        console.log("emailalready exissttttttt");
        response.status = false;
        resolve(response);
      } else {
        let password = await bcrypt.hash(recruiterData.password, 10);
        console.log("pass hashed", password);

        db.get()
          .collection(collection.USER_COLLECTION)
          .insertOne({
            company_name: recruiterData.company_name,
            recruiter_name: recruiterData.recruiter_name,
            email: recruiterData.email,
            phonenumber: recruiterData.phonenumber,
            address: recruiterData.address,
            skills: recruiterData.skills,
            experience: recruiterData.experience,
            city: recruiterData.city,
            password: password,
            type: "recruiter",
            credit: 2,
          })
          .then((response) => {
            response.status = true;
            response.ops[0].status = true;
            console.log("ivide cgange", response.ops[0]);
            resolve(response.ops[0]);
          });
      }
    });
  },

  postJob: (jobdata, recruiterid) => {
    return new Promise(async (resolve, reject) => {
      let salary = parseInt(jobdata.sallary);
      let newdate = moment(new Date()).format("DD/MM/YYYY");
      let job = db
        .get()
        .collection(JOB_COLLECTION)
        .insertOne({
          email: jobdata.email,
          jobTitle: jobdata.jobTitle,
          location: jobdata.location,

          jobType: jobdata.jobType,
          category: jobdata.category,
          tags: jobdata.tags,
          description: jobdata.description,
          closingDate: jobdata.closingDate,
          website: jobdata.website,
          tagline: jobdata.tagline,
          recruiter: recruiterid,
          sallary: salary,
          company_name: jobdata.company_name,
          qualification: jobdata.qualification,
          experience: jobdata.experience,
          dateposted: newdate,
        })
        .then((data) => {
          resolve(data.ops[0]._id);
          console.log("adsf", data.ops[0]._id);
        });
    });
  },

  myJobs: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(JOB_COLLECTION)
        .find({ recruiter: id })
        .toArray()
        .then((response) => {
          resolve(response);
        });
    });
  },

  viewMyProfile: (id) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(USER_COLLECTION)
        .findOne({ _id: ObjectID(id) })
        .then((result) => {
          resolve(result);
        });
    });
  },
  deleteJob: (jobId) => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(JOB_COLLECTION)
        .remove({ _id: ObjectID(jobId) })
        .then((response) => {
          resolve(response);
        });
    });
  },

  editJob: (id, jobdata, recid) => {
    return new Promise((resolve, reject) => {
      let salary = parseInt(jobdata.sallary);
      db.get()
        .collection(JOB_COLLECTION)
        .updateOne(
          { _id: ObjectID(id) },
          {
            $set: {
              email: jobdata.email,
              jobTitle: jobdata.jobTitle,
              location: jobdata.location,

              jobType: jobdata.jobType,
              category: jobdata.category,
              tags: jobdata.tags,
              description: jobdata.description,
              closingDate: jobdata.closingDate,
              website: jobdata.website,
              tagline: jobdata.tagline,
              recruiter: recid,
              sallary: salary,
              company_name: jobdata.company_name,
              qualification: jobdata.qualification,
              experience: jobdata.experience,
            },
          }
        );
      resolve();
    });
  },

  viewApplications: (id) => {
    return new Promise(async (resolve, reject) => {
      let applications = await db
        .get()
        .collection(appliedJobs)
        .aggregate([
          {
            $match: {
              jobs: {
                $elemMatch: {
                  job: ObjectID(id),
                },
              },
            },
          },
          {
            $project: {
              userid: 1,
              message: 1,
            },
          },
          {
            $lookup: {
              from: collection.USER_COLLECTION,
              localField: "userid",
              foreignField: "_id",
              as: "useris",
            },
          },
          {
            $project: {
              message: 1,
              useris: { $arrayElemAt: ["$useris", 0] },
            },
          },
        ])
        .toArray();

      resolve(applications);
    });
  },

  // viewApplications:(id)=>{
  //     return new Promise(async(resolve,reject)=>{
  // let applications= await db.get().collection(appliedJobs).aggregate([
  //     {
  //          $match:{
  //             jobs:{
  //                 $elemMatch:{
  //                     job:ObjectID(id)
  //                 }
  //             }
  //          }
  //     },
  //     {
  //         $unwind:'$jobs'
  //     },
  // {
  //     $project:{
  //         jobs:1,
  //         userid:1
  //     }
  // }
  // ]).toArray()

  // resolve(applications)
  // console.log("#####",applications);

  //     })
  // }

  approveApplicant: (user, job) => {
    return new Promise(async (resolve, reject) => {
      let jobis = await db
        .get()
        .collection(appliedJobs)
        .updateOne(
          { userid: ObjectID(user) },
          {
            $set: {
              "jobs.$[d].status": "approved",
            },
          },
          {
            arrayFilters: [
              {
                "d.job": ObjectID(job),
              },
            ],
          }
        );
      let res = {
        updated: true,
      };
      resolve(res);
    });
  },

  rejectApplicant: (user, job) => {
    return new Promise(async (resolve, reject) => {
      let jobis = await db
        .get()
        .collection(appliedJobs)
        .updateOne(
          { userid: ObjectID(user) },
          {
            $set: {
              "jobs.$[d].status": "rejected",
            },
          },
          {
            arrayFilters: [
              {
                "d.job": ObjectID(job),
              },
            ],
          }
        );
      let res = {
        updated: true,
      };
      resolve(res);
    });
  },

  checkIfconfirmed: (applicant) => {
    return new Promise(async (resolve, reject) => {
      let result = await db
        .get()
        .collection(appliedJobs)
        .aggregate([
          {
            $match: {
              userid: ObjectID(applicant),
            },
          },
          {
            $match: {
              jobs: {
                $elemMatch: {
                  status: "applied",
                },
              },
            },
          },
          {
            $project: {
              status: 1,
            },
          },
        ])
        .toArray();
      console.log("jsda", result);
    });
  },

  resolveJob: (id) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(JOB_COLLECTION)
        .remove({ _id: ObjectID(id) })
        .then((reult) => {
          resolve(reult);
        });
    });
  },

  getAllUsers: () => {
    return new Promise((resolve, reject) => {
      db.get()
        .collection(USER_COLLECTION)
        .find({ type: "employee" })
        .toArray()
        .then((usrs) => {
          resolve(usrs);
        });
    });
  },

//   manageApplications: (id) => {
//     console.log("id is ", id);
//     return new Promise(async (resolve, reject) => {
//       let result = await db
//         .get()
//         .collection(JOB_COLLECTION)
//         .aggregate([
//           {
//             $match: {
//               recruiter: id,
//             },
//           }
//       console.log("$", result);
//     });
//   },
};
