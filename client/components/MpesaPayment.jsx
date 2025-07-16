import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Smartphone,
  CreditCard,
  CheckCircle,
  AlertCircle,
  Loader2,
  DollarSign,
  Zap,
  Shield,
} from "lucide-react";
import { toast } from "sonner";

const MpesaPayment = ({ isOpen, onClose, meal, onPaymentSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, failed
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);
  const [paymentMessage, setPaymentMessage] = useState("");

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPhoneNumber("");
      setIsProcessing(false);
      setPaymentStatus("idle");
      setCheckoutRequestId(null);
      setPaymentMessage("");
    }
  }, [isOpen]);

  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    let formatted = phone.replace(/\D/g, "");

    // Add formatting
    if (formatted.length >= 10) {
      return formatted.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3");
    }
    return formatted;
  };

  const validatePhoneNumber = (phone) => {
    const cleaned = phone.replace(/\D/g, "");
    // Kenyan mobile numbers: starts with 07 or 01 (10 digits) or 2547/2541 (12 digits)
    return /^(07|01)\d{8}$/.test(cleaned) || /^2547\d{8}$/.test(cleaned);
  };

  const initiatePayment = async () => {
    if (!validatePhoneNumber(phoneNumber)) {
      toast.error(
        "Please enter a valid Kenyan phone number (e.g., 0712345678)",
      );
      return;
    }

    setIsProcessing(true);
    setPaymentStatus("processing");

    try {
      console.log("🚀 Initiating REAL M-Pesa payment...");

      const response = await fetch("/api/payments/mpesa/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: 1, // This should come from user context
          customerName: "Customer", // This should come from user context
          mealId: meal.id,
          phoneNumber: phoneNumber.replace(/\D/g, ""),
          amount: meal.price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setCheckoutRequestId(data.data.checkoutRequestId);
        setPaymentMessage(
          data.data.customerMessage ||
            "Payment request sent to your phone. Please check your M-Pesa notifications.",
        );

        toast.success(
          "🚀 REAL M-Pesa prompt sent! Check your phone and enter your PIN.",
        );

        console.log("✅ STK Push sent successfully");
        console.log("💰 Funds will be deposited to: 0746013145");

        // Start polling for payment status
        pollPaymentStatus(data.data.checkoutRequestId);
      } else {
        setPaymentStatus("failed");
        setPaymentMessage(
          data.message || "Failed to send payment request to your phone",
        );
        toast.error(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      setPaymentStatus("failed");
      setPaymentMessage("Network error. Please check your connection.");
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestId) => {
    const maxAttempts = 30; // Poll for 3 minutes (30 * 6 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/status/${requestId}`);
        const data = await response.json();

        if (data.success) {
          const status = data.data.status;
          const resultDesc = data.data.resultDesc;

          console.log(`📊 Payment status: ${status}`);

          if (status === "completed") {
            setPaymentStatus("success");
            setPaymentMessage(
              `Payment successful! Receipt: ${data.data.mpesaReceiptNumber}`,
            );
            toast.success(
              "🎉 Payment completed! Money deposited to 0746013145",
            );
            onPaymentSuccess({
              checkoutRequestId: requestId,
              mpesaReceiptNumber: data.data.mpesaReceiptNumber,
              amount: data.data.amount,
              phoneNumber: phoneNumber.replace(/\\D/g, ""),
            });
            return;
          } else if (status === "failed") {
            setPaymentStatus("failed");
            setPaymentMessage(resultDesc || "Payment failed");
            toast.error(`Payment failed: ${resultDesc}`);
            return;
          } else if (status === "cancelled") {
            setPaymentStatus("failed");
            setPaymentMessage("Payment was cancelled by user");
            toast.warning("Payment cancelled");
            return;
          } else if (status === "timeout") {
            setPaymentStatus("timeout");
            setPaymentMessage("Payment request timed out");
            toast.warning("Payment timed out. Please try again.");
            return;
          }
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000); // Check every 6 seconds
        } else {
          setPaymentStatus("timeout");
          setPaymentMessage(
            "Payment verification timed out. Contact support if money was deducted.",
          );
          toast.warning(
            "Payment verification timed out. Please contact support if money was deducted.",
          );
        }
      } catch (error) {
        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000);
        } else {
          setPaymentStatus("failed");
          setPaymentMessage("Failed to verify payment status.");
          toast.error("Failed to verify payment status.");
        }
      }
    };

    checkStatus();
  };

  const handlePhoneNumberChange = (e) => {
    const value = e.target.value;
    const formatted = formatPhoneNumber(value);
    if (formatted.replace(/\D/g, "").length <= 12) {
      setPhoneNumber(formatted);
    }
  };

  const getStatusIcon = () => {
    switch (paymentStatus) {
      case "processing":
        return <Loader2 className="w-8 h-8 text-green-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "failed":
      case "timeout":
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Smartphone className="w-8 h-8 text-green-600" />;
    }
  };

  const getStatusMessage = () => {
    if (paymentMessage) return paymentMessage;

    switch (paymentStatus) {
      case "processing":
        return "Check your phone for the M-Pesa payment prompt...";
      case "success":
        return "Payment completed successfully! Funds deposited to 0746013145";
      case "failed":
        return "Payment failed. Please try again.";
      case "timeout":
        return "Payment verification timed out.";
      default:
        return "Enter your M-Pesa number for instant payment";
    }
  };

  if (!meal) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <CreditCard className="w-6 h-6 text-green-600" />
            <span>M-Pesa Payment</span>
            <Badge className="bg-green-100 text-green-800 text-xs">LIVE</Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Live Payment Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Zap className="w-5 h-5 text-green-600" />
              <span className="font-semibold text-green-900">
                Real M-Pesa Payment
              </span>
            </div>
            <p className="text-green-700 text-sm">
              This will send an actual payment request to your phone. Funds will
              be deposited to{" "}
              <strong className="text-green-900">0746013145</strong>
            </p>
          </div>

          {/* Order Summary */}
          <Card className="border-green-200 bg-green-50/50">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">{meal.name}</h3>
                <Badge className="bg-green-100 text-green-800">
                  KSH {(meal.price * 100).toFixed(0)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{meal.description}</p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Total Amount:</span>
                <div className="flex items-center space-x-1">
                  <DollarSign className="w-4 h-4 text-green-600" />
                  <span className="text-xl font-bold text-green-600">
                    KSH {(meal.price * 100).toFixed(0)}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">Recipient:</span>
                <span className="text-sm font-semibold text-green-700">
                  0746013145
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Payment Status */}
          <div className="text-center py-4">
            <div className="mb-3">{getStatusIcon()}</div>
            <p className="text-gray-700 font-medium">{getStatusMessage()}</p>
          </div>

          {/* Phone Number Input */}
          {paymentStatus === "idle" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="phone" className="text-gray-700 font-semibold">
                  M-Pesa Phone Number
                </Label>
                <div className="relative mt-1">
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="0712 345 678"
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    className="pl-12 h-12 text-lg border-green-200 focus:border-green-500"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
                    <Smartphone className="w-5 h-5 text-gray-400" />
                  </div>
                </div>
                <div className="flex items-center space-x-2 mt-2">
                  <Shield className="w-4 h-4 text-green-600" />
                  <p className="text-xs text-green-600">
                    Secure Safaricom M-Pesa payment
                  </p>
                </div>
              </div>

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button
                  onClick={initiatePayment}
                  disabled={!phoneNumber || isProcessing}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <Smartphone className="w-4 h-4 mr-2" />
                      Pay Now
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Processing State */}
          {paymentStatus === "processing" && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  🚀 REAL Payment Request Sent!
                </h4>
                <p className="text-green-700 text-sm mb-3">
                  M-Pesa prompt sent to <strong>{phoneNumber}</strong>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-3">
                  <div className="flex items-center space-x-2 mb-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-yellow-800 font-semibold text-sm">
                      Waiting for your action...
                    </span>
                  </div>
                  <div className="text-xs text-yellow-700 space-y-1">
                    <div>⏳ You have 3 minutes to complete payment</div>
                    <div>📱 Check your phone for M-Pesa notification</div>
                    <div>🔢 Enter your M-Pesa PIN when prompted</div>
                  </div>
                </div>
                <div className="text-xs text-green-600 space-y-1">
                  <div>
                    💰 Funds will go to: <strong>0746013145</strong>
                  </div>
                  <div>⚡ Payment will be confirmed automatically</div>
                  <div>🔄 This page will update when payment is complete</div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                size="sm"
              >
                Continue Shopping (Payment in progress)
              </Button>
            </div>
          )}

          {/* Success State */}
          {paymentStatus === "success" && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  🎉 Payment Successful!
                </h4>
                <p className="text-green-700 text-sm mb-2">
                  Your order has been placed and payment confirmed.
                </p>
                <p className="text-xs text-green-600">
                  💰 KSH {(meal.price * 100).toFixed(0)} deposited to 0746013145
                </p>
              </div>
              <Button onClick={onClose} className="w-full bg-green-600">
                Continue
              </Button>
            </div>
          )}

          {/* Failed State */}
          {(paymentStatus === "failed" || paymentStatus === "timeout") && (
            <div className="text-center space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h4 className="font-semibold text-red-900 mb-2">
                  {paymentStatus === "timeout"
                    ? "⏰ Payment Timeout"
                    : "❌ Payment Failed"}
                </h4>
                <p className="text-red-700 text-sm">
                  {paymentMessage ||
                    (paymentStatus === "timeout"
                      ? "Payment request timed out. Please try again."
                      : "The payment could not be processed. Please try again.")}
                </p>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    setPaymentStatus("idle");
                    setCheckoutRequestId(null);
                    setPaymentMessage("");
                  }}
                  className="flex-1 bg-green-600"
                >
                  Try Again
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default MpesaPayment;
