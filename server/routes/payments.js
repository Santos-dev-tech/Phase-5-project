import mpesaService from "../services/mpesa.js";

// Store payment transactions in memory (use database in production)
let paymentTransactions = [];

// Initiate real M-Pesa payment
export const initiateMpesaPayment = async (req, res) => {
  try {
    const { customerId, customerName, mealId, phoneNumber, amount } = req.body;

    console.log(`🔄 Processing M-Pesa payment request:`, {
      customer: customerName,
      phone: phoneNumber,
      amount: `KSH ${amount}`,
      meal: mealId,
    });

    // Validate input
    if (!phoneNumber || !amount || !customerId || !mealId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: phone number, amount, customer ID, or meal ID",
      });
    }

    // Validate phone number format
    if (!mpesaService.isValidKenyanPhone(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number. Please use Kenyan format (e.g., 0712345678 or 254712345678)",
      });
    }

    // Validate amount
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least KSH 1",
      });
    }

    if (amount > 150000) {
      return res.status(400).json({
        success: false,
        message: "Amount cannot exceed KSH 150,000 per transaction",
      });
    }

    const accountReference = `MEALY_${customerId}_${Date.now()}`;
    const transactionDesc = `Mealy Food Order - ${customerName}`;

    // Initiate real STK Push
    console.log(`📱 Sending STK push to ${phoneNumber} for KSH ${amount}...`);
    const stkResult = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
    );

    if (stkResult.success) {
      // Store transaction details
      const transaction = {
        id: Date.now(),
        customerId,
        customerName,
        mealId,
        phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
        amount,
        accountReference,
        checkoutRequestId: stkResult.data.CheckoutRequestID,
        merchantRequestId: stkResult.data.MerchantRequestID,
        status: "pending",
        paymentMethod: "mpesa",
        createdAt: new Date().toISOString(),
        businessAccount: "254746013145", // Where funds will be deposited
      };

      paymentTransactions.push(transaction);

      console.log(`✅ STK push sent successfully to ${phoneNumber}`);
      console.log(`💰 Funds will be deposited to: 0746013145`);

      res.json({
        success: true,
        message: "Payment request sent to your phone successfully!",
        data: {
          checkoutRequestId: stkResult.data.CheckoutRequestID,
          merchantRequestId: stkResult.data.MerchantRequestID,
          customerMessage:
            stkResult.data.CustomerMessage ||
            "Check your phone for M-Pesa payment prompt. Enter your PIN to complete payment.",
          amount: amount,
          phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
          accountReference,
        },
      });
    } else {
      console.log(`❌ STK push failed:`, stkResult.error);
      res.status(400).json({
        success: false,
        message: "Failed to send payment request to your phone",
        error: stkResult.error,
        errorCode: stkResult.errorCode,
      });
    }
  } catch (error) {
    console.error("❌ Error initiating M-Pesa payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again.",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Check real M-Pesa payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    // Find transaction in our records
    const transaction = paymentTransactions.find(
      (t) => t.checkoutRequestId === checkoutRequestId,
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    console.log(`🔍 Checking payment status for: ${checkoutRequestId}`);

    // Query real M-Pesa API for status
    const statusResult =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (statusResult.success) {
      const responseData = statusResult.data;
      const resultCode = responseData.ResultCode;

      // Update transaction status based on M-Pesa response
      if (resultCode === "0") {
        // Payment successful
        transaction.status = "completed";
        transaction.completedAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = responseData.ResultDesc;

        console.log(`✅ Payment completed for ${transaction.phoneNumber}`);
        console.log(`💰 KSH ${transaction.amount} deposited to 0746013145`);
      } else if (resultCode === "1032") {
        // Payment cancelled by user
        transaction.status = "cancelled";
        transaction.cancelledAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = responseData.ResultDesc;

        console.log(`🚫 Payment cancelled by user: ${transaction.phoneNumber}`);
      } else if (resultCode === "1037") {
        // Timeout - user didn't enter PIN
        transaction.status = "timeout";
        transaction.timeoutAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = responseData.ResultDesc;

        console.log(`⏰ Payment timeout for: ${transaction.phoneNumber}`);
      } else if (resultCode === "1025") {
        // Invalid PIN
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = "Invalid PIN entered";

        console.log(`🔑 Invalid PIN for: ${transaction.phoneNumber}`);
      } else if (resultCode === "1001") {
        // Insufficient balance
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = "Insufficient balance in M-Pesa account";

        console.log(`💸 Insufficient balance: ${transaction.phoneNumber}`);
      } else {
        // Other error
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultCode = resultCode;
        transaction.resultDesc = responseData.ResultDesc || "Payment failed";

        console.log(`❌ Payment failed: ${responseData.ResultDesc}`);
      }

      res.json({
        success: true,
        data: {
          checkoutRequestId,
          status: transaction.status,
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          mpesaReceiptNumber: transaction.mpesaReceiptNumber,
          resultCode: transaction.resultCode,
          resultDesc: transaction.resultDesc,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
        },
      });
    } else {
      console.log(`❌ Failed to check payment status: ${statusResult.error}`);
      res.status(400).json({
        success: false,
        message: "Failed to check payment status",
        error: statusResult.error,
      });
    }
  } catch (error) {
    console.error("❌ Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
};

// Handle real M-Pesa callback
export const handleMpesaCallback = (req, res) => {
  try {
    console.log("📞 M-Pesa Callback received:");
    console.log(JSON.stringify(req.body, null, 2));

    // Validate callback origin (add your validation logic)
    if (!mpesaService.validateCallback(req.body)) {
      console.log("⚠️ Invalid callback origin");
      return res.status(400).json({
        ResultCode: 1,
        ResultDesc: "Invalid callback",
      });
    }

    const callbackResult = mpesaService.processCallback(req.body);

    if (callbackResult.success) {
      // Find and update transaction
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "completed";
        transaction.mpesaReceiptNumber = callbackResult.mpesaReceiptNumber;
        transaction.transactionDate = callbackResult.transactionDate;
        transaction.completedAt = new Date().toISOString();
        transaction.callbackReceived = true;

        console.log(
          `✅ Payment completed via callback - Receipt: ${callbackResult.mpesaReceiptNumber}`,
        );
        console.log(`💰 KSH ${callbackResult.amount} deposited to 0746013145`);
        console.log(`📱 From: ${callbackResult.phoneNumber}`);

        // Here you could trigger additional actions like:
        // - Send confirmation SMS
        // - Update order status
        // - Send email receipt
        // - Trigger business logic
      } else {
        console.log(
          `⚠️ Transaction not found for checkout request: ${callbackResult.checkoutRequestId}`,
        );
      }
    } else {
      // Payment failed
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "failed";
        transaction.failureReason = callbackResult.resultDesc;
        transaction.resultCode = callbackResult.resultCode;
        transaction.failedAt = new Date().toISOString();
        transaction.callbackReceived = true;

        console.log(
          `❌ Payment failed via callback: ${callbackResult.resultDesc}`,
        );
      }
    }

    // Always respond with success to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
    });
  } catch (error) {
    console.error("❌ Error processing M-Pesa callback:", error);
    res.json({
      ResultCode: 1,
      ResultDesc: "Error processing callback",
    });
  }
};

