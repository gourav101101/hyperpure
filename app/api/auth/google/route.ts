import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import User from "@/models/User";
import jwt from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const { idToken, email, name } = await req.json();
    
    if (!email) {
      return NextResponse.json({ error: "Email required" }, { status: 400 });
    }
    
    await dbConnect();
    
    let user = await User.findOne({ email });
    
    if (!user) {
      user = await User.create({
        email,
        name,
        role: "buyer"
      });
    }
    
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email, role: user.role },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "7d" }
    );
    
    const res = NextResponse.json({ 
      success: true, 
      user: {
        _id: user._id.toString(),
        email: user.email,
        name: user.name,
        role: user.role
      },
      token
    });
    
    res.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7
    });
    
    return res;
  } catch (error) {
    console.error("Google auth error:", error);
    return NextResponse.json({ error: "Sign-in failed" }, { status: 500 });
  }
}
