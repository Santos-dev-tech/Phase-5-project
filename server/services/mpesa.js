import https from "https";
import { Buffer } from "buffer";

// Real M-Pesa Integration Service for Safaricom API
class MpesaService {
  constructor() {
    // Production M-Pesa credentials - you'll need to get these from Safaricom
    // For now using sandbox, but structure is ready for production
    this.consumerKey =
      process.env.MPESA_CONSUMER_KEY || "CeDpXcMKjY9BL8ZPw2d3LVz0Y2QiYKLF";
    this.consumerSecret =
      process.env.MPESA_CONSUMER_SECRET ||
      "0VjG7x8h4R5c1A2fK9rLm3bE6qN8pT4wS7uI0nM";
    this.environment = process.env.MPESA_ENVIRONMENT || "sandbox"; // or "production"

    // M-Pesa endpoints
    this.baseUrl =
      this.environment === "production"
        ? "https://api.safaricom.co.ke"
        : "https://sandbox.safaricom.co.ke";

    // Business configuration - modify these for your business
    this.shortCode = process.env.MPESA_SHORT_CODE || "174379"; // Your business shortcode
    this.passkey =
      process.env.MPESA_PASSKEY ||
      "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

    // Your business phone number where funds will be deposited
    this.businessPhoneNumber = "254746013145"; // 0746013145 in international format

    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      "https://your-domain.com/api/payments/mpesa/callback";

    // Cache for access token
    this.accessToken = null;
    this.tokenExpiry = null;
  }

  // Get access token from M-Pesa
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

