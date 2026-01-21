import { useState, useCallback, useRef, type ReactElement } from 'react';

import { Footer, AlertCard } from '@/components/ui';

import MortgageCoreCalc from './MortgageCoreCalc';
import MortgagePieChart from './MortgagePieChart';
import MortgageLineChart from './MortgageLineChart';

import type { MortgagePaymentBreakdown, AmortizationEntry } from './types';

function MortgageCalcPage(): ReactElement {
  const [paymentBreakdown, setPaymentBreakdown] = useState<MortgagePaymentBreakdown | null>(null);
  const [amortizationSchedule, setAmortizationSchedule] = useState<AmortizationEntry[]>([]);
  const [showRecalculate, setShowRecalculate] = useState<boolean>(false);
  const [isScheduleChanged, setIsScheduleChanged] = useState<boolean>(false);

  const coreCalcRef = useRef<{ getAmortizationSchedule: () => void } | null>(null);

  const handleFormValueChange = useCallback((breakdown: MortgagePaymentBreakdown): void => {
    setPaymentBreakdown(breakdown);
  }, []);

  const handleAmortizationSchedule = useCallback((schedule: AmortizationEntry[]): void => {
    setAmortizationSchedule(schedule);
    setShowRecalculate(false);
  }, []);

  const handleScheduleChanged = useCallback((): void => {
    if (!isScheduleChanged) {
      setIsScheduleChanged(true);
      setShowRecalculate(false);
      return;
    }
    setShowRecalculate(true);
  }, [isScheduleChanged]);

  const handleGenerateSchedule = useCallback((): void => {
    if (coreCalcRef.current) {
      coreCalcRef.current.getAmortizationSchedule();
    }
  }, []);

  return (
    <div className="mortgage-calc-container">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="pb-8">
            <h1 className="text-xl md:text-2xl font-bold text-gray-800 dark:text-white mb-4">
              How a mortgage calculator can help?
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Buying a <strong>Real-Estate-Property</strong> is one of the largest purchases most
              people will make, so you should think carefully about how you&apos;re going to finance
              it. You can adjust the property price, down payment and mortgage terms to see how your
              monthly payment will change.
            </p>
          </div>

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 px-3">
            <div className="xl:col-span-7">
              <MortgageCoreCalc
                boxShadow={false}
                onFormValueChange={handleFormValueChange}
                onAmortizationSchedule={handleAmortizationSchedule}
                onScheduleChanged={handleScheduleChanged}
              />
            </div>
            <div className="xl:col-span-5 xl:px-3">
              <MortgagePieChart data={paymentBreakdown} />
            </div>

            <div className="col-span-full p-3 my-8">
              <AlertCard
                variant="danger"
                content="Your monthly mortgage payment will depend on your Property price, Down payment, Loan term, Property taxes, Insurance, and Interest rate."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6">
            <div className="px-3">
              <MortgageLineChart
                schedule={amortizationSchedule}
                showRecalculate={showRecalculate}
                onGenerateSchedule={handleGenerateSchedule}
              />
            </div>

            <div className="px-4 py-6">
              <h4 className="mt-4 text-xl xl:text-2xl font-semibold text-gray-800 dark:text-white">
                What is Amortization Schedule Graph?
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Showing the amount of principal and the amount of interest that comprise each
                payment until the loan is paid off at the end of its term.
              </p>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Initially, most of your payment goes toward the interest rather than the principal.
                The loan amortization schedule will show as the term of your loan progresses, a
                larger share of your payment goes toward paying down the principal until the loan is
                paid in full at the end of your term.
              </p>

              <h4 className="mt-6 text-xl xl:text-2xl font-semibold text-gray-800 dark:text-white">
                Understanding an Amortization Schedule
              </h4>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                In an amortization schedule, the percentage of each payment that goes toward
                interest diminishes a bit with each payment and the percentage that goes toward
                principal increases.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="h-12" />
      <Footer />
    </div>
  );
}

export default MortgageCalcPage;
