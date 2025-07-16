import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  auth,
  signInWithGoogle,
  logout,
  isAuthenticated,
  getCurrentUserId,
} from "@/lib/firebase";
import { useApp } from "@/contexts/AppContext";
import {
  User,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
} from "lucide-react";

const FirebaseDebug = () => {
  const { state } = useApp();
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authStatus, setAuthStatus] = useState("checking");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setFirebaseUser(user);
      setAuthStatus(user ? "authenticated" : "not_authenticated");
    });

    return () => unsubscribe();
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error("Google sign-in failed:", error);
    }
  };

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Sign-out failed:", error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "authenticated":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "not_authenticated":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "authenticated":
        return "bg-green-100 text-green-800";
      case "not_authenticated":
        return "bg-red-100 text-red-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="w-6 h-6" />
          <span>Firebase Authentication Status</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* App Context User */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            <User className="w-5 h-5" />
            <span>App Context User</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            {state.user ? (
              <div className="space-y-2">
                <Badge className="bg-blue-100 text-blue-800">Logged In</Badge>
                <div className="text-sm space-y-1">
                  <div>
                    <strong>ID:</strong> {state.user.id}
                  </div>
                  <div>
                    <strong>Name:</strong> {state.user.name}
                  </div>
                  <div>
                    <strong>Email:</strong> {state.user.email}
                  </div>
                  <div>
                    <strong>Role:</strong> {state.user.role}
                  </div>
                </div>
              </div>
            ) : (
              <Badge className="bg-gray-100 text-gray-800">Not Logged In</Badge>
            )}
          </div>
        </div>

        {/* Firebase Auth User */}
        <div className="space-y-2">
          <h3 className="text-lg font-semibold flex items-center space-x-2">
            {getStatusIcon(authStatus)}
            <span>Firebase Authentication</span>
          </h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2 mb-3">
              <Badge className={getStatusColor(authStatus)}>
                {authStatus === "authenticated"
                  ? "Authenticated"
                  : authStatus === "not_authenticated"
                    ? "Not Authenticated"
                    : "Checking..."}
              </Badge>
            </div>
            {firebaseUser ? (
              <div className="text-sm space-y-1">
                <div>
                  <strong>UID:</strong> {firebaseUser.uid}
                </div>
                <div>
                  <strong>Display Name:</strong>{" "}
                  {firebaseUser.displayName || "N/A"}
                </div>
                <div>
                  <strong>Email:</strong> {firebaseUser.email}
                </div>
                <div>
                  <strong>Photo URL:</strong>{" "}
                  {firebaseUser.photoURL ? "Yes" : "No"}
                </div>
                <div>
                  <strong>Provider:</strong>{" "}
                  {firebaseUser.providerData[0]?.providerId || "N/A"}
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-600">
                No Firebase user authenticated
              </p>
            )}
          </div>
        </div>

        {/* Authentication Actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Actions</h3>
          <div className="flex space-x-3">
            {!firebaseUser ? (
              <Button
                onClick={handleGoogleSignIn}
                className="bg-blue-600 hover:bg-blue-700"
              >
                Sign in with Google
              </Button>
            ) : (
              <Button onClick={handleSignOut} variant="outline">
                Sign out of Firebase
              </Button>
            )}
          </div>
        </div>

        {/* Status Explanation */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h4 className="font-semibold text-blue-900 mb-2">
            💡 Understanding Authentication
          </h4>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>App Context User:</strong> Your login state in the Mealy
              app (email/password or Google)
            </p>
            <p>
              <strong>Firebase Authentication:</strong> Required for saving data
              to Firebase (orders, transactions)
            </p>
            <p className="pt-2 border-t border-blue-200">
              {!firebaseUser && state.user && (
                <span className="text-blue-900 font-medium">
                  ⚠️ You're logged into Mealy but not Firebase. Sign in with
                  Google to sync data across devices!
                </span>
              )}
              {firebaseUser && state.user && (
                <span className="text-green-700 font-medium">
                  ✅ Perfect! You're authenticated with both systems. Your data
                  will sync across devices.
                </span>
              )}
              {!state.user && (
                <span className="text-gray-600">
                  Please log into Mealy first, then sign in with Google for full
                  functionality.
                </span>
              )}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default FirebaseDebug;
