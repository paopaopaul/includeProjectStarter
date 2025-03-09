// app/api/fastgpt/route.js
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { userInput } = body;

    if (!userInput || typeof userInput !== 'string') {
      return NextResponse.json(
        { error: 'Invalid input. Please provide a valid userInput.' },
        { status: 400 }
      );
    }

    // FastGPT API configuration
    const apiKey = process.env.FASTGPT_API_KEY;
    // This should be your AppId from FastGPT
    const appId = process.env.FASTGPT_APP_ID;
    // FastGPT API URL (check if this matches your BaseURL in the docs)
    const apiUrl =
      process.env.FASTGPT_API_URL ||
      'https://api.fastgpt.in/api/v1/chat/completions';

    if (!apiKey || !appId) {
      console.error('FastGPT API key or AppId is not configured');
      return NextResponse.json(
        {
          error:
            'API configuration error. Please check your environment variables.',
        },
        { status: 500 }
      );
    }

    console.log('Calling FastGPT API with:', { appId, apiUrl });

    // Prepare the request for FastGPT based on their API documentation
    const requestBody = {
      chatId: `web-${Date.now()}`, // Create a unique chatId
      stream: false,
      detail: false,
      messages: [
        {
          content: userInput,
          role: 'user',
        },
      ],
    };

    console.log('Request to FastGPT:', JSON.stringify(requestBody));

    // Call FastGPT API
    const fastgptResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!fastgptResponse.ok) {
      let errorText = '';
      try {
        errorText = await fastgptResponse.text();
      } catch (e) {
        errorText = 'Could not retrieve error details';
      }

      console.error('FastGPT API error:', errorText);
      console.error('Status:', fastgptResponse.status);
      console.error('Status Text:', fastgptResponse.statusText);

      return NextResponse.json(
        {
          error: `FastGPT API error: ${fastgptResponse.status}`,
          details: errorText,
          url: apiUrl,
        },
        { status: fastgptResponse.status }
      );
    }

    const data = await fastgptResponse.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in FastGPT API route:', error.message);
    console.error('Stack:', error.stack);

    return NextResponse.json(
      { error: `An unexpected error occurred: ${error.message}` },
      { status: 500 }
    );
  }
}
