const crypto = require("crypto");

export const verifySignature = (
  req: { body: any; headers: { [x: string]: any } },
  res: {
    status: (arg0: number) => {
      (): any;
      new (): any;
      json: { (arg0: { error: string }): void; new (): any };
    };
  },
  next: () => void
) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET; // Your webhook secret key

  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(JSON.stringify(req.body))
    .digest("hex");

  const clientSignature = req.headers["x-razorpay-signature"];

  if (expectedSignature === clientSignature) {
    next();
  } else {
    res.status(401).json({ error: "Invalid signature" });
  }
};
