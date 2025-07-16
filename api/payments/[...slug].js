// LIVE M-Pesa API route for real payments - PROCESSES ACTUAL MONEY
import https from "https";

// Live M-Pesa credentials - REQUIRED for production
const MPESA_CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY;
const MPESA_CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET;
const MPESA_PASSKEY = process.env.MPESA_PASSKEY;
const MPESA_SHORT_CODE = process.env.MPESA_SHORT_CODE || "174379";
const MPESA_BUSINESS_PHONE = "254746013145"; // Your business number

// In-memory storage for payments (use database in production)
const activePayments = new Map();

export default async function handler(req, res) {
  const { slug } = req.query;
  const path = Array.isArray(slug) ? slug.join("/") : slug;

  // Enable CORS
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,OPTIONS,PATCH,DELETE,POST,PUT",
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  try {
    // Handle M-Pesa payment routes
    if (path === "mpesa/initiate") {
      // LIVE Payment initiation
      const { phoneNumber, amount, customerId, customerName, mealId } =
        req.body;

      console.log(`💰 LIVE M-PESA PAYMENT REQUEST:`);
      console.log(`   Customer: ${customerName}`);
      console.log(`   Phone: ${phoneNumber}`);
      console.log(`   Amount: KSH ${amount}`);
      console.log(`   ⚠️  REAL MONEY WILL BE CHARGED!`);

      // Validate credentials
      if (!MPESA_CONSUMER_KEY || !MPESA_CONSUMER_SECRET || !MPESA_PASSKEY) {
        return res.status(500).json({
          success: false,
          message: "M-Pesa credentials not configured. Contact administrator.",
        });
      }

      // Validate inputs
      if (!phoneNumber || !amount) {
        return res.status(400).json({
          success: false,
          message: "Phone number and amount are required",
        });
      }

      try {
        // Get M-Pesa access token
        const accessToken = await getMpesaAccessToken();

        // Initiate STK Push
        const stkResult = await initiateMpesaSTKPush(
          accessToken,
          phoneNumber,
          amount,
          `ORDER_${mealId || Date.now()}`,
          `Payment for ${customerName || "Customer"}`,
        );

        if (stkResult.success) {
          // Store payment info
          activePayments.set(stkResult.data.CheckoutRequestID, {
            phoneNumber,
            amount,
            customerId,
            customerName,
            mealId,
            status: "pending",
            timestamp: Date.now(),
          });

          console.log(`✅ LIVE payment request sent successfully`);
          console.log(`💸 Customer will be charged KSH ${amount}`);

          res.json({
            success: true,
            data: {
              checkoutRequestId: stkResult.data.CheckoutRequestID,
              merchantRequestId: stkResult.data.MerchantRequestID,
              customerMessage:
                stkResult.data.CustomerMessage ||
                "Payment request sent to your phone. Enter your M-Pesa PIN to complete.",
              amount: amount,
              phoneNumber: phoneNumber,
              mode: "LIVE",
            },
          });
        } else {
          res.status(400).json({
            success: false,
            message: stkResult.error || "Failed to initiate payment",
          });
        }
      } catch (error) {
        console.error("M-Pesa initiation error:", error);
        res.status(500).json({
          success: false,
          message: "Payment service error",
          error: error.message,
        });
      }
    } else if (path.startsWith("mpesa/status/")) {
      // LIVE Payment status check
      const checkoutRequestId = path.split("/")[2];

      console.log(`🔍 Checking LIVE payment status: ${checkoutRequestId}`);

      try {
        // Get M-Pesa access token
        const accessToken = await getMpesaAccessToken();

        // Query payment status
        const statusResult = await queryMpesaSTKStatus(
          accessToken,
          checkoutRequestId,
        );

        if (statusResult.success) {
          // Update stored payment
          const payment = activePayments.get(checkoutRequestId);
          if (payment) {
            payment.status = statusResult.data.status;
            payment.resultDesc = statusResult.data.ResultDesc;
            if (statusResult.data.mpesaReceiptNumber) {
              payment.mpesaReceiptNumber = statusResult.data.mpesaReceiptNumber;
            }
            activePayments.set(checkoutRequestId, payment);
          }

          res.json({
            success: true,
            data: statusResult.data,
          });
        } else {
          res.status(500).json({
            success: false,
            message: "Failed to check payment status",
          });
        }
      } catch (error) {
        console.error("M-Pesa status check error:", error);
        res.status(500).json({
          success: false,
          message: "Status check error",
          error: error.message,
        });
      }
    } else if (path === "mpesa/callback") {
      // M-Pesa callback handler
      console.log("📞 Processing M-Pesa callback:", req.body);

      const callbackData = req.body;
      const stkCallback = callbackData?.Body?.stkCallback;

      if (stkCallback) {
        const checkoutRequestId = stkCallback.CheckoutRequestID;
        const resultCode = stkCallback.ResultCode;

        const payment = activePayments.get(checkoutRequestId);
        if (payment) {
          if (resultCode === 0) {
            payment.status = "completed";
            console.log(`🎉 Payment completed: ${checkoutRequestId}`);
          } else {
            payment.status = "failed";
            console.log(`❌ Payment failed: ${checkoutRequestId}`);
          }
          activePayments.set(checkoutRequestId, payment);
        }
      }

      res.status(200).json({ ResultCode: 0, ResultDesc: "Success" });
    } else {
      res.status(404).json({ success: false, message: "Route not found" });
    }
  } catch (error) {
    console.error("API Error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
}

// Get M-Pesa OAuth access token
async function getMpesaAccessToken() {
  const auth = Buffer.from(
    `${MPESA_CONSUMER_KEY}:${MPESA_CONSUMER_SECRET}`,
  ).toString("base64");

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.safaricom.co.ke",
      port: 443,
      path: "/oauth/v1/generate?grant_type=client_credentials",
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.access_token) {
            resolve(response.access_token);
          } else {
            reject(new Error("No access token received"));
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.end();
  });
}

