import { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0', // Use Twitter OAuth 2.0
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Save Twitter username and ID to token
      if (account && profile) {
        token.twitterUsername = (profile as any).data?.username;
        token.twitterId = (profile as any).data?.id;
      }
      return token;
    },
    async session({ session, token }) {
      // Add Twitter info to session
      if (session.user) {
        (session.user as any).twitterUsername = token.twitterUsername;
        (session.user as any).twitterId = token.twitterId;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};
