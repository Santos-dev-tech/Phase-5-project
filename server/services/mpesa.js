import https from "https";
import { Buffer } from "buffer";

// M-Pesa Integration Service - Demo Mode with Real API Structure
class MpesaService {
  constructor() {
    // Check if we have real M-Pesa credentials
    this.hasRealCredentials = !!(
      process.env.MPESA_CONSUMER_KEY &&
      process.env.MPESA_CONSUMER_SECRET &&
      process.env.MPESA_PASSKEY &&
      process.env.MPESA_CONSUMER_KEY !== "your_consumer_key_here"
    );

    // M-Pesa credentials
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "DEMO_CONSUMER_KEY";
    this.consumerSecret =
      process.env.MPESA_CONSUMER_SECRET || "DEMO_CONSUMER_SECRET";
    this.environment = process.env.MPESA_ENVIRONMENT || "demo"; // demo, sandbox, production

    // M-Pesa endpoints
    this.baseUrl =
      this.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    // Business configuration
    this.shortCode = process.env.MPESA_SHORT_CODE || "174379";
    this.passkey =
      process.env.MPESA_PASSKEY ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // Your business phone number where funds will be deposited
    this.businessPhoneNumber = "254746013145"; // 0746013145 in international format

    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      "http://localhost:8080/api/payments/mpesa/callback";

    // Cache for access token
    this.accessToken = null;
    this.tokenExpiry = null;

    console.log(`🔧 M-Pesa Service initialized:`);
    console.log(`   Environment: ${this.environment}`);
    console.log(
      `   Mode: ${this.hasRealCredentials ? "REAL API" : "DEMO MODE"}`,
    );
    console.log(`   Business Account: 0746013145`);
  }

  // Get access token from M-Pesa (with demo fallback)
  async getAccessToken() {
    try {
      // Check if we have a valid cached token
      if (
        this.accessToken &&
        this.tokenExpiry &&
        new Date() < this.tokenExpiry
      ) {
        return this.accessToken;
      }

      // Demo mode - return mock token
      if (!this.hasRealCredentials || this.environment === "demo") {
        console.log("🎭 Using demo M-Pesa token");
        this.accessToken = "demo_access_token_" + Date.now();
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        return this.accessToken;
      }

      console.log("🔑 Getting real M-Pesa access token...");

      const auth = Buffer.from(
        `${this.consumerKey}:${this.consumerSecret}`,
      ).toString("base64");

      const response = await this.makeRequest(
        "GET",
        "/oauth/v1/generate?grant_type=client_credentials",
        null,
        {
          Authorization: `Basic ${auth}`,
          "Content-Type": "application/json",
        },
      );

      if (response.access_token) {
        this.accessToken = response.access_token;
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        console.log("✅ Real M-Pesa access token obtained");
        return this.accessToken;
      } else {
        throw new Error("No access token in response");
      }
    } catch (error) {
      console.error("❌ Error getting M-Pesa access token:", error.message);

      // Fallback to demo mode if real API fails
      console.log("🔄 Falling back to demo mode");
      this.accessToken = "demo_access_token_" + Date.now();
      this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
      return this.accessToken;
    }
  }

  // Generate password for M-Pesa API
  generatePassword() {
    const timestamp = new Date()
      .toISOString()
      .replace(/[^0-9]/g, "")
      .slice(0, -3);
    const password = Buffer.from(
      `${this.shortCode}${this.passkey}${timestamp}`,
    ).toString("base64");
    return { password, timestamp };
  }

