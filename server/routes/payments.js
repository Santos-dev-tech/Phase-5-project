import mpesaService from "../services/mpesa.js";

// Store payment transactions in memory (use database in production)
let paymentTransactions = [];

// Initiate M-Pesa payment
export const initiateMpesaPayment = async (req, res) => {
  try {
    const { customerId, customerName, mealId, phoneNumber, amount } = req.body;

    // Validate input
    if (!phoneNumber || !amount || !customerId || !mealId) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    // Validate phone number
    if (!mpesaService.isValidKenyanPhone(phoneNumber)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid phone number. Please use Kenyan format (e.g., 0712345678)",
      });
    }

    // Validate amount
    if (amount < 1) {
      return res.status(400).json({
        success: false,
        message: "Amount must be at least KSH 1",
      });
    }

    const accountReference = `MEALY_${customerId}_${Date.now()}`;
    const transactionDesc = `Payment for meal order - ${customerName}`;

    // Initiate STK Push
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
        createdAt: new Date().toISOString(),
      };

      paymentTransactions.push(transaction);

      res.json({
        success: true,
        message: "Payment initiated successfully",
        data: {
          checkoutRequestId: stkResult.data.CheckoutRequestID,
          merchantRequestId: stkResult.data.MerchantRequestID,
          customerMessage: stkResult.data.CustomerMessage,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to initiate payment",
        error: stkResult.error,
      });
    }
  } catch (error) {
    console.error("Error initiating M-Pesa payment:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Check payment status
export const checkPaymentStatus = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    // Find transaction
    const transaction = paymentTransactions.find(
      (t) => t.checkoutRequestId === checkoutRequestId,
    );

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    // Query M-Pesa for status (mock response for demo)
    const statusResult =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (statusResult.success) {
      // For demo purposes, randomly simulate payment completion
      const isCompleted = Math.random() > 0.3; // 70% success rate

      if (isCompleted && transaction.status === "pending") {
        transaction.status = "completed";
        transaction.mpesaReceiptNumber = `MPesa_${Date.now()}`;
        transaction.completedAt = new Date().toISOString();
      }

      res.json({
        success: true,
        data: {
          checkoutRequestId,
          status: transaction.status,
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          mpesaReceiptNumber: transaction.mpesaReceiptNumber,
        },
      });
    } else {
      res.status(400).json({
        success: false,
        message: "Failed to check payment status",
      });
    }
  } catch (error) {
    console.error("Error checking payment status:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// M-Pesa callback handler
export const handleMpesaCallback = (req, res) => {
  try {
    console.log("M-Pesa Callback received:", JSON.stringify(req.body, null, 2));

    const callbackResult = mpesaService.processCallback(req.body);

    if (callbackResult.success) {
      // Find and update transaction
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "completed";
        transaction.mpesaReceiptNumber = callbackResult.mpesaReceiptNumber;
        transaction.completedAt = new Date().toISOString();
        console.log("Payment completed for transaction:", transaction.id);
      }
    } else {
      // Payment failed
      const transaction = paymentTransactions.find(
        (t) => t.checkoutRequestId === callbackResult.checkoutRequestId,
      );

      if (transaction) {
        transaction.status = "failed";
        transaction.failureReason = callbackResult.resultDesc;
        transaction.failedAt = new Date().toISOString();
        console.log("Payment failed for transaction:", transaction.id);
      }
    }

    // Always respond with success to M-Pesa
    res.json({
      ResultCode: 0,
      ResultDesc: "Callback received successfully",
    });
  } catch (error) {
    console.error("Error processing M-Pesa callback:", error);
    res.json({
      ResultCode: 1,
      ResultDesc: "Error processing callback",
    });
  }
};

// Get payment transactions (admin)
export const getPaymentTransactions = (req, res) => {
  try {
    res.json({
      success: true,
      data: paymentTransactions.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
      ),
    });
  } catch (error) {
    console.error("Error fetching payment transactions:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

// Test M-Pesa configuration
export const testMpesaConfig = (req, res) => {
  try {
    res.json({
      success: true,
      message: "M-Pesa configuration is working",
      data: {
        shortCode: mpesaService.shortCode,
        baseUrl: mpesaService.baseUrl,
        callbackUrl: mpesaService.callbackUrl,
        isProduction: process.env.NODE_ENV === "production",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "M-Pesa configuration error",
    });
  }
};
