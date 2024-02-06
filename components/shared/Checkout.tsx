import React, { useEffect } from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "../../lib/action/order.actions";

const initializeRazorpay = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";

    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };

    document.body.appendChild(script);
  });
};
const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  useEffect(() => {
    const makePayment = async () => {
      const res = await initializeRazorpay();

      if (!res) {
        alert("Razorpay SDK Failed to load");
        return;
      }

      // Make API call to the serverless API
      const data = await fetch("/api/razorpay", { method: "POST" }).then((t) =>
        t.json()
      );
      console.log(data);
      var options = {
        key: process.env.RAZORPAY_KEY, // Enter the Key ID generated from the Dashboard
        name: "Operant Scientific Private limited",
        currency: data.currency,
        amount: data.amount,
        order_id: data.id,
        description: "Thankyou for your test donation",
        image: "/assets/icons/logo.svg",
        handler: function (response: any) {
          // Validate payment at server - using webhooks is a better idea.
          alert(response.razorpay_payment_id);
          alert(response.razorpay_order_id);
          alert(response.razorpay_signature);
        },
        prefill: {
          name: "Ravindra ",
          email: "sirviravindra609@gmail.com",
          contact: "9999999999",
        },
      };

      // Add the Razorpay library as a script tag in the HTML file

      const paymentObject = new (window as any).Razorpay(options);
      paymentObject.open();
    };
    // Check to see if this is a redirect back from Checkout
    const query = new URLSearchParams(window.location.search);
    if (query.get("success")) {
      console.log("Order placed! You will receive an email confirmation.");
    }

    if (query.get("canceled")) {
      console.log(
        "Order canceled -- continue to shop around and checkout when you’re ready."
      );
    }
  }, []);

  const onCheckout = async () => {
    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    await checkoutOrder(order);
  };

  return (
    <form action={onCheckout} method="post">
      <Button type="submit" role="link" size="lg" className="button sm:w-fit">
        {event.isFree ? "Get Ticket" : "Buy Ticket"}
      </Button>
    </form>
  );
};

export default Checkout;
