import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
// import connectToDatabase from "@/pages/utils/db";
// import User from "@/pages/models/User";

export default NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async signIn() {
      return true;
    },
    async session({session, token}) {
      return session;
    },
  },
});