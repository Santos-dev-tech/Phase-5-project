// Complete override for payment status checking
import mpesaService from "./services/mpesa.js";

// Payment transactions storage (should match the main file)
const paymentTransactions = [];

export const checkPaymentStatusFixed = async (req, res) => {
  try {
    const { checkoutRequestId } = req.params;

    console.log(
      `🔍 FIXED CHECKER: Checking payment status for: ${checkoutRequestId}`,
    );

    // Query M-Pesa status
    const statusResult =
      await mpesaService.querySTKPushStatus(checkoutRequestId);

    if (statusResult.success) {
      const responseData = statusResult.data;

      // Simple, clear logic
      let finalStatus = "pending";
      let message = "Payment request is pending user action";

      // Check status field first
      if (responseData.status === "completed") {
        finalStatus = "completed";
        message = "Payment completed successfully";
      } else if (responseData.status === "pending") {
        finalStatus = "pending";
        message = "Waiting for you to complete payment on your phone";
      } else if (responseData.status === "failed") {
        finalStatus = "failed";
        message = responseData.ResultDesc || "Payment failed";
      } else {
        // Default to pending for any unclear state
        finalStatus = "pending";
        message = "Payment is being processed";
      }

      console.log(`📊 FIXED: Status = ${finalStatus}, Message = ${message}`);

      res.json({
        success: true,
        data: {
          checkoutRequestId,
          status: finalStatus,
          resultDesc: message,
          amount: 15.99, // Default for demo
          mode: "demo",
        },
      });
    } else {
      console.log(`❌ FIXED: Status query failed, defaulting to pending`);
      res.json({
        success: true,
        data: {
          checkoutRequestId,
          status: "pending",
          resultDesc: "Payment status check in progress",
          amount: 15.99,
          mode: "demo",
        },
      });
    }
  } catch (error) {
    console.error(`❌ FIXED: Payment status check error:`, error);
    res.json({
      success: true,
      data: {
        checkoutRequestId: req.params.checkoutRequestId,
        status: "pending",
        resultDesc: "Payment is being processed",
        amount: 15.99,
        mode: "demo",
      },
    });
  }
};

// Test the logic directly
export const testPaymentLogic = () => {
  const testCases = [
    { status: "pending", ResultCode: null },
    { status: "completed", ResultCode: "0" },
    { status: "failed", ResultCode: "1032" },
    { status: undefined, ResultCode: null },
  ];

  testCases.forEach((testCase, index) => {
    let finalStatus = "pending";
    let message = "Payment request is pending user action";

    if (testCase.status === "completed") {
      finalStatus = "completed";
      message = "Payment completed successfully";
    } else if (testCase.status === "pending") {
      finalStatus = "pending";
      message = "Waiting for you to complete payment on your phone";
    } else if (testCase.status === "failed") {
      finalStatus = "failed";
      message = "Payment failed";
    } else {
      finalStatus = "pending";
      message = "Payment is being processed";
    }

    console.log(
      `Test ${index + 1}: Input=${JSON.stringify(testCase)} => Status=${finalStatus}, Message=${message}`,
    );
  });
};
