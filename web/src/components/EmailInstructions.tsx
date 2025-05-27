
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Send, CheckCircle, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export const EmailInstructions = () => {
  const [copied, setCopied] = useState(false);

  const emailTemplate = `
  Country: Uganda
  Market: Nakasero
  Date: 2025-05-24
  Maize (kg): 1800
  Beans (kg): 2900
  Tomatoes (crate): 9500
  Rice (kg): 3200
  Onions (kg): 2100`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(emailTemplate);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <Card className="border-green-200 bg-green-50">
        <CardHeader>
          <CardTitle className="flex items-center text-green-800">
            <Mail className="h-5 w-5 mr-2" />
            How to Contribute Market Prices
          </CardTitle>
          <CardDescription className="text-green-700">
            Help build East Africa's largest crowdsourced market price database
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-white rounded-lg">
              <Mail className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <h3 className="font-semibold mb-1">1. Send Email</h3>
              <p className="text-sm text-gray-600">Send prices to send@marketmail.canktech.com</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <Send className="h-8 w-8 mx-auto mb-2 text-orange-600" />
              <h3 className="font-semibold mb-1">2. Auto Processing</h3>
              <p className="text-sm text-gray-600">We parse and validate your data</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <h3 className="font-semibold mb-1">3. Live Updates</h3>
              <p className="text-sm text-gray-600">Prices appear on dashboard instantly</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Email Template</CardTitle>
            <CardDescription>
              Copy this template and update with your market prices
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm relative">
              <pre className="whitespace-pre-wrap">{emailTemplate}</pre>
              <Button 
                size="sm" 
                variant="outline" 
                className="absolute top-2 right-2"
                onClick={copyToClipboard}
              >
                {copied ? <CheckCircle className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <div className="mt-4 space-y-2">
              <Badge variant="secondary">💡 Tip: Use consistent format</Badge>
              <Badge variant="secondary">📧 Send to: prices@marketmail.app</Badge>
              <Badge variant="secondary">⚡ Response time: ~2 minutes</Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Supported Markets</CardTitle>
            <CardDescription>
              Currently accepting prices from these markets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                {["Nakasero", "Owino", "Kisenyi", "Kalerwe", "Wandegeya", "Kabalagala"].map(market => (
                  <div key={market} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">{market}</span>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  <strong>New market?</strong> Just include it in your email and we'll add it to our database.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Formatting Guidelines</CardTitle>
            <CardDescription>
              Follow these rules for accurate data processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-green-700 mb-2">✅ Good Examples</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-green-50 p-2 rounded font-mono">Maize (kg): 1800</div>
                  <div className="bg-green-50 p-2 rounded font-mono">Tomatoes (crate): 9500</div>
                  <div className="bg-green-50 p-2 rounded font-mono">Market: Nakasero</div>
                  <div className="bg-green-50 p-2 rounded font-mono">Date: 2025-05-24</div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-red-700 mb-2">❌ Avoid These</h4>
                <div className="space-y-2 text-sm">
                  <div className="bg-red-50 p-2 rounded font-mono">Maize = 1800/-</div>
                  <div className="bg-red-50 p-2 rounded font-mono">Tomatoes approximately 9500</div>
                  <div className="bg-red-50 p-2 rounded font-mono">Nakasero market</div>
                  <div className="bg-red-50 p-2 rounded font-mono">Today's date</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
