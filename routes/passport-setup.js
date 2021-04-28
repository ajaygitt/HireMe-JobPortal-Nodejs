const userhelpers=require('../Controllers/userHelper')
    
const passport=require('passport')
const auth =require('../routes/passport-setup')
const userhelper=require('../Controllers/userHelper')

const app = require('../app');

//google auth
    const {Strategy}=require('passport-google-oauth2');

    var LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
    var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
    
    passport.use(new GoogleStrategy({
        clientID:'966940822438-jbu4melp6u76ssa3j1qm3tp3sd0rn22q.apps.googleusercontent.com',
        clientSecret: '-lwKqqOBmCa9LVDNurl2pjML',
        callbackURL: 'http://localhost:3000/google/callback',
        passReqToCallback   : true
      },
     async function (request, accessToken, refreshToken, profile, done) {
   
        let userdata={
            first_name:profile.given_name,
            last_name:profile.family_name,
            fullname:profile.displayName,
            email:profile.email,
            picture:profile.picture,
            
        }
await userhelper.googleSignup(userdata).then((response)=>{



  return done(null,response,profile)
})



        // userhelper.findOrCreate({ googleId: profile.id }, function (err, user) {
       
        // });
      }
    ));
    
    passport.serializeUser(function(user,done){
    
        done(null,user)
    });
    
    
    passport.deserializeUser(function(user,done){
    
        done(null,user)
    });
    
    
    


//linkedin

passport.use(new LinkedInStrategy({
    clientID: "86jv8q0oesgohc",
    clientSecret: "AwEg5adWb5d33inR",
    callbackURL: "http://localhost:3000/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
  }, function(accessToken, refreshToken, profile, done) {
console.log("linkedin profile ##############",profile);

userhelper.doSignUp(userdata)
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's LinkedIn profile is returned to
      // represent the logged-in user. In a typical application, you would want
      // to associate the LinkedIn account with a user record in your database,
      // and return that user instead.
      return done(null, profile);
    });
  }));