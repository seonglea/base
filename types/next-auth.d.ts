import { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      twitterUsername?: string;
      twitterId?: string;
    } & DefaultSession['user'];
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    twitterUsername?: string;
    twitterId?: string;
  }
}
