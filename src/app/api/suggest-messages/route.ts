import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';
import { NextResponse } from 'next/server';

// Allow streaming responses up to 30 seconds
// export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    // Try to read prompt from request body
    let body;
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const prompt: string =
      body.prompt ??
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    // Call the model with just one prompt
    const result = streamText({
      model: openai('gpt-4o'),
      messages: [
        {
          role: 'user',
          content: prompt,
        },
      ],
    });

    // Return the streaming response
    return result.toTextStreamResponse();

  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json(
        { name: error.name, message: error.message },
        { status: 500 }
      );
    } else {
      console.error('An unexpected error occurred:', error);
      throw error;
    }
  }
}