// Get payment transactions (admin)
export const getPaymentTransactions = (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    let filteredTransactions = [...paymentTransactions];

    // Filter by status if provided
    if (status) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.status === status,
      );
    }

    // Filter by date range if provided
    if (dateFrom) {
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) >= new Date(dateFrom),
      );
    }

    if (dateTo) {
      filteredTransactions = filteredTransactions.filter(
        (t) => new Date(t.createdAt) <= new Date(dateTo),
      );
    }

    // Sort by creation date (newest first)
    filteredTransactions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // Calculate summary statistics
    const summary = {
      totalTransactions: filteredTransactions.length,
      completedTransactions: filteredTransactions.filter(
        (t) => t.status === "completed",
      ).length,
      totalAmount: filteredTransactions
        .filter((t) => t.status === "completed")
        .reduce((sum, t) => sum + t.amount, 0),
      pendingTransactions: filteredTransactions.filter(
        (t) => t.status === "pending",
      ).length,
      failedTransactions: filteredTransactions.filter(
        (t) => t.status === "failed",
      ).length,
    };

    res.json({
      success: true,
      data: filteredTransactions,
      summary,
      businessAccount: "0746013145",
    });
  } catch (error) {
    console.error("❌ Error fetching payment transactions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Test M-Pesa configuration
export const testMpesaConfig = async (req, res) => {
  try {
    console.log("🧪 Testing M-Pesa configuration...");

    // Test access token generation
    const token = await mpesaService.getAccessToken();

    res.json({
      success: true,
      message: "M-Pesa configuration test successful",
      data: {
        environment: mpesaService.environment,
        baseUrl: mpesaService.baseUrl,
        shortCode: mpesaService.shortCode,
        businessAccount: "0746013145",
        callbackUrl: mpesaService.callbackUrl,
        tokenTest: token
          ? "✅ Token generation successful"
          : "❌ Token generation failed",
        isProduction: process.env.NODE_ENV === "production",
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error("❌ M-Pesa configuration test failed:", error);
    res.status(500).json({
      success: false,
      message: "M-Pesa configuration test failed",
      error: error.message,
    });
  }
};

// Manual payment verification (admin use)
export const verifyPayment = async (req, res) => {
  try {
    const { mpesaReceiptNumber } = req.body;

    if (!mpesaReceiptNumber) {
      return res.status(400).json({
        success: false,
        message: "M-Pesa receipt number is required",
      });
    }

    console.log(`🔍 Manually verifying payment: ${mpesaReceiptNumber}`);

    const result = await mpesaService.getTransactionStatus(mpesaReceiptNumber);

    res.json({
      success: true,
      message: "Payment verification completed",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error verifying payment:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
      error: error.message,
    });
  }
};