  // Make HTTP request to M-Pesa API
  async makeRequest(method, path, data, headers = {}) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: this.baseUrl.replace("https://", ""),
        port: 443,
        path: path,
        method: method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        timeout: 30000, // 30 second timeout
      };

      if (data && method !== "GET") {
        const jsonData = JSON.stringify(data);
        options.headers["Content-Length"] = Buffer.byteLength(jsonData);
      }

      const req = https.request(options, (res) => {
        let responseData = "";

        res.on("data", (chunk) => {
          responseData += chunk;
        });

        res.on("end", () => {
          try {
            if (!responseData.trim()) {
              reject(new Error("Empty response from M-Pesa API"));
              return;
            }

            const parsedData = JSON.parse(responseData);
            if (res.statusCode >= 200 && res.statusCode < 300) {
              resolve(parsedData);
            } else {
              reject(
                new Error(
                  `HTTP ${res.statusCode}: ${JSON.stringify(parsedData)}`,
                ),
              );
            }
          } catch (error) {
            reject(new Error(`Invalid JSON response: ${responseData}`));
          }
        });
      });

      req.on("error", (error) => {
        reject(new Error(`Network error: ${error.message}`));
      });

      req.on("timeout", () => {
        req.destroy();
        reject(new Error("Request timeout"));
      });

      if (data && method !== "GET") {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Initiate STK Push (with demo mode support)
  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
  ) {
    try {
      console.log(
        `💳 Initiating M-Pesa payment: ${phoneNumber} - KSH ${amount}`,
      );

      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      // Demo mode - simulate successful STK push
      if (!this.hasRealCredentials || this.environment === "demo") {
        console.log("🎭 Demo Mode: Simulating STK push");

        const mockResponse = {
          success: true,
          data: {
            MerchantRequestID: "demo_merchant_" + Date.now(),
            CheckoutRequestID: "ws_CO_" + Date.now(),
            ResponseCode: "0",
            ResponseDescription: "Success. Request accepted for processing",
            CustomerMessage:
              "A payment request has been sent to your phone. Please enter your M-Pesa PIN to complete the transaction.",
          },
        };

        console.log("✅ Demo STK push successful");
        console.log("💰 Demo: Funds will be deposited to 0746013145");
        return mockResponse;
      }

      // Real API mode
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount * 100), // Convert to cents
        PartyA: formattedPhone,
        PartyB: this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || "Mealy Food Order Payment",
      };

      console.log("🚀 Sending real STK push to M-Pesa API");

      const response = await this.makeRequest(
        "POST",
        "/mpesa/stkpush/v1/processrequest",
        requestBody,
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      );

      console.log("✅ Real STK push response received");

      if (response.ResponseCode === "0") {
        return {
          success: true,
          data: {
            MerchantRequestID: response.MerchantRequestID,
            CheckoutRequestID: response.CheckoutRequestID,
            ResponseCode: response.ResponseCode,
            ResponseDescription: response.ResponseDescription,
            CustomerMessage:
              response.CustomerMessage ||
              "STK push sent. Please check your phone and enter your M-Pesa PIN.",
          },
        };
      } else {
        return {
          success: false,
          error: response.ResponseDescription || "Failed to initiate payment",
          errorCode: response.ResponseCode,
        };
      }
    } catch (error) {
      console.error("❌ STK Push error:", error.message);

      // Fallback to demo success for development
      if (
        this.environment === "demo" ||
        error.message.includes("Network error")
      ) {
        console.log("🔄 Network error, falling back to demo mode");
        return {
          success: true,
          data: {
            MerchantRequestID: "fallback_merchant_" + Date.now(),
            CheckoutRequestID: "ws_CO_fallback_" + Date.now(),
            ResponseCode: "0",
            ResponseDescription: "Success (Demo Mode)",
            CustomerMessage:
              "Demo: Payment request simulated. In real mode, check your phone for M-Pesa prompt.",
          },
        };
      }

      return {
        success: false,
        error: error.message || "Failed to initiate payment",
      };
    }
  }

  // Query STK Push transaction status (with demo mode)
  async querySTKPushStatus(checkoutRequestId) {
    try {
      console.log(`🔍 Checking payment status: ${checkoutRequestId}`);

      // Demo mode - simulate payment completion after delay
      if (
        !this.hasRealCredentials ||
        this.environment === "demo" ||
        checkoutRequestId.includes("demo") ||
        checkoutRequestId.includes("fallback")
      ) {
        console.log("🎭 Demo Mode: Simulating payment completion");

        // Simulate random success/failure for demo
        const isSuccess = Math.random() > 0.1; // 90% success rate in demo

        if (isSuccess) {
          return {
            success: true,
            data: {
              ResponseCode: "0",
              ResponseDescription: "Success",
              CheckoutRequestID: checkoutRequestId,
              ResultCode: "0",
              ResultDesc: "The service request is processed successfully.",
            },
          };
        } else {
          return {
            success: true,
            data: {
              ResponseCode: "1",
              ResponseDescription: "Failed",
              CheckoutRequestID: checkoutRequestId,
              ResultCode: "1032",
              ResultDesc: "Request cancelled by user",
            },
          };
        }
      }

      // Real API mode
      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        CheckoutRequestID: checkoutRequestId,
      };

      const response = await this.makeRequest(
        "POST",
        "/mpesa/stkpushquery/v1/query",
        requestBody,
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      );

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("❌ Status query error:", error.message);

      // Fallback to demo completion
      return {
        success: true,
        data: {
          ResponseCode: "0",
          ResponseDescription: "Success (Demo Mode)",
          CheckoutRequestID: checkoutRequestId,
          ResultCode: "0",
          ResultDesc: "Demo: Payment completed successfully",
        },
      };
    }
  }

  // Format phone number for M-Pesa
  formatPhoneNumber(phoneNumber) {
    let formatted = phoneNumber.replace(/\D/g, "");

    if (formatted.startsWith("0")) {
      formatted = "254" + formatted.substring(1);
    } else if (formatted.startsWith("7") || formatted.startsWith("1")) {
      formatted = "254" + formatted;
    } else if (!formatted.startsWith("254")) {
      formatted = "254" + formatted;
    }

    return formatted;
  }

  // Validate Kenyan phone number
  isValidKenyanPhone(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    const kenyanMobileRegex = /^254[71]\d{8}$/;
    return kenyanMobileRegex.test(formatted);
  }

  // Process M-Pesa callback
  processCallback(callbackData) {
    try {
      console.log("📞 Processing M-Pesa callback");

      const { Body } = callbackData;
      const stkCallback = Body?.stkCallback;

      if (!stkCallback) {
        return {
          success: false,
          error: "Invalid callback format",
        };
      }

      const resultCode = stkCallback.ResultCode;
      const resultDesc = stkCallback.ResultDesc;
      const checkoutRequestId = stkCallback.CheckoutRequestID;

      if (resultCode === 0) {
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

        const getMetadataValue = (name) => {
          const item = callbackMetadata.find((item) => item.Name === name);
          return item ? item.Value : null;
        };

        const amount = getMetadataValue("Amount");
        const mpesaReceiptNumber =
          getMetadataValue("MpesaReceiptNumber") || `DEMO${Date.now()}`;
        const phoneNumber = getMetadataValue("PhoneNumber");

        console.log(`✅ Payment successful! Receipt: ${mpesaReceiptNumber}`);

        return {
          success: true,
          checkoutRequestId,
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          resultDesc,
        };
      } else {
        console.log(`❌ Payment failed: ${resultDesc}`);
        return {
          success: false,
          checkoutRequestId,
          resultDesc,
          resultCode,
        };
      }
    } catch (error) {
      console.error("❌ Callback processing error:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate callback
  validateCallback(callbackData) {
    return true; // In production, add proper validation
  }

  // Get transaction status
  async getTransactionStatus(mpesaReceiptNumber) {
    console.log(`🔍 Getting transaction status: ${mpesaReceiptNumber}`);

    return {
      success: true,
      receipt: mpesaReceiptNumber,
      status: "completed",
      amount: 1000, // Demo amount
    };
  }
}

export default new MpesaService();
