const userhelpers=require('../helpers/userHelper')
    
const passport=require('passport')
const auth =require('../routes/passport-setup')
const userhelper=require('../helpers/userHelper')

//google auth
    const {Strategy}=require('passport-google-oauth2');


    var GoogleStrategy = require( 'passport-google-oauth2' ).Strategy;
    
    passport.use(new GoogleStrategy({
        clientID:'966940822438-jbu4melp6u76ssa3j1qm3tp3sd0rn22q.apps.googleusercontent.com',
        clientSecret: '-lwKqqOBmCa9LVDNurl2pjML',
        callbackURL: 'http://localhost:3000/google/callback',
        passReqToCallback   : true
      },
     async function (request, accessToken, refreshToken, profile, done) {
    console.log("haskd");
    console.log("######",profile);
        let userdata={
            first_name:profile.given_name,
            last_name:profile.family_name,
            fullname:profile.displayName,
            email:profile.email,
            picture:profile.picture,
            
        }
await userhelper.doSignUp(userdata)
console.log("this is the profile and it is to be extracted",profile);
    return done(null,profile)


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
    
    
    


