import dbConnect from "@/lib/dbConnect";
import UserModel from "@/model/User";
import { Message } from "@/model/User";

export async function POST(request:Request){
    await dbConnect();

    const {username,content}=await request.json()
    try {
        const user=await UserModel.findOne({username})
        if(!user){
            return Response.json(
              { message: "user not found", success: false },
              { status: 404 }
            );
  
        }

        //is user accepting messages
        if(!user.isAcceptingMessage){
            return Response.json(
                {
                    success:false,
                    message:"user is not accepting the messages"
                }
                ,{
                    status:403
                }
            )
        }

        const newMessage={content,createdAt:new Date()}
        user.messages.push(newMessage as Message)
        await user.save()
        
        return Response.json(
                {
                    success:true,
                    message:"message sent successfully"
                }
                ,{
                    status:200
                }
            )

    } catch (error) {
    console.error('Error adding message:', error);
    return Response.json(
      { message: 'Internal server error', success: false },
      { status: 500 }
    );
  }
}