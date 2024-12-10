import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Check, CreditCard, Truck, Lock } from 'lucide-react';

const CheckoutProcess = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    // Shipping Details
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // Payment Details
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: ''
  });

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Sample cart summary data
  const cartSummary = {
    items: [
      { name: 'Wireless Earbuds', quantity: 1, price: 99.99 },
      { name: 'Smart Watch', quantity: 2, price: 199.99 }
    ],
    subtotal: 499.97,
    shipping: 0,
    total: 499.97
  };

  const renderStepIndicator = () => (
    <div className="flex justify-between mb-8">
      {['Shipping', 'Payment', 'Review'].map((label, index) => (
        <div key={label} className="flex items-center">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              step > index + 1
                ? 'bg-green-500 text-white'
                : step === index + 1
                ? 'bg-black text-white'
                : 'bg-gray-200'
            }`}
          >
            {step > index + 1 ? <Check className="w-5 h-5" /> : index + 1}
          </div>
          <div
            className={`hidden md:block ml-2 ${
              step >= index + 1 ? 'text-black' : 'text-gray-400'
            }`}
          >
            {label}
          </div>
          {index < 2 && (
            <div className="w-12 md:w-24 h-1 mx-2 bg-gray-200">
              <div
                className={`h-full ${
                  step > index + 1 ? 'bg-green-500' : 'bg-gray-200'
                }`}
              ></div>
            </div>
          )}
        </div>
      ))}
    </div>
  );

  const renderShippingForm = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Address</label>
        <input
          type="text"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">City</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <input
            type="text"
            name="state"
            value={formData.state}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">ZIP Code</label>
          <input
            type="text"
            name="zipCode"
            value={formData.zipCode}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentForm = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Card Number</label>
        <div className="relative">
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="1234 5678 9012 3456"
          />
          <CreditCard className="absolute right-3 top-2.5 text-gray-400 w-5 h-5" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Card Holder Name</label>
        <input
          type="text"
          name="cardHolder"
          value={formData.cardHolder}
          onChange={handleInputChange}
          className="w-full p-2 border rounded-md"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Expiry Date</label>
          <input
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="MM/YY"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">CVV</label>
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleInputChange}
            className="w-full p-2 border rounded-md"
            placeholder="123"
          />
        </div>
      </div>
    </div>
  );

  const renderReview = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Shipping Address</h3>
              <button
                onClick={() => setStep(1)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p>{`${formData.firstName} ${formData.lastName}`}</p>
              <p>{formData.address}</p>
              <p>{`${formData.city}, ${formData.state} ${formData.zipCode}`}</p>
              <p>{formData.phone}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Payment Method</h3>
              <button
                onClick={() => setStep(2)}
                className="text-sm text-blue-600 hover:underline"
              >
                Edit
              </button>
            </div>
            <div className="text-sm text-gray-600">
              <p>Card ending in {formData.cardNumber.slice(-4)}</p>
              <p>{formData.cardHolder}</p>
              <p>Expires {formData.expiryDate}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      {renderStepIndicator()}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <Card>
            <CardContent className="p-6">
              {step === 1 && renderShippingForm()}
              {step === 2 && renderPaymentForm()}
              {step === 3 && renderReview()}
              
              <div className="mt-6 flex justify-between">
                {step > 1 && (
                  <button
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border rounded-md hover:bg-gray-50"
                  >
                    Back
                  </button>
                )}
                <button
                  onClick={() => {
                    if (step < 3) setStep(step + 1);
                    else {
                      // Handle order submission
                      console.log('Order submitted:', { formData, cartSummary });
                    }
                  }}
                  className="ml-auto px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
                >
                  {step === 3 ? 'Place Order' : 'Continue'}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4">Order Summary</h2>
              <div className="space-y-4">
                {cartSummary.items.map((item, index) => (
                  <div key={index} className="flex justify-between text-sm">
                    <span>
                      {item.name} x {item.quantity}
                    </span>
                    <span>${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
                <div className="border-t pt-4">
                  <div className="flex justify-between mb-2">
                    <span>Subtotal</span>
                    <span>${cartSummary.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-2">
                    <span>Shipping</span>
                    <span>
                      {cartSummary.shipping === 0
                        ? 'Free'
                        : `$${cartSummary.shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${cartSummary.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Truck className="w-4 h-4" />
              <span>Free shipping on orders over Rs. 150</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Lock className="w-4 h-4" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutProcess;