import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  CreditCardIcon, 
  PlusIcon,
  TrashIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { loadStripe } from '@stripe/stripe-js';
import { 
  Elements, 
  CardElement, 
  useStripe, 
  useElements 
} from '@stripe/react-stripe-js';
import { apiService } from '@/services/api';
import { PaymentMethod } from '@/types';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

interface AddPaymentMethodFormProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const AddPaymentMethodForm: React.FC<AddPaymentMethodFormProps> = ({ onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);

  const addPaymentMethodMutation = useMutation(
    (paymentMethodId: string) => apiService.addPaymentMethod(paymentMethodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Payment method added successfully');
        onSuccess();
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to add payment method');
      },
    }
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      return;
    }

    setIsLoading(true);

    try {
      // Create payment method with Stripe
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: 'card',
        card: cardElement,
      });

      if (error) {
        toast.error(error.message || 'Failed to create payment method');
        setIsLoading(false);
        return;
      }

      if (paymentMethod) {
        // Add payment method to our backend
        await addPaymentMethodMutation.mutateAsync(paymentMethod.id);
      }
    } catch (error) {
      console.error('Error adding payment method:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
    },
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        
        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">​</span>
        
        <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <form onSubmit={handleSubmit}>
            <div>
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-primary-100">
                <CreditCardIcon className="h-6 w-6 text-primary-600" />
              </div>
              <div className="mt-3 text-center sm:mt-5">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Add Payment Method
                </h3>
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Enter your card details to add a new payment method.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-5">
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Card Details
                </label>
                <div className="border border-gray-300 rounded-md px-3 py-2">
                  <CardElement options={cardElementOptions} />
                </div>
              </div>
            </div>
            
            <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
              <button
                type="submit"
                disabled={!stripe || isLoading}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-primary-600 text-base font-medium text-white hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 sm:col-start-2 sm:text-sm disabled:opacity-50"
              >
                {isLoading ? 'Adding...' : 'Add Payment Method'}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

const PaymentSettings: React.FC = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const queryClient = useQueryClient();

  const { data: paymentMethodsData, isLoading, error } = useQuery(
    'paymentMethods',
    () => apiService.getPaymentMethods()
  );

  const deletePaymentMethodMutation = useMutation(
    (paymentMethodId: string) => apiService.deletePaymentMethod(paymentMethodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Payment method removed successfully');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to remove payment method');
      },
    }
  );

  const setDefaultPaymentMethodMutation = useMutation(
    (paymentMethodId: string) => apiService.setDefaultPaymentMethod(paymentMethodId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries('paymentMethods');
        toast.success('Default payment method updated');
      },
      onError: (error: any) => {
        toast.error(error.response?.data?.message || 'Failed to update default payment method');
      },
    }
  );

  const handleDeletePaymentMethod = (paymentMethod: PaymentMethod) => {
    if (window.confirm('Are you sure you want to remove this payment method?')) {
      deletePaymentMethodMutation.mutate(paymentMethod.id);
    }
  };

  const handleSetDefault = (paymentMethod: PaymentMethod) => {
    if (!paymentMethod.isDefault) {
      setDefaultPaymentMethodMutation.mutate(paymentMethod.id);
    }
  };

  const formatCardNumber = (last4: string) => {
    return `**** **** **** ${last4}`;
  };

  const formatExpiryDate = (month: number, year: number) => {
    return `${month.toString().padStart(2, '0')}/${year.toString().slice(-2)}`;
  };

  const getCardBrandIcon = (brand: string | undefined) => {
    const brandIcons: Record<string, string> = {
      visa: '💳',
      mastercard: '💳',
      amex: '💳',
      discover: '💳',
      default: '💳',
    };
    return brandIcons[brand?.toLowerCase() || 'default'] || '💳';
  };

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4">
        <div className="text-sm text-red-700">
          Failed to load payment methods. Please try again.
        </div>
      </div>
    );
  }

  const paymentMethods = paymentMethodsData?.data?.paymentMethods || [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Payment Settings</h1>
          <p className="mt-1 text-sm text-gray-600">
            Manage your payment methods and billing information.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          <button
            type="button"
            className="btn btn-primary"
            onClick={() => setShowAddModal(true)}
          >
            <PlusIcon className="h-4 w-4 mr-2" />
            Add Payment Method
          </button>
        </div>
      </div>

      {/* Payment Methods List */}
      <div className="card">
        <div className="card-header">
          <h3 className="text-lg font-medium text-gray-900">Saved Payment Methods</h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : paymentMethods.length === 0 ? (
            <div className="text-center py-8">
              <CreditCardIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No payment methods</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by adding a new payment method.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => setShowAddModal(true)}
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Payment Method
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {paymentMethods.map((method) => (
                <div
                  key={method.id}
                  className={`relative rounded-lg border p-4 ${
                    method.isDefault
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <span className="text-2xl">
                          {getCardBrandIcon(method.brand)}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {formatCardNumber(method.last4 || '0000')}
                          </h4>
                          {method.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500">
                          {method.brand?.toUpperCase()} • Expires {formatExpiryDate(method.expMonth || 1, method.expYear || 2025)}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      {!method.isDefault && (
                        <button
                          onClick={() => handleSetDefault(method)}
                          className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          disabled={setDefaultPaymentMethodMutation.isLoading}
                        >
                          Set Default
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePaymentMethod(method)}
                        className="inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-red-700 bg-red-50 hover:bg-red-100"
                        disabled={deletePaymentMethodMutation.isLoading}
                      >
                        <TrashIcon className="h-3 w-3 mr-1" />
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Security Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 0h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Your payment information is secure
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <p>
                We use Stripe to process your payment information. Your card details are encrypted and securely stored. 
                We never store your full card number on our servers.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Add Payment Method Modal */}
      {showAddModal && (
        <Elements stripe={stripePromise}>
          <AddPaymentMethodForm
            onSuccess={() => setShowAddModal(false)}
            onCancel={() => setShowAddModal(false)}
          />
        </Elements>
      )}
    </div>
  );
};

export default PaymentSettings;