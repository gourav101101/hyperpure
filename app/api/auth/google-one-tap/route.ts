import { NextRequest, NextResponse } from "next/server";
import { signIn } from "next-auth/react";

export async function POST(req: NextRequest) {
  try {
    const { credential } = await req.json();
    
    // Verify the credential with Google
    const response = await fetch(
      `https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`
    );
    
    if (!response.ok) {
      return NextResponse.json({ error: "Invalid credential" }, { status: 400 });
    }
    
    const data = await response.json();
    
    // Sign in with NextAuth
    await signIn("google", {
      credential,
      redirect: false,
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}
