import { NextAuthOptions } from 'next-auth';
import TwitterProvider from 'next-auth/providers/twitter';

export const authOptions: NextAuthOptions = {
  providers: [
    TwitterProvider({
      clientId: process.env.TWITTER_CLIENT_ID || '',
      clientSecret: process.env.TWITTER_CLIENT_SECRET || '',
      version: '2.0', // Use Twitter OAuth 2.0
      authorization: {
        params: {
          scope: 'users.read tweet.read follows.read offline.access',
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      // Save Twitter username, ID, and access token
      if (account && profile) {
        token.twitterUsername = (profile as any).data?.username;
        token.twitterId = (profile as any).data?.id;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
      }
      return token;
    },
    async session({ session, token }) {
      // Add Twitter info to session
      if (session.user) {
        (session.user as any).twitterUsername = token.twitterUsername;
        (session.user as any).twitterId = token.twitterId;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: '/',
  },
};
