import NextAuth from "next-auth";
import bcrypt from "bcryptjs";
import credentials from "next-auth/providers/credentials";
import { getUser } from "@/actions/users";

export const { handlers, signIn, signOut, auth } = NextAuth({
    providers: [
        credentials({
            name: "username",
            credentials: {
                username: {
                    label: "username",
                    type: "text",
                    placeholder: "Enter your username",
                },
                password: {
                    label: "password",
                    type: "text",
                    placeholder: "Enter your password",
                },
            },

            async authorize(credentials) {
                const user = await getUser(credentials.username as string);
                const isPasswordValid = await bcrypt.compare(credentials.password as string, user?.password || "");

                if (user && isPasswordValid) {
                    return user;
                }

                return null;
            },
        }),
    ],
    callbacks: {
        /* eslint-disable @typescript-eslint/no-explicit-any */

        jwt: ({ token, user }: { user: any; token: any }) => {
            if (user && user.username) token.username = user.username;

            return token;
        },
        session: ({ token, session }) => {
            session.user.name = token.username as string;
            return session;
        },
    },
    pages: {
        signIn: "/login",
    },
    secret: process.env.AUTH_SECRET,
});
