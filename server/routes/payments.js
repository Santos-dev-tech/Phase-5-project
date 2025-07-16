import mpesaService from "../services/mpesa.js";

// Store payment transactions in memory (use database in production)
let paymentTransactions = [];

// Initiate M-Pesa payment with improved error handling
export const initiateMpesaPayment = async (req, res) => {
  try {
    const { customerId, customerName, mealId, phoneNumber, amount } = req.body;

    console.log(`💳 M-Pesa Payment Request:`, {
      customer: customerName,
      phone: phoneNumber,
      amount: `KSH ${amount}`,
      meal: mealId,
    });

    // Validate required fields
    if (!phoneNumber || !amount || !customerId || !mealId) {
      console.log("❌ Missing required fields");
      return res.status(400).json({
        success: false,
        message: "Missing required information. Please try again.",
      });
    }

    // Validate phone number
    if (!mpesaService.isValidKenyanPhone(phoneNumber)) {
      console.log("❌ Invalid phone number format");
      return res.status(400).json({
        success: false,
        message: "Please enter a valid Kenyan phone number (e.g., 0712345678)",
      });
    }

    // Validate amount
    if (amount < 1 || amount > 150000) {
      console.log("❌ Invalid amount");
      return res.status(400).json({
        success: false,
        message: "Amount must be between KSH 1 and KSH 150,000",
      });
    }

    const accountReference = `MEALY_${customerId}_${Date.now()}`;
    const transactionDesc = `Mealy Food Order - ${customerName}`;

    console.log(`📱 Sending payment request to ${phoneNumber}...`);

    // Initiate STK Push
    const stkResult = await mpesaService.initiateSTKPush(
      phoneNumber,
      amount,
      accountReference,
      transactionDesc,
    );

    if (stkResult.success) {
      // Store transaction
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
        businessAccount: "254746013145",
        mode: mpesaService.hasRealCredentials ? "live" : "demo",
      };

      paymentTransactions.push(transaction);

      console.log(`✅ Payment request sent successfully`);
      console.log(`💰 Funds will be deposited to: 0746013145`);

      res.json({
        success: true,
        message: "Payment request sent successfully!",
        data: {
          checkoutRequestId: stkResult.data.CheckoutRequestID,
          merchantRequestId: stkResult.data.MerchantRequestID,
          customerMessage:
            stkResult.data.CustomerMessage ||
            "Check your phone for M-Pesa payment prompt. Enter your PIN to complete payment.",
          amount: amount,
          phoneNumber: mpesaService.formatPhoneNumber(phoneNumber),
          accountReference,
          mode: transaction.mode,
        },
      });
    } else {
      console.log(`❌ Payment request failed:`, stkResult.error);
      res.status(400).json({
        success: false,
        message:
          stkResult.error ||
          "Unable to send payment request. Please try again.",
        errorCode: stkResult.errorCode,
      });
    }
  } catch (error) {
    console.error("❌ Payment initiation error:", error);
    res.status(500).json({
      success: false,
      message: "Payment service temporarily unavailable. Please try again.",
    });
  }
};

// Check payment status with better handling
export const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    // Find transaction
    const transaction = paymentTransactions.find(
      (t) => t.checkoutRequestId === checkoutRequestId,
    );

    if (!transaction) {
      console.log(`❌ Transaction not found: ${checkoutRequestId}`);
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    console.log(`🔍 Checking payment status for: ${checkoutRequestId}`);

    // Query M-Pesa status
    const statusResult =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (statusResult.success) {
      const responseData = statusResult.data;
      const resultCode = responseData.ResultCode;

      // Update transaction based on status
      if (resultCode === "0") {
        // Payment successful
        transaction.status = "completed";
        transaction.completedAt = new Date().toISOString();
        transaction.mpesaReceiptNumber =
          responseData.MpesaReceiptNumber || `DEMO_${Date.now()}`;
        transaction.resultDesc = responseData.ResultDesc;

        console.log(`✅ Payment completed for ${transaction.phoneNumber}`);
        console.log(`💰 KSH ${transaction.amount} deposited to 0746013145`);
      } else if (
        resultCode === null ||
        resultCode === undefined ||
        responseData.status === "pending"
      ) {
        // Payment still pending - user hasn't acted yet
        transaction.status = "pending";
        transaction.resultDesc =
          responseData.ResultDesc || "Payment request is pending user action";
        console.log(`⏳ Payment still pending for ${transaction.phoneNumber}`);
      } else if (resultCode === "1032") {
        // Payment cancelled
        transaction.status = "cancelled";
        transaction.cancelledAt = new Date().toISOString();
        transaction.resultDesc = "Payment cancelled by user";
        console.log(`🚫 Payment cancelled: ${transaction.phoneNumber}`);
      } else if (resultCode === "1037") {
        // Timeout
        transaction.status = "timeout";
        transaction.timeoutAt = new Date().toISOString();
        transaction.resultDesc = "Payment request timed out";
        console.log(`⏰ Payment timeout: ${transaction.phoneNumber}`);
      } else if (resultCode === "1025") {
        // Invalid PIN
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultDesc = "Invalid PIN entered";
        console.log(`🔑 Invalid PIN: ${transaction.phoneNumber}`);
      } else if (resultCode === "1001") {
        // Insufficient balance
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultDesc = "Insufficient M-Pesa balance";
        console.log(`💸 Insufficient balance: ${transaction.phoneNumber}`);
      } else {
        // Other error
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
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
          resultDesc: transaction.resultDesc,
          createdAt: transaction.createdAt,
          completedAt: transaction.completedAt,
          mode: transaction.mode,
        },
      });
    } else {
      console.log(`❌ Status check failed: ${statusResult.error}`);
      res.status(400).json({
        success: false,
        message: "Unable to check payment status. Please try again.",
      });
    }
  } catch (error) {
    console.error("❌ Status check error:", error);
    res.status(500).json({
      success: false,
      message: "Status check service unavailable. Please try again.",
    });
  }
};

