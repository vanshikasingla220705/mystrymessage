import { NextAuthOptions ,RequestInternal,User} from "next-auth";   
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import dbConnect from "@/lib/dbConnect";
import UserModel ,{ User as UserModelType } from "@/model/User";


export const authOptions:NextAuthOptions={
    providers:[
        CredentialsProvider({
            id: "credentials",
            name: "Credentials",
            credentials:{
                identifier: { label: "Email", type: "text " },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials: Record<"identifier" | "password", string> | undefined, req: Pick<RequestInternal, "body" | "query" | "headers" | "method">) : Promise<User | null> {
                await dbConnect()
                if (!credentials) {
                    return null;
                }
                try {
                    const user:any=await UserModel.findOne({
                        $or:[
                            {email:credentials.identifier},
                            {username:credentials.identifier}
                        ]
                    })
                    if(!user){
                        throw new Error('no user found with this email')
                    }
                    if(!user.isVerified){
                        throw new Error('please verify your account before login')
                    }
                    const isPasswordCorrect=await bcrypt.compare(credentials.password,user.password)
                    if(!isPasswordCorrect){
                        throw new Error('incorrect password')
                        
                    }
                    else{
                      return{ id: user._id.to_string(),
            email: user.email,
            username: user.username,
            isVerified: user.isVerified,
            isAcceptingMessages: user.isAcceptingMessage}
                    }
                } catch (err:unknown) {
                    if (err instanceof Error) {
                    // Re-throw the specific error message (e.g., 'incorrect password')
                    throw new Error(err.message);
                    } else {
                     // Fallback for unknown error types
                    throw new Error('An unknown error occurred during login');
                    }
                }
            },
        })
    ],

    callbacks: {
        async session({ session, token }) {
            if(token){
                session.user._id=token._id
                session.user.isVerified=token.isVerified
                session.user.isAcceptingMessages=token.isAcceptingMessages
                session.user.username=token.username
            }
            return session
        },
        async jwt({ token, user }) {
            if(user){
                token._id=user._id?.toString();
                token.isVerified=user.isVerified;
                token.isAcceptingMessages=user.isAcceptingMessages;
                token.username=user.username
            }
            return token
        }
    },

    pages:{
        signIn:'/sign-in'
    },
    session:{
        strategy:"jwt"
    },
    secret:process.env.NEXTAUTH_SECRET,


}