import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { db } from '../../../firebaseAdminConfig'; // Ensure this path is correct

// Export POST as a named export
export async function POST(req: NextRequest) {
  try {
    // Generate a unique 6-digit code avoiding ambiguous characters
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ";
    let gameId = "";
    for (let i = 0; i < 6; i++) {
      gameId += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    // Firebase path
    const gameRef = db.ref(`games/${gameId}`);

    // Extract data from request body
    const requestData = await req.json();
    // Use the requestData in place of the static 'hello'

    await gameRef.set(requestData);

    return new NextResponse(JSON.stringify({ message: "Game created", gameId, data: requestData }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: "Failed to create game", error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}


// Export GET as a named export
export async function GET(req: NextRequest) {
  const gameId = req.nextUrl.searchParams.get('gameId');

  if (!gameId || !/^[ABCDEFGHJKLMNPQRSTUVWXYZ]{6}$/.test(gameId)) {
    return new NextResponse(JSON.stringify({ message: "Invalid game ID provided" }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  try {
    // Firebase path
    const gameRef = db.ref(`games/${gameId}`);
    const snapshot = await gameRef.get();

    if (snapshot.exists()) {
      return new NextResponse(JSON.stringify({ gameId, data: snapshot.val() }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    } else {
      return new NextResponse(JSON.stringify({ message: "Game not found" }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    }
  } catch (error: any) {
    return new NextResponse(JSON.stringify({ message: "Failed to retrieve game", error: error.message }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
}