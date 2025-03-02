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

    // FastGPT API configuration - update with your specific workflow ID from your DivinAI workflow
    const workflowId =
      process.env.FASTGPT_WORKFLOW_ID || '677cd3109c52479ad3f31c3a'; // Default to your workflow ID
    const apiUrl =
      process.env.FASTGPT_API_URL ||
      'https://api.fastgpt.com/api/v1/chat/completions';
    const apiKey = process.env.FASTGPT_API_KEY;

    console.log('Using API URL:', apiUrl);
    console.log('Using workflow ID:', workflowId);

    if (!apiKey) {
      console.error('FastGPT API key is not configured');
      return NextResponse.json(
        { error: 'API configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    // Prepare the request for FastGPT with the specific workflow
    const requestBody = {
      appId: workflowId, // This should be your DivinAI workflow ID
      messages: [{ role: 'user', content: userInput }],
      stream: false, // Set to true if you want streaming responses
    };

    console.log('Request to FastGPT:', JSON.stringify(requestBody));

    // Call FastGPT API
    const fastgptResponse = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
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