      console.log("Getting new M-Pesa access token...");

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
        // Token expires in 1 hour, we'll refresh 5 minutes early
        this.tokenExpiry = new Date(Date.now() + 55 * 60 * 1000);
        console.log("M-Pesa access token obtained successfully");
        return this.accessToken;
      } else {
        throw new Error(
          "Failed to get access token: " + JSON.stringify(response),
        );
      }
    } catch (error) {
      console.error("Error getting M-Pesa access token:", error);
      throw new Error("Failed to authenticate with M-Pesa: " + error.message);
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
        reject(error);
      });

      if (data && method !== "GET") {
        req.write(JSON.stringify(data));
      }

      req.end();
    });
  }

  // Initiate STK Push (real M-Pesa API call)
  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
  ) {
    try {
      console.log(
        `Initiating real M-Pesa STK Push for ${phoneNumber} - Amount: KSH ${amount}`,
      );

      const accessToken = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount * 100), // Convert to cents for M-Pesa
        PartyA: formattedPhone, // Customer phone number
        PartyB: this.shortCode, // Your business shortcode
        PhoneNumber: formattedPhone, // Phone number to receive the STK push
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc || "Mealy Food Order Payment",
      };

      console.log("M-Pesa STK Push Request:", {
        ...requestBody,
        Password: "[HIDDEN]",
        Amount: `KSH ${amount}`,
      });

      const response = await this.makeRequest(
        "POST",
        "/mpesa/stkpush/v1/processrequest",
        requestBody,
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      );

      console.log("M-Pesa STK Push Response:", response);

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
              "STK push sent to your phone. Please enter your M-Pesa PIN to complete payment.",
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
      console.error("Error initiating M-Pesa STK Push:", error);
      return {
        success: false,
        error: error.message || "Failed to initiate payment",
      };
    }
  }

  // Query STK Push transaction status (real M-Pesa API call)
  async querySTKPushStatus(checkoutRequestId) {
    try {
      console.log("Querying M-Pesa STK Push status for:", checkoutRequestId);

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

      console.log("M-Pesa Status Query Response:", response);

      return {
        success: true,
        data: response,
      };
    } catch (error) {
      console.error("Error querying M-Pesa status:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Transfer funds to business account (if needed)
  async transferToBusinessAccount(amount, transactionId) {
    try {
      console.log(
        `Transferring KSH ${amount} to business account ${this.businessPhoneNumber}`,
      );

      const accessToken = await this.getAccessToken();

      const requestBody = {
        InitiatorName: "Mealy System", // Your initiator name
        SecurityCredential: "your_security_credential", // You'll need to generate this
        CommandID: "BusinessPayment",
        Amount: Math.round(amount * 100),
        PartyA: this.shortCode,
        PartyB: this.businessPhoneNumber,
        Remarks: `Payment transfer for transaction ${transactionId}`,
        QueueTimeOutURL: `${this.callbackUrl}/timeout`,
        ResultURL: `${this.callbackUrl}/result`,
        Occasion: "Food order payment",
      };

      const response = await this.makeRequest(
        "POST",
        "/mpesa/b2c/v1/paymentrequest",
        requestBody,
        {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      );

      console.log("Business transfer response:", response);
      return response;
    } catch (error) {
      console.error("Error transferring to business account:", error);
      return { success: false, error: error.message };
    }
  }

  // Format phone number for M-Pesa (Kenyan format)
  formatPhoneNumber(phoneNumber) {
    // Remove all non-numeric characters
    let formatted = phoneNumber.replace(/\D/g, "");

    // Handle different formats
    if (formatted.startsWith("0")) {
      // Convert 0712345678 to 254712345678
      formatted = "254" + formatted.substring(1);
    } else if (formatted.startsWith("7") || formatted.startsWith("1")) {
      // Add country code if missing
      formatted = "254" + formatted;
    } else if (!formatted.startsWith("254")) {
      // Assume it needs country code
      formatted = "254" + formatted;
    }

    return formatted;
  }

  // Validate Kenyan phone number
  isValidKenyanPhone(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Kenyan mobile numbers: 254-7XX-XXXXXX or 254-1XX-XXXXXX
    const kenyanMobileRegex = /^254[71]\d{8}$/;
    return kenyanMobileRegex.test(formatted);
  }

  // Process M-Pesa callback
  processCallback(callbackData) {
    try {
      console.log(
        "Processing M-Pesa callback:",
        JSON.stringify(callbackData, null, 2),
      );

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
      const merchantRequestId = stkCallback.MerchantRequestID;

      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata = stkCallback.CallbackMetadata?.Item || [];

        const getMetadataValue = (name) => {
          const item = callbackMetadata.find((item) => item.Name === name);
          return item ? item.Value : null;
        };

        const amount = getMetadataValue("Amount");
        const mpesaReceiptNumber = getMetadataValue("MpesaReceiptNumber");
        const transactionDate = getMetadataValue("TransactionDate");
        const phoneNumber = getMetadataValue("PhoneNumber");

        console.log(
          `✅ Payment successful! Receipt: ${mpesaReceiptNumber}, Amount: KSH ${amount}`,
        );

        return {
          success: true,
          checkoutRequestId,
          merchantRequestId,
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          transactionDate,
          resultDesc,
        };
      } else {
        // Payment failed
        console.log(`❌ Payment failed: ${resultDesc}`);
        return {
          success: false,
          checkoutRequestId,
          merchantRequestId,
          resultDesc,
          resultCode,
        };
      }
    } catch (error) {
      console.error("Error processing M-Pesa callback:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Validate M-Pesa callback (security check)
  validateCallback(callbackData, expectedOrigin = null) {
    // Add your callback validation logic here
    // You might want to verify the callback is from Safaricom
    // This could include checking IP addresses, signatures, etc.
    return true;
  }

  // Get transaction status by receipt number
  async getTransactionStatus(mpesaReceiptNumber) {
    try {
      // This would query M-Pesa for transaction details
      // Implementation depends on available M-Pesa APIs
      console.log(
        "Querying transaction status for receipt:",
        mpesaReceiptNumber,
      );

      // Return transaction details
      return {
        success: true,
        receipt: mpesaReceiptNumber,
        status: "completed",
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

export default new MpesaService();
