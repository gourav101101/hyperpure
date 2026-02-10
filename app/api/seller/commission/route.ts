import { NextRequest, NextResponse } from "next/server";
import dbConnect from "@/lib/mongodb";
import Commission from "@/models/Commission";

export async function GET(_req: NextRequest) {
  try {
    await dbConnect();
    let commission = await Commission.findOne({ isActive: true });
    if (!commission) {
      commission = await Commission.create({
        commissionRate: 10,
        deliveryFee: 30,
        useTierCommission: false,
        isActive: true
      });
    }
    return NextResponse.json(commission);
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch commission" }, { status: 500 });
  }
}
