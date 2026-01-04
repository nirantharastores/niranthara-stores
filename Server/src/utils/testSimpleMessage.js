const axios = require("axios");
require('dotenv').config();

async function testSimpleMessage() {
  try {
    const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

    // Test with the default "hello_world" template (no parameters needed)
    const payload = {
      messaging_product: "whatsapp",
      to: process.env.ADMIN_WHATSAPP,
      type: "template",
      template: {
        name: "hello_world",  // Default template, always available
        language: {
          code: "en_US"
        }
      }
    };

    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`
    };

    console.log("Testing with hello_world template...");
    console.log("Payload:", JSON.stringify(payload, null, 2));

    const resp = await axios.post(url, payload, { headers });
    console.log("✅ Success! Response:", resp.data);
    
  } catch (err) {
    console.error("❌ Error:", err.response?.data || err.message);
  }
}
module.exports = testSimpleMessage;
/*
```

**Run this test first!** If `hello_world` works, the issue is with your custom template.

### 2. **Check Your Template Structure**

The error often happens when:
- Template has **different number** of variables than parameters sent
- Variable placeholders don't match
- Template isn't approved yet

**Verify your template:**

Go to WhatsApp Manager → Message Templates → Find `order_alert`

Make sure it looks EXACTLY like this:
```
🔔 NEW ORDER RECEIVED!

👤 Customer: {{1}}
📞 Phone: {{2}}
📍 Address: {{3}}

🛒 Order Items:
{{4}}

💰 Total Amount: {{5}}

Please prepare the order for delivery.*/