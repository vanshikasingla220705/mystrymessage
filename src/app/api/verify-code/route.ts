import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { success } from "zod";

export async function POST(request:Request){
    await dbConnect()
    try {
        const {username,code}=await request.json()
        const decodedUsername=decodeURIComponent(username)
        const user=await UserModel.findOne(({username:decodedUsername}))
        if(!user){
            return Response.json(
                {
                    success:false,
                    message:"error verigying user"
                },
                {
                    status:500
                }
            )
        }

        const isCodeValid=user.verifyCode===code
        const isCodeNotExpired=new Date(user.verifyCodeExpiry)>new Date()

        if(isCodeValid && isCodeNotExpired){
            user.isVerified=true
            await user.save()
            return Response.json(
                {
                    success:true,
                    message:"account verified successfully"
                },
                {
                    status:200
                }
            )
        }

        else if(!isCodeNotExpired){
            return Response.json(
                {
                    success:false,
                    message:"verification code expired please sign up again"
                },
                {
                    status:400
                }
            )
        }

        else{
            return Response.json(
                {
                    success:false,
                    message:"incorrect verification code"
                },
                {
                    status:200
                }
            )
        }

    } catch (error) {
        console.error("error verifying user",error)
        return Response.json(
            {
                success:false,
                message:"error verifying user"
            },
            {
                status:500
            }

        )
    }
}