// src/app/api/setup-api-key/route.ts
// Note: Changed from page.ts to route.ts

import { NextRequest, NextResponse } from 'next/server';
import { auth, encryptApiKey } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    // Get the current session
    const session = await auth();
    
    // Check if user is authenticated
    if (!session || !session.user || !session.user.id) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Parse the request body
    const body = await request.json();
    const { apiKey, serviceName } = body;

    // Validate inputs
    if (!apiKey || typeof apiKey !== 'string') {
      return NextResponse.json({ message: 'Invalid API key provided' }, { status: 400 });
    }
    
    if (!serviceName || typeof serviceName !== 'string') {
      return NextResponse.json({ message: 'Invalid service name provided' }, { status: 400 });
    }

    // Encrypt the API key
    const encryptedApiKey = encryptApiKey(apiKey);
    
    // Update the user's API key in the database
    const { error } = await supabase
      .from('users')
      .update({ encrypted_api_key: encryptedApiKey })
      .eq('id', session.user.id);

    if (error) {
      console.error('Error saving API key:', error);
      return NextResponse.json({ message: 'Failed to save API key' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API key setup error:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// Handle other HTTP methods
export function GET() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export function PUT() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}

export function DELETE() {
  return NextResponse.json({ message: 'Method not allowed' }, { status: 405 });
}