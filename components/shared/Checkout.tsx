import React from "react";
import { IEvent } from "../../lib/database/models/event.model";
import { Button } from "../ui/button";
import { checkoutOrder } from "../../lib/action/order.actions";
import { createRazorpay } from "../../app/api/rozorpay/route";

const Checkout = ({ event, userId }: { event: IEvent; userId: string }) => {
  const onCheckout = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("event", event);

    const order = {
      eventTitle: event.title,
      eventId: event._id,
      price: event.price,
      isFree: event.isFree,
      buyerId: userId,
    };

    try {
      await checkoutOrder(order);

      const data = await createRazorpay(order)
      console.log(data);
      var options = {
        key: process.env.RAZORPAY_KEY,
        name: "Operant Scientific Private limited",
        currency: data.currency as string,
        amount: data.amount as number,
        order_id: data.id as string,
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