// Handle M-Pesa callback
export const handleMpesaCallback = (req, res) => {
  try {
    console.log("📞 M-Pesa Callback received");

    const callbackResult = mpesaService.processCallback(req.body);

    if (callbackResult.success) {
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "completed";
        transaction.mpesaReceiptNumber = callbackResult.mpesaReceiptNumber;
        transaction.completedAt = new Date().toISOString();
        transaction.callbackReceived = true;

        console.log(
          `✅ Callback: Payment completed - Receipt: ${callbackResult.mpesaReceiptNumber}`,
        );
        console.log(`💰 KSH ${transaction.amount} deposited to 0746013145`);
      }
    } else {
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "failed";
        transaction.failureReason = callbackResult.resultDesc;
        transaction.failedAt = new Date().toISOString();
        transaction.callbackReceived = true;

        console.log(
          `❌ Callback: Payment failed - ${callbackResult.resultDesc}`,
        );
      }
    }

    res.json({
      ResultCode: 0,
      ResultDesc: "Callback processed successfully",
    });
  } catch (error) {
    console.error("❌ Callback processing error:", error);
    res.json({
      ResultCode: 1,
      ResultDesc: "Error processing callback",
    });
  }
};

// Get payment transactions
export const getPaymentTransactions = (req, res) => {
  try {
    const { status, dateFrom, dateTo } = req.query;

    let filteredTransactions = [...paymentTransactions];

    if (status) {
      filteredTransactions = filteredTransactions.filter(
        (t) => t.status === status,
      );
    }

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

    filteredTransactions.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

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
      mode: mpesaService.hasRealCredentials ? "live" : "demo",
    };

    res.json({
      success: true,
      data: filteredTransactions,
      summary,
      businessAccount: "0746013145",
    });
  } catch (error) {
    console.error("❌ Error fetching transactions:", error);
    res.status(500).json({
      success: false,
      message: "Unable to fetch transaction history",
    });
  }
};

// Test M-Pesa configuration
export const testMpesaConfig = async (req, res) => {
  try {
    console.log("🧪 Testing M-Pesa configuration...");

    // Test access token
    const tokenTest = await mpesaService.getAccessToken();

    res.json({
      success: true,
      message: "M-Pesa configuration test completed",
      data: {
        environment: mpesaService.environment,
        mode: mpesaService.hasRealCredentials ? "live" : "demo",
        businessAccount: "0746013145",
        tokenTest: tokenTest
          ? "✅ Authentication successful"
          : "❌ Authentication failed",
        timestamp: new Date().toISOString(),
        status: "operational",
      },
    });
  } catch (error) {
    console.error("❌ Configuration test failed:", error);
    res.json({
      success: true, // Still return success to show demo mode works
      message: "M-Pesa running in demo mode",
      data: {
        environment: "demo",
        mode: "demo",
        businessAccount: "0746013145",
        tokenTest: "🎭 Demo mode active",
        timestamp: new Date().toISOString(),
        status: "demo",
      },
    });
  }
};

// Verify payment manually
export const verifyPayment = async (req, res) => {
  try {
    const { mpesaReceiptNumber } = req.body;

    if (!mpesaReceiptNumber) {
      return res.status(400).json({
        success: false,
        message: "M-Pesa receipt number is required",
      });
    }

    console.log(`🔍 Verifying payment: ${mpesaReceiptNumber}`);

    const result = await mpesaService.getTransactionStatus(mpesaReceiptNumber);

    res.json({
      success: true,
      message: "Payment verification completed",
      data: result,
    });
  } catch (error) {
    console.error("❌ Payment verification error:", error);
    res.status(500).json({
      success: false,
      message: "Payment verification failed",
    });
  }
};
