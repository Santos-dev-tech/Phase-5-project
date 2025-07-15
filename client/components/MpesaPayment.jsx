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
} from "lucide-react";
import { toast } from "sonner";

const MpesaPayment = ({ isOpen, onClose, meal, onPaymentSuccess }) => {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState("idle"); // idle, processing, success, failed
  const [checkoutRequestId, setCheckoutRequestId] = useState(null);

  useEffect(() => {
    if (!isOpen) {
      // Reset state when modal closes
      setPhoneNumber("");
      setIsProcessing(false);
      setPaymentStatus("idle");
      setCheckoutRequestId(null);
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
        toast.success(
          "Payment request sent! Please check your phone for the M-Pesa prompt.",
        );

        // Start polling for payment status
        pollPaymentStatus(data.data.checkoutRequestId);
      } else {
        setPaymentStatus("failed");
        toast.error(data.message || "Failed to initiate payment");
      }
    } catch (error) {
      setPaymentStatus("failed");
      toast.error("Failed to initiate payment. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const pollPaymentStatus = async (requestId) => {
    const maxAttempts = 20; // Poll for 2 minutes (20 * 6 seconds)
    let attempts = 0;

    const checkStatus = async () => {
      try {
        const response = await fetch(`/api/payments/mpesa/status/${requestId}`);
        const data = await response.json();

        if (data.success && data.data.status === "completed") {
          setPaymentStatus("success");
          toast.success("Payment successful! Your order has been placed.");
          onPaymentSuccess({
            checkoutRequestId: requestId,
            mpesaReceiptNumber: data.data.mpesaReceiptNumber,
            amount: data.data.amount,
          });
          return;
        }

        attempts++;
        if (attempts < maxAttempts) {
          setTimeout(checkStatus, 6000); // Check every 6 seconds
        } else {
          setPaymentStatus("timeout");
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
        return <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />;
      case "success":
        return <CheckCircle className="w-8 h-8 text-green-500" />;
      case "failed":
      case "timeout":
        return <AlertCircle className="w-8 h-8 text-red-500" />;
      default:
        return <Smartphone className="w-8 h-8 text-orange-500" />;
    }
  };

  const getStatusMessage = () => {
    switch (paymentStatus) {
      case "processing":
        return "Check your phone for the M-Pesa payment prompt...";
      case "success":
        return "Payment completed successfully!";
      case "failed":
        return "Payment failed. Please try again.";
      case "timeout":
        return "Payment verification timed out.";
      default:
        return "Enter your M-Pesa number to pay for your order";
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
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
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
            </CardContent>
          </Card>

          {/* Payment Status */}
          <div className="text-center py-4">
            <div className="mb-3">{getStatusIcon()}</div>
            <p className="text-gray-700">{getStatusMessage()}</p>
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
                <p className="text-xs text-gray-500 mt-1">
                  Enter your Safaricom number (e.g., 0712345678)
                </p>
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
                      Processing...
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
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 mb-2">
                  Payment in Progress
                </h4>
                <p className="text-blue-700 text-sm mb-3">
                  A payment request has been sent to{" "}
                  <strong>{phoneNumber}</strong>
                </p>
                <div className="text-xs text-blue-600">
                  • Check your phone for the M-Pesa prompt
                  <br />
                  • Enter your M-Pesa PIN
                  <br />• Your order will be confirmed automatically
                </div>
              </div>
              <Button
                variant="outline"
                onClick={onClose}
                className="w-full"
                size="sm"
              >
                Cancel & Close
              </Button>
            </div>
          )}

          {/* Success State */}
          {paymentStatus === "success" && (
            <div className="text-center space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h4 className="font-semibold text-green-900 mb-2">
                  Payment Successful!
                </h4>
                <p className="text-green-700 text-sm">
                  Your order has been placed and payment confirmed.
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
                    ? "Payment Timeout"
                    : "Payment Failed"}
                </h4>
                <p className="text-red-700 text-sm">
                  {paymentStatus === "timeout"
                    ? "We couldn't verify your payment. If money was deducted, please contact support."
                    : "The payment could not be processed. Please try again."}
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
                  }}
                  className="flex-1"
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
