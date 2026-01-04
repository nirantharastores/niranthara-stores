const axios = require("axios");

const sendWhatsAppMessage = async (orderData) => {
  const { customerName, phone, address, items, totalAmount } = orderData;

  const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "instance157767";
  const token = process.env.ULTRAMSG_TOKEN || "rjye1lzj1wv9cmr0";
  const adminPhone = "+919663423925"; // Your number

  // 1. Format the items list for the messages
  const itemsList = items.map((i) => `• ${i.name} (x${i.quantity})`).join("\n");

  // 2. Prepare the Admin Message (Detailed)
  const adminMessage = 
`*New Order Alert!* 🛍️
--------------------------
*Customer:* ${customerName}
*Phone:* ${phone}
*Address:* ${address}

*Items:*
${itemsList}

*Total:* ₹${totalAmount}
--------------------------`;

  // 3. Prepare the Customer Message (Friendly)
  const customerMessage = 
`Hi *${customerName}*, your order at *Niranthara Stores* is confirmed! ✅

*Total Amount:* ₹${totalAmount}
*Delivery to:* ${address}

We are preparing your fresh items now. Thank you for shopping with us! 🙏`;

  try {
    // SEND TO ADMIN
    const adminRes = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      token: token,
      to: adminPhone,
      body: adminMessage
    });

    // SEND TO CUSTOMER
    const customerRes = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      token: token,
      to: phone, // This is the customer's number from the order
      body: customerMessage
    });

    console.log("✅ Both WhatsApp notifications sent successfully!");
    return { admin: adminRes.data, customer: customerRes.data };

  } catch (error) {
    console.error("❌ WhatsApp Error:", error.response?.data || error.message);
    // We don't throw error here so the customer's order flow isn't blocked 
    // if the WhatsApp API has a temporary hiccup.
  }
};

const sendOTPMessage = async (phone, otp) => {
  const instanceId = process.env.ULTRAMSG_INSTANCE_ID || "instance157767";
  const token = process.env.ULTRAMSG_TOKEN || "rjye1lzj1wv9cmr0";

  const otpMessage = `Your *Niranthara Stores* verification code is: *${otp}* 🛡️\n\nPlease enter this code on the website to confirm your order.`;

  try {
    const res = await axios.post(`https://api.ultramsg.com/${instanceId}/messages/chat`, {
      token: token,
      to: phone,
      body: otpMessage
    });
    console.log(`✅ OTP sent to ${phone}`);
    return res.data;
  } catch (error) {
    console.error("❌ OTP WhatsApp Error:", error.response?.data || error.message);
    throw new Error("Failed to send OTP via WhatsApp");
  }
};

module.exports = { sendWhatsAppMessage, sendOTPMessage };