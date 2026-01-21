import { useState, useEffect, useCallback, useMemo, type ReactElement } from 'react';
import { Link } from 'react-router-dom';

import { Card, Input, AlertCard } from '@/components/ui';

import type {
  MortgageFormValues,
  MortgagePaymentBreakdown,
  AmortizationEntry,
  MortgageCalculationResult,
} from './types';

interface MortgageCoreCalcProps {
  payPerYear?: number;
  simpleMode?: boolean;
  boxShadow?: boolean;
  onFormValueChange?: (breakdown: MortgagePaymentBreakdown) => void;
  onAmortizationSchedule?: (schedule: AmortizationEntry[]) => void;
  onScheduleChanged?: () => void;
}

const DEFAULT_VALUES: MortgageFormValues = {
  price: '300,000',
  downPayment: '100,000',
  interest: 5,
  term: 30,
  propertyTax: '150',
  insurance: '300',
};

const SIMPLE_MODE_VALUES: MortgageFormValues = {
  ...DEFAULT_VALUES,
  propertyTax: '0',
  insurance: '0',
};

function formatNumberWithCommas(value: string): string {
  const numericValue = value.replace(/\D/g, '');
  return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function parseFormattedNumber(value: string): number {
  return Number(value.replace(/,/g, ''));
}

function MortgageCoreCalc({
  payPerYear = 12,
  simpleMode = false,
  boxShadow = true,
  onFormValueChange,
  onAmortizationSchedule,
  onScheduleChanged,
}: MortgageCoreCalcProps): ReactElement {
  const initialValues = simpleMode ? SIMPLE_MODE_VALUES : DEFAULT_VALUES;

  const [formValues, setFormValues] = useState<MortgageFormValues>(initialValues);
  const [monthlyPayment, setMonthlyPayment] = useState<string>('0');
  const [lifetimePayment, setLifetimePayment] = useState<string>('0');

  const isDownPaymentGreater = useMemo((): boolean => {
    const price = parseFormattedNumber(formValues.price);
    const downPayment = parseFormattedNumber(formValues.downPayment);
    return downPayment >= price;
  }, [formValues.price, formValues.downPayment]);

  const isFormValid = useMemo((): boolean => {
    const price = parseFormattedNumber(formValues.price);
    const downPayment = parseFormattedNumber(formValues.downPayment);
    return (
      price > 0 &&
      downPayment > 0 &&
      downPayment < price &&
      formValues.interest > 0 &&
      formValues.interest <= 20 &&
      formValues.term > 0 &&
      formValues.term <= 30
    );
  }, [formValues]);

  const calculateMonthlyPayment = useCallback(
    (
      price: number,
      interest: number,
      term: number,
      propertyTax: string,
      insurance: string,
      payPerYearValue: number,
      isSimpleMode: boolean
    ): MortgageCalculationResult | null => {
      const payPerTotal = term * payPerYearValue;
      if (!price) {
        return null;
      }

      const interestRate = interest / 100;
      const monthInterest = price * (interestRate / payPerYearValue);
      const topB = Math.pow(1 + interestRate / payPerYearValue, payPerTotal);
      const bottom = Math.pow(1 + interestRate / payPerYearValue, payPerTotal) - 1;
      const top = monthInterest * topB;
      const monthPayment = Number(Math.floor(top / bottom).toFixed(4));

      let total = Math.round(top / bottom);
      if (!isSimpleMode) {
        total = propertyTax ? total + Number(propertyTax) : total;
        total = insurance ? total + Number(insurance) : total;
      }

      return {
        monthPayment,
        monthAllPayment: total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
        monthInterest,
        monthTax: propertyTax,
        monthInsurance: insurance,
        monthPrincipal: monthPayment - monthInterest,
        monthBalance: price - (monthPayment - monthInterest),
        lifetimeTotal: (total * payPerTotal).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ','),
      };
    },
    []
  );

  const getMonthlyCalculate = useCallback((): void => {
    if (!isFormValid) {
      return;
    }

    const { price, downPayment, interest, term, propertyTax, insurance } = formValues;
    const numPrice = parseFormattedNumber(price);
    const numDownPayment = parseFormattedNumber(downPayment);

    const result = calculateMonthlyPayment(
      numPrice - numDownPayment,
      interest,
      term,
      propertyTax,
      insurance,
      payPerYear,
      simpleMode
    );

    if (!result) {
      return;
    }

    setMonthlyPayment(result.monthAllPayment);
    setLifetimePayment(result.lifetimeTotal);

    if (onFormValueChange) {
      onFormValueChange({
        totalMonth: Number(result.monthPayment),
        interest: Number(result.monthInterest),
        tax: Number(result.monthTax),
        insurance: Number(result.monthInsurance),
      });
    }

    if (onScheduleChanged) {
      onScheduleChanged();
    }
  }, [formValues, isFormValid, payPerYear, simpleMode, calculateMonthlyPayment, onFormValueChange, onScheduleChanged]);

  const getAmortizationSchedule = useCallback((): void => {
    const { price, downPayment, interest, term, propertyTax, insurance } = formValues;
    const numPrice = parseFormattedNumber(price);
    const numDownPayment = parseFormattedNumber(downPayment);

    const result = calculateMonthlyPayment(
      numPrice - numDownPayment,
      interest,
      term,
      propertyTax,
      insurance,
      payPerYear,
      simpleMode
    );

    if (!result) {
      return;
    }

    const numberOfPayments = payPerYear * term;
    const date = new Date();

    let report: AmortizationEntry = {
      payment: result.monthPayment,
      principal: result.monthPrincipal,
      interest: result.monthInterest,
      balance: result.monthBalance,
      accInterest: result.monthInterest,
      accPrincipal: result.monthPrincipal,
      date: date.toLocaleDateString(),
    };

    const amortization: AmortizationEntry[] = [report];

    for (let i = 0; i < numberOfPayments; i++) {
      const isLast = i === numberOfPayments - 1;
      const payment = isLast ? report.payment + (report.balance - report.principal) : report.payment;
      const balance = isLast
        ? 0
        : Number((Number(report.balance.toFixed(2)) - Number(report.principal.toFixed(2))).toFixed(2));
      const int = Number(
        (Number(report.balance.toFixed(2)) * (interest / 100 / payPerYear)).toFixed(2)
      );
      const principal = Number((Number(report.payment.toFixed(2)) - int).toFixed(2));
      const accPrincipal = report.accPrincipal + principal;
      const accInterest = report.accInterest + int;
      date.setMonth(date.getMonth() + 1);

      report = {
        payment,
        principal,
        interest: int,
        balance,
        accInterest,
        accPrincipal,
        date: date.toLocaleDateString(),
      };
      amortization.push(report);
    }

    if (onAmortizationSchedule) {
      onAmortizationSchedule(amortization);
    }
  }, [formValues, payPerYear, simpleMode, calculateMonthlyPayment, onAmortizationSchedule]);

  useEffect(() => {
    const timer = setTimeout(() => {
      getMonthlyCalculate();
      getAmortizationSchedule();
    }, 1000);

    return (): void => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleInputChange = useCallback(
    (field: keyof MortgageFormValues, value: string | number): void => {
      if (field === 'price' || field === 'downPayment') {
        const formattedValue = formatNumberWithCommas(String(value));
        setFormValues((prev) => ({ ...prev, [field]: formattedValue }));
      } else if (field === 'interest' || field === 'term') {
        setFormValues((prev) => ({ ...prev, [field]: Number(value) }));
      } else {
        setFormValues((prev) => ({ ...prev, [field]: String(value) }));
      }
    },
    []
  );

  useEffect(() => {
    const debounceTimer = setTimeout(() => {
      getMonthlyCalculate();
    }, 500);

    return (): void => clearTimeout(debounceTimer);
  }, [formValues, getMonthlyCalculate]);

  const cardClassName = `max-h-[520px] border border-slate-200 dark:border-slate-700 dark:bg-gray-800 ${
    !boxShadow ? 'shadow-none' : ''
  }`;

  return (
    <Card className={cardClassName}>
      <Card.Header className="px-4 py-2 xl:py-3 dark:border-slate-700">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
          Monthly {simpleMode ? '' : '& Lifetime'} payments
        </h2>
      </Card.Header>

      <Card.Body className="p-4">
        <form>
          <div className="grid grid-cols-1 gap-4">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">$</span>
              <Input
                label="Price:"
                value={formValues.price}
                onChange={(e): void => handleInputChange('price', e.target.value)}
                className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-500">$</span>
                <Input
                  label="Down Payment:"
                  value={formValues.downPayment}
                  onChange={(e): void => handleInputChange('downPayment', e.target.value)}
                  error={isDownPaymentGreater ? 'Down payment must be less than the Price' : undefined}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
              {isDownPaymentGreater && (
                <div className="mt-1.5">
                  <AlertCard content="Down payment must be less than the Price" />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2">
                <span className="text-gray-500">%</span>
                <Input
                  label="Interest Rate:"
                  type="number"
                  min={0}
                  max={20}
                  step={0.1}
                  value={formValues.interest}
                  onChange={(e): void => handleInputChange('interest', e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>

              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <Input
                  label="Loan Term (years):"
                  type="number"
                  min={0}
                  max={30}
                  step={0.5}
                  value={formValues.term}
                  onChange={(e): void => handleInputChange('term', e.target.value)}
                  className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                />
              </div>
            </div>

            {!simpleMode && (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    label="Property Tax (monthly):"
                    type="number"
                    min={0}
                    value={formValues.propertyTax}
                    onChange={(e): void => handleInputChange('propertyTax', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <Input
                    label="Property Insurance (monthly):"
                    type="number"
                    min={0}
                    value={formValues.insurance}
                    onChange={(e): void => handleInputChange('insurance', e.target.value)}
                    className="dark:bg-gray-700 dark:text-white dark:border-gray-600"
                  />
                </div>
              </>
            )}

            <div className={`grid ${simpleMode ? 'grid-cols-1' : 'grid-cols-2'} gap-4 pt-4 border-t border-slate-200 dark:border-slate-700`}>
              <div className="bg-green-50 dark:bg-green-900/30 rounded-lg p-3">
                <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Monthly
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">$</span>
                  <span className="text-xl font-bold text-gray-800 dark:text-white">
                    {monthlyPayment}
                  </span>
                </div>
              </div>

              {!simpleMode && (
                <div className="bg-blue-50 dark:bg-blue-900/30 rounded-lg p-3">
                  <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                    Total Lifetime
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">$</span>
                    <span className="text-xl font-bold text-gray-800 dark:text-white">
                      {lifetimePayment}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {simpleMode && (
              <div className="flex justify-center border-t border-slate-200 dark:border-slate-700 pt-3">
                <Link
                  to="/mortgage-calc"
                  className="text-blue-500 hover:text-blue-600 hover:underline"
                >
                  Mortgage Calculator
                </Link>
              </div>
            )}
          </div>
        </form>
      </Card.Body>
    </Card>
  );
}

export default MortgageCoreCalc;
