import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import connectToDatabase from "@/pages/utils/db";
import User from "@/pages/models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      await connectToDatabase();

      const existingUser = await User.findOne({ email: user.email });
      console.log("existing user found", existingUser);
      if (!existingUser) {
        await User.create({
          googleId: profile.sub,
          name: user.name,
          email: user.email,
          avatar: user.image,
        });
        console.log("new user created");
      }

      return true;
    },
    async session({ session, token }) {
      const dbUser = await User.findOne({ email: session.user.email });
      session.user.id = dbUser._id;
      return session;
    },
  },
});
