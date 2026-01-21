import { useRef, useMemo, useEffect, type ReactElement } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

import { Card, Button } from '@/components/ui';
import { useAppSelector } from '@/store';

import type { AmortizationEntry } from './types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface MortgageLineChartProps {
  schedule: AmortizationEntry[];
  showRecalculate: boolean;
  onGenerateSchedule: () => void;
}

const CHART_COLORS = {
  balance: 'green',
  principal: 'blue',
  interest: '#d0001d91',
};

function MortgageLineChart({
  schedule,
  showRecalculate,
  onGenerateSchedule,
}: MortgageLineChartProps): ReactElement {
  const chartRef = useRef<ChartJS<'line'>>(null);
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  const processedSchedule = useMemo((): AmortizationEntry[] => {
    let filteredSchedule = [...schedule];
    if (filteredSchedule.length > 151) {
      filteredSchedule = filteredSchedule.filter((_, index) => {
        if (index === filteredSchedule.length - 1) {
          return true;
        }
        return index % 2 === 0;
      });
    }
    return filteredSchedule;
  }, [schedule]);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [isDarkMode, processedSchedule]);

  const fontColor = isDarkMode ? '#fff' : '#333';

  const dates = processedSchedule.map((item) => item.date);
  const balanceData = processedSchedule.map((item) => item.balance);
  const principalData = processedSchedule.map((item) => item.accPrincipal);
  const interestData = processedSchedule.map((item) => item.accInterest);

  const chartData = {
    labels: dates,
    datasets: [
      {
        label: 'Balance',
        data: balanceData,
        borderColor: CHART_COLORS.balance,
        backgroundColor: CHART_COLORS.balance,
      },
      {
        label: 'Principal',
        data: principalData,
        borderColor: CHART_COLORS.principal,
        backgroundColor: CHART_COLORS.principal,
      },
      {
        label: 'Interest',
        data: interestData,
        borderColor: 'red',
        backgroundColor: CHART_COLORS.interest,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: fontColor,
        },
      },
      title: {
        display: true,
        text: 'Amortization Schedule',
        color: fontColor,
        font: {
          size: 18,
        },
      },
    },
    scales: {
      x: {
        ticks: {
          color: fontColor,
        },
      },
      y: {
        ticks: {
          color: fontColor,
        },
      },
    },
    elements: {
      point: {
        radius: 0,
      },
    },
  };

  const handleRecalculate = (): void => {
    onGenerateSchedule();
    setTimeout(() => {
      if (chartContainerRef.current) {
        chartContainerRef.current.scrollIntoView({ behavior: 'smooth' });
      }
    }, 600);
  };

  return (
    <Card className="relative border border-slate-200 dark:border-slate-700 dark:bg-gray-800">
      <Card.Body className="p-0">
        <div ref={chartContainerRef} className={`chart-container p-4 ${showRecalculate ? 'blur-sm' : ''}`}>
          <Line ref={chartRef} data={chartData} options={chartOptions} />
        </div>

        {showRecalculate && (
          <div className="absolute top-0 left-0 h-full w-full bg-black/30 flex justify-center items-center">
            <Button onClick={handleRecalculate} className="flex items-center gap-2">
              Re-Calculate
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
            </Button>
          </div>
        )}
      </Card.Body>
    </Card>
  );
}

export default MortgageLineChart;
