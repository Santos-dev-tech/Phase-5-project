// Fixed payment status checker

export const checkPaymentStatusFixed = async (req, res) => {
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
      const responseStatus = responseData.status;

      // Enhanced debugging
      console.log(`🔍 DEBUG - Status Response:`, {
        resultCode: resultCode,
        responseStatus: responseStatus,
        resultDesc: responseData.ResultDesc,
        checkoutRequestId: checkoutRequestId,
        resultCodeType: typeof resultCode,
        resultCodeNull: resultCode === null,
        resultCodeUndefined: resultCode === undefined,
      });

      // FIXED: Better status checking logic
      if (responseStatus === "completed" && resultCode === "0") {
        // Payment successful - both status and result code confirm completion
        transaction.status = "completed";
        transaction.completedAt = new Date().toISOString();
        transaction.mpesaReceiptNumber =
          responseData.mpesaReceiptNumber || `DEMO_${Date.now()}`;
        transaction.resultDesc =
          responseData.ResultDesc || "Payment completed successfully";

        console.log(`✅ Payment completed for ${transaction.phoneNumber}`);
        console.log(`💰 KSH ${transaction.amount} deposited to 0746013145`);
      } else if (
        responseStatus === "pending" ||
        resultCode === null ||
        resultCode === undefined
      ) {
        // Payment still pending - user hasn't acted yet
        transaction.status = "pending";
        transaction.resultDesc = "Payment request is pending user action";
        console.log(`⏳ Payment still pending for ${transaction.phoneNumber}`);
      } else if (responseStatus === "failed" || resultCode === "1032") {
        // Payment cancelled/failed
        transaction.status = "failed";
        transaction.failedAt = new Date().toISOString();
        transaction.resultDesc =
          responseData.ResultDesc || "Payment cancelled by user";
        console.log(`🚫 Payment failed: ${transaction.phoneNumber}`);
      } else if (responseStatus === "timeout" || resultCode === "1037") {
        // Payment timeout
        transaction.status = "timeout";
        transaction.timeoutAt = new Date().toISOString();
        transaction.resultDesc = "Payment request timed out";
        console.log(`⏰ Payment timeout: ${transaction.phoneNumber}`);
      } else {
        // Default to pending for unknown states during demo
        transaction.status = "pending";
        transaction.resultDesc = "Payment request is being processed";
        console.log(`🔄 Payment processing: ${transaction.phoneNumber}`);
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
      // Status query failed - keep as pending
      console.log(`❌ Status query failed for ${checkoutRequestId}`);
      res.json({
        success: true,
        data: {
          checkoutRequestId,
          status: "pending",
          amount: transaction.amount,
          phoneNumber: transaction.phoneNumber,
          resultDesc: "Status check in progress",
          createdAt: transaction.createdAt,
          mode: transaction.mode,
        },
      });
    }
  } catch (error) {
    console.error(`❌ Payment status check error:`, error);
    res.status(500).json({
      success: false,
      message: "Payment status check failed",
      error: error.message,
    });
  }
};
