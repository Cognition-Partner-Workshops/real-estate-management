import { useRef, useEffect, type ReactElement } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, Title } from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

import { Card } from '@/components/ui';
import { useAppSelector } from '@/store';

import type { MortgagePaymentBreakdown } from './types';

ChartJS.register(ArcElement, Tooltip, Legend, Title);

interface MortgagePieChartProps {
  data: MortgagePaymentBreakdown | null;
}

const CHART_COLORS = {
  principal: '#428cff',
  interest: '#e0bb2e',
  tax: '#e04055',
  insurance: '#29c467',
};

function MortgagePieChart({ data }: MortgagePieChartProps): ReactElement {
  const chartRef = useRef<ChartJS<'doughnut'>>(null);
  const isDarkMode = useAppSelector((state) => state.ui.isDarkMode);

  useEffect(() => {
    if (chartRef.current) {
      chartRef.current.update();
    }
  }, [isDarkMode, data]);

  const fontColor = isDarkMode ? '#fff' : '#333';

  const chartData = {
    labels: ['Principal', 'Interest', 'Property Tax', 'Insurance'],
    datasets: [
      {
        label: 'Monthly Payment Breakdown',
        data: data
          ? [data.totalMonth - data.interest, data.interest, data.tax || 0, data.insurance || 0]
          : [0, 0, 0, 0],
        backgroundColor: [
          CHART_COLORS.principal,
          CHART_COLORS.interest,
          CHART_COLORS.tax,
          CHART_COLORS.insurance,
        ],
        borderWidth: 0,
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
          font: {
            size: 14,
          },
        },
      },
      title: {
        display: true,
        text: 'Monthly Payment Graph',
        color: fontColor,
        font: {
          size: 18,
        },
      },
    },
  };

  return (
    <Card className="flex justify-center h-full border border-slate-200 dark:border-slate-700 dark:bg-gray-800">
      <Card.Body className="h-full xl:max-h-[520px] xl:max-w-[500px] flex items-center justify-center">
        <div className="chart-container w-full h-full">
          <Doughnut ref={chartRef} data={chartData} options={chartOptions} />
        </div>
      </Card.Body>
    </Card>
  );
}

export default MortgagePieChart;
