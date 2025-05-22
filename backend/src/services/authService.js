import passport from 'passport'
import {Strategy as GoogleStrategy} from 'passport-google-oauth20'
import { prisma } from '../config/db.js'
import dotenv from 'dotenv'

dotenv.config()

passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: "http://localhost:5000/auth/google/callback", // Must match Google Console
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await prisma.user.findUnique({
            where: { providerId: profile.id }
          });
          if (!user) {
            user = await prisma.user.create({
              data: {
                name: profile.displayName,
                email: profile.emails?.[0].value || "",
                avatar: profile.photos?.[0].value,
                provider: "GOOGLE",
                providerId: profile.id,
              }
            });
          }
          return done(null, user);
        } catch (error) {
          return done(error, undefined);
        }
      }
    )
  );
  

passport.serializeUser((user,done)=>{
    done(null,user.id);
});

passport.deserializeUser(async (id,done)=>{
    try {
        const user = await prisma.user.findUnique({where:{id}})
        done(null,user);
    }
    catch(error){
        done(error,undefined);
    }
})