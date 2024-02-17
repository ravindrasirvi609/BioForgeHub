import React, { useEffect, useState } from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "../../lib/action/order.actions";
import axios from "axios";

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const [paymentInitialized, setPaymentInitialized] = useState(false);

  const [error, setError] = useState<null | string>(null);

  useEffect(() => {
    initializeRazorpay();
  }, []);

  // Load the Razorpay script when the component mounts

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

    if (!paymentInitialized) {
      setError("Payment gateway is not available at the moment");
      return;
    }
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    try {
      const payload = {
        amount: Number(event.price),
        currency: "INR",
        payment_capture: 1,
      };

      const response = await axios.post("/api/razorpay", payload);

      if (!response) {
        throw new Error("API request failed");
      }

      const data = await response.data;
      console.log("data: " + JSON.stringify(data));

      const options = {
        key: process.env.RAZORPAY_KEY, // Replace with your actual Razorpay key
        name: "Operant Pharmacy Federation",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id, // Use order ID from response
        description: "Thank you for your test donation",
        image: "/assets/icons/logo.svg", // Replace with your logo URL
        handler: function (response: any) {
          // Handle payment success
          console.log("Payment successful:", response);
          // Handle your own success logic here, e.g., update order status
        },
        prefill: {
          name: "Your Name", // Replace with user input or dynamic values
          email: "your@email.com", // Replace with user input or dynamic values
          contact: "1234567890", // Replace with user input or dynamic values
        },
      };

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    } catch (error: any) {
      console.error("Error making payment:", error);
      // Handle errors gracefully, e.g., display an error message to the user
    }
  };

  return (
    <form onSubmit={onCheckout}>
      {paymentInitialized && (
        <Button type="submit" role="link" size="lg" className="button sm:w-fit">
          {event.isFree ? "Get Ticket" : "Buy Ticket"}
        </Button>
      )}
    </form>
  );
};

export default Checkout;
