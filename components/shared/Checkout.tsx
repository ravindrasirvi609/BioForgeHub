import React, { useEffect, useState } from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { createOrder } from "../../lib/action/order.actions";
import axios from "axios";
import { CreateOrderParams } from "../../types";
import { Button } from "../ui/button";

interface CheckoutProps {
  event: IEvent;
  userId: string;
}

const Checkout: React.FC<CheckoutProps> = ({ event, userId }) => {
  const [paymentInitialized, setPaymentInitialized] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    initializeRazorpay();
  }, []);

  const initializeRazorpay = () => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => {
      setPaymentInitialized(true);
    };
    script.onerror = () => {
      setPaymentInitialized(false);
    };
    document.body.appendChild(script);
  };

  const onCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (event.isFree) {
      alert("Successfully Joining the Confirmation Event");
      const order = {
        razorpayId: "FREE",
        totalAmount: 0,
        currency: "INR",
        eventId: event._id,
        buyerId: userId,
        createdAt: new Date(),
        status: "success",
      };
      console.log("Order:", order);

      const newOrder = await createOrder(order);
      return;
    }

    if (!paymentInitialized) {
      setError("Payment gateway is not available at the moment");
      return;
    }

    try {
      const payload = {
        amount: Number(event.price),
        currency: "INR",
        payment_capture: 1,
      };

      const response = await axios.post("/api/razorpay", payload);

      if (!response.data) {
        throw new Error("API request failed");
      }

      const data = response.data;

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "", // Replace with your actual Razorpay key
        name: "Operant Pharmacy Federation",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "Thank you for your test donation",
        image: "/assets/icons/logo.svg",
        handler: async (response: any) => {
          const order = {
            razorpayId: response.razorpay_payment_id,
            orderId: response.razorpay_order_id,
            signature: response.razorpay_signature,
            totalAmount: data.amount,
            currency: data.currency,
            eventId: event._id,
            buyerId: userId,
            createdAt: new Date(),
            status: "success",
          };
          console.log("Order:", order);

          const newOrder = await createOrder(order);
          console.log("Order created:", newOrder);
        },
        prefill: {
          name: "Your Name",
          email: "your@email.com",
          contact: "1234567890",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error making payment:", error);
      setError("Error processing payment. Please try again later.");
    }
  };

  return (
    <form onSubmit={onCheckout}>
      {paymentInitialized && (
        <Button type="submit" role="link" size="lg" className="button sm:w-fit">
          {event.isFree ? "Get Ticket" : "Buy Ticket"}
        </Button>
      )}
      {error && <p>{error}</p>}
    </form>
  );
};

export default Checkout;
