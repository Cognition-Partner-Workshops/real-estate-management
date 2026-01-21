export interface MortgageFormValues {
  price: string;
  downPayment: string;
  interest: number;
  term: number;
  propertyTax: string;
  insurance: string;
}

export interface MortgagePaymentBreakdown {
  totalMonth: number;
  interest: number;
  tax: number;
  insurance: number;
}

export interface AmortizationEntry {
  payment: number;
  principal: number;
  interest: number;
  balance: number;
  accInterest: number;
  accPrincipal: number;
  date: string;
}

export interface MortgageCalculationResult {
  monthPayment: number;
  monthAllPayment: string;
  monthInterest: number;
  monthTax: string;
  monthInsurance: string;
  monthPrincipal: number;
  monthBalance: number;
  lifetimeTotal: string;
}
