// M-Pesa Integration Service
// This is a mock implementation for demo purposes
// In production, you would use actual Safaricom M-Pesa API credentials

class MpesaService {
  constructor() {
    // Mock M-Pesa credentials (replace with actual ones in production)
    this.consumerKey = process.env.MPESA_CONSUMER_KEY || "mock_consumer_key";
    this.consumerSecret =
      process.env.MPESA_CONSUMER_SECRET || "mock_consumer_secret";
    this.baseUrl =
      process.env.MPESA_BASE_URL || "https://sandbox.safaricom.co.ke";
    this.shortCode = process.env.MPESA_SHORT_CODE || "174379";
    this.passkey = process.env.MPESA_PASSKEY || "mock_passkey";
    this.callbackUrl =
      process.env.MPESA_CALLBACK_URL ||
      "http://localhost:8080/api/payments/mpesa/callback";
  }

  // Generate access token
  async getAccessToken() {
    try {
      // Mock implementation - in production, make actual API call
      console.log("Generating M-Pesa access token...");
      return {
        access_token: "mock_access_token_" + Date.now(),
        expires_in: "3599",
      };
    } catch (error) {
      console.error("Error getting M-Pesa access token:", error);
      throw error;
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

  // Initiate STK Push
  async initiateSTKPush(
    phoneNumber,
    amount,
    accountReference,
    transactionDesc,
  ) {
    try {
      console.log("Initiating M-Pesa STK Push...");

      const token = await this.getAccessToken();
      const { password, timestamp } = this.generatePassword();

      // Format phone number (remove + and spaces, ensure it starts with 254)
      const formattedPhone = this.formatPhoneNumber(phoneNumber);

      const requestBody = {
        BusinessShortCode: this.shortCode,
        Password: password,
        Timestamp: timestamp,
        TransactionType: "CustomerPayBillOnline",
        Amount: Math.round(amount),
        PartyA: formattedPhone,
        PartyB: this.shortCode,
        PhoneNumber: formattedPhone,
        CallBackURL: this.callbackUrl,
        AccountReference: accountReference,
        TransactionDesc: transactionDesc,
      };

      console.log("M-Pesa STK Push Request:", {
        ...requestBody,
        Password: "[HIDDEN]",
      });

      // Mock response for demo purposes
      // In production, make actual API call to M-Pesa
      const mockResponse = {
        success: true,
        data: {
          MerchantRequestID: "mock_merchant_request_" + Date.now(),
          CheckoutRequestID: "ws_CO_" + Date.now(),
          ResponseCode: "0",
          ResponseDescription: "Success. Request accepted for processing",
          CustomerMessage: "Success. Request accepted for processing",
        },
      };

      console.log("M-Pesa STK Push Response:", mockResponse);
      return mockResponse;
    } catch (error) {
      console.error("Error initiating M-Pesa STK Push:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  // Query STK Push transaction status
  async querySTKPushStatus(checkoutRequestId) {
    try {
      console.log("Querying M-Pesa STK Push status for:", checkoutRequestId);

      // Mock response for demo purposes
      const mockResponse = {
        success: true,
        data: {
          ResponseCode: "0",
          ResponseDescription:
            "The service request has been accepted successfully",
          MerchantRequestID: "mock_merchant_request",
          CheckoutRequestID: checkoutRequestId,
          ResultCode: "0",
          ResultDesc: "The service request is processed successfully.",
        },
      };

      return mockResponse;
    } catch (error) {
      console.error("Error querying M-Pesa status:", error);
      return {
        success: false,
        error: error.message,
      };
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
    } else if (
      formatted.startsWith("712") ||
      formatted.startsWith("722") ||
      formatted.startsWith("733")
    ) {
      // Add country code if missing
      formatted = "254" + formatted;
    } else if (!formatted.startsWith("254")) {
      // Assume it needs country code
      formatted = "254" + formatted;
    }

    return formatted;
  }

  // Validate phone number
  isValidKenyanPhone(phoneNumber) {
    const formatted = this.formatPhoneNumber(phoneNumber);
    // Kenyan mobile numbers: 254-7XX-XXXXXX or 254-1XX-XXXXXX
    const kenyanMobileRegex = /^254[71]\d{8}$/;
    return kenyanMobileRegex.test(formatted);
  }

  // Process M-Pesa callback
  processCallback(callbackData) {
    try {
      console.log("Processing M-Pesa callback:", callbackData);

      const { Body } = callbackData;
      const resultCode = Body?.stkCallback?.ResultCode;
      const resultDesc = Body?.stkCallback?.ResultDesc;
      const checkoutRequestId = Body?.stkCallback?.CheckoutRequestID;

      if (resultCode === 0) {
        // Payment successful
        const callbackMetadata =
          Body?.stkCallback?.CallbackMetadata?.Item || [];
        const amount = callbackMetadata.find(
          (item) => item.Name === "Amount",
        )?.Value;
        const mpesaReceiptNumber = callbackMetadata.find(
          (item) => item.Name === "MpesaReceiptNumber",
        )?.Value;
        const phoneNumber = callbackMetadata.find(
          (item) => item.Name === "PhoneNumber",
        )?.Value;

        return {
          success: true,
          checkoutRequestId,
          amount,
          mpesaReceiptNumber,
          phoneNumber,
          resultDesc,
        };
      } else {
        // Payment failed
        return {
          success: false,
          checkoutRequestId,
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
}

export default new MpesaService();
