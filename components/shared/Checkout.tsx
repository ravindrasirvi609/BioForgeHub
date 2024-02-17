import React, { useEffect } from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "../../lib/action/order.actions";
import axios from "axios";

const initializeRazorpay = () => {
  return new Promise((resolve, reject) => {
    try {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";

      script.onload = () => {
        resolve(true);
      };
      script.onerror = () => {
        resolve(false);
      };

      document.body.appendChild(script);
    } catch (error) {
      reject(error);
    }
  });
};

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const onCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    try {
      const payload = {
        amount: Number(event.price) * 100, // Convert to paisa
        currency: "INR",
        payment_capture: 1,
      };

      const response = await axios.post("/api/razorpay", payload);
      console.log("response", response);

      if (!response) {
        throw new Error("API request failed");
      }

      const data = await response.data;

      const options = {
        key: process.env.RAZORPAY_KEY,
        name: "Operant Scientific Private limited",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id, // Use order ID from response
        description: "Thank you for your test donation",
        image: "/assets/icons/logo.svg",
        handler: function (response: any) {
          // Handle payment success
          console.log("Payment successful:", response);
        },
        prefill: {
          name: "Ravindra",
          email: "sirviravindra609@gmail.com",
          contact: "9999999999",
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error making payment:", error);
      // Handle errors gracefully
    }
  };

  return (
    <form onSubmit={onCheckout}>
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? "Get Ticket" : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;