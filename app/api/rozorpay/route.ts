import { NextResponse } from "next/server";
import Razorpay from "razorpay";
import { connectToDatabase } from "../../../lib/database";
import { handleError } from "../../../lib/utils";

export async function createRazorpay({ req }: any) {
  try {
    await connectToDatabase();

    const keyId = process.env.RAZORPAY_KEY ?? "";
    const requestBody = await req.json();

    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: process.env.RAZORPAY_SECRET,
    });

    const { payment_capture, amount, currency } = requestBody;

    const options = {
      amount: (amount * 100).toString(), // Razorpay expects amount in smallest currency unit (e.g., paisa)
      currency,
      payment_capture,
    };

    const response = await razorpay.orders.create(options);

    const data = {
      id: response.id,
      currency: response.currency,
      amount: response.amount,
    };

    return NextResponse.json(data);
  } catch (error) {
    handleError(error); // Handle errors appropriately
    return NextResponse.error(); // Fix: Remove the argument from the function call
  }
}
