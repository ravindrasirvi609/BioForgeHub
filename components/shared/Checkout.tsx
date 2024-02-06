import React, { useEffect } from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "../../lib/action/order.actions";

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
  useEffect(() => {
    const makePayment = async () => {
      try {
        const res = await initializeRazorpay();

        if (!res) {
          alert("Razorpay SDK Failed to load");
          return;
        }

        const data = await fetch("/api/razorpay", { method: "POST" }).then((t) =>
          t.json()
        );
        console.log(data);
        var options = {
          key: process.env.RAZORPAY_KEY,
          name: "Operant Scientific Private limited",
          currency: data.currency,
          amount: data.amount,
          order_id: data.id,
          description: "Thank you for your test donation",
          image: "/assets/icons/logo.svg",
          handler: function (response: any) {
            alert(response.razorpay_payment_id);
            alert(response.razorpay_order_id);
            alert(response.razorpay_signature);
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
      }
    };

    makePayment();
  }, []);

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
      await checkoutOrder(order);
    } catch (error) {
      console.error("Error checking out:", error);
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