// Initiate M-Pesa STK Push
async function initiateMpesaSTKPush(
  accessToken,
  phoneNumber,
  amount,
  accountReference,
  transactionDesc,
) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
  const password = Buffer.from(
    `${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");

  // Format phone number
  let formattedPhone = phoneNumber.replace(/\D/g, "");
  if (formattedPhone.startsWith("0")) {
    formattedPhone = "254" + formattedPhone.substring(1);
  } else if (!formattedPhone.startsWith("254")) {
    formattedPhone = "254" + formattedPhone;
  }

  const requestBody = {
    BusinessShortCode: MPESA_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: "CustomerPayBillOnline",
    Amount: Math.round(amount * 100), // Convert to cents
    PartyA: formattedPhone,
    PartyB: MPESA_SHORT_CODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${process.env.VERCEL_URL || "https://your-domain.vercel.app"}/api/payments/mpesa/callback`,
    AccountReference: accountReference,
    TransactionDesc: transactionDesc,
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.safaricom.co.ke",
      port: 443,
      path: "/mpesa/stkpush/v1/processrequest",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);
          if (response.ResponseCode === "0") {
            resolve({ success: true, data: response });
          } else {
            resolve({
              success: false,
              error: response.ResponseDescription,
            });
          }
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}

// Query M-Pesa STK Push status
async function queryMpesaSTKStatus(accessToken, checkoutRequestId) {
  const timestamp = new Date()
    .toISOString()
    .replace(/[^0-9]/g, "")
    .slice(0, -3);
  const password = Buffer.from(
    `${MPESA_SHORT_CODE}${MPESA_PASSKEY}${timestamp}`,
  ).toString("base64");

  const requestBody = {
    BusinessShortCode: MPESA_SHORT_CODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: "api.safaricom.co.ke",
      port: 443,
      path: "/mpesa/stkpushquery/v1/query",
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
    };

    const req = https.request(options, (res) => {
      let data = "";
      res.on("data", (chunk) => (data += chunk));
      res.on("end", () => {
        try {
          const response = JSON.parse(data);

          let status = "pending";
          if (response.ResultCode === "0") {
            status = "completed";
          } else if (response.ResultCode === "1032") {
            status = "cancelled";
          } else if (response.ResultCode === "1037") {
            status = "timeout";
          } else if (response.ResultCode) {
            status = "failed";
          }

          resolve({
            success: true,
            data: {
              status: status,
              ResultCode: response.ResultCode,
              ResultDesc: response.ResultDesc,
              CheckoutRequestID: checkoutRequestId,
              mpesaReceiptNumber: response.MpesaReceiptNumber,
              amount: response.Amount,
            },
          });
        } catch (error) {
          reject(error);
        }
      });
    });

    req.on("error", reject);
    req.write(JSON.stringify(requestBody));
    req.end();
  });
}
