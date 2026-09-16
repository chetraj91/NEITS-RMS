import api from "./axios";

// =====================================================
// CREATE CUSTOMER PAYMENT
// =====================================================

export async function createCustomerPayment(
  data: {
    customerId: string;
    amount: number;
    paymentDate?: string;
    paymentMethod?: string;
    remarks?: string;
  }
) {
  const response = await api.post(
    "/customer-payments",
    data
  );

  return response.data;
}