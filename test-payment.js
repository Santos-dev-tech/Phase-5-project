// Test payment flow with realistic data
const testPaymentFlow = async () => {
  try {
    console.log("🧪 Testing Payment Flow...");

    // Test payment initiation
    const paymentResponse = await fetch(
      "http://localhost:8080/api/payments/mpesa/initiate",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: 1,
          customerName: "Test User",
          mealId: 1,
          phoneNumber: "0712345678",
          amount: 15.99,
        }),
      },
    );

    const paymentData = await paymentResponse.json();
    console.log("💳 Payment Initiation:", paymentData);

    if (paymentData.success) {
      const checkoutRequestId = paymentData.data.checkoutRequestId;
      console.log(`🔍 Testing status check for: ${checkoutRequestId}`);

      // Test immediate status (should be pending)
      const statusResponse = await fetch(
        `http://localhost:8080/api/payments/mpesa/status/${checkoutRequestId}`,
      );
      const statusData = await statusResponse.json();
      console.log("📊 Initial Status:", statusData);

      // Wait 5 seconds and check again
      setTimeout(async () => {
        const statusResponse2 = await fetch(
          `http://localhost:8080/api/payments/mpesa/status/${checkoutRequestId}`,
        );
        const statusData2 = await statusResponse2.json();
        console.log("📊 Status after 5s:", statusData2);
      }, 5000);

      // Wait 15 seconds and check final status
      setTimeout(async () => {
        const statusResponse3 = await fetch(
          `http://localhost:8080/api/payments/mpesa/status/${checkoutRequestId}`,
        );
        const statusData3 = await statusResponse3.json();
        console.log("📊 Final Status after 15s:", statusData3);
      }, 15000);
    }
  } catch (error) {
    console.error("❌ Test failed:", error);
  }
};

// Run test if this file is executed directly
if (typeof window !== "undefined") {
  testPaymentFlow();
} else {
  module.exports = testPaymentFlow;
}
