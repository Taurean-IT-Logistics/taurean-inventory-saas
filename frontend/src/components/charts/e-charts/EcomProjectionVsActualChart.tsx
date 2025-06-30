import React, { useMemo } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CanvasRenderer } from 'echarts/renderers';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { useAppContext } from 'providers/AppProvider';
import dayjs from 'dayjs';
import { Transaction } from 'types';
import { tooltipFormatterDefault } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart, CanvasRenderer]);

interface Props {
  transactions: Transaction[];
  projections?: Record<string, number>; // format: { 'YYYY-MM-DD': number }
}

const EcomProjectionVsActualChart = ({
  transactions,
  projections = {}
}: Props) => {
  const { getThemeColor } = useAppContext();

  const dates = useMemo(() => {
    const today = dayjs();
    return Array.from({ length: 10 }, (_, i) =>
      today.subtract(9 - i, 'day').format('YYYY-MM-DD')
    );
  }, []);

  const actualRevenue = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const date of dates) totals[date] = 0;

    transactions.forEach(tx => {
      const txDate = dayjs(tx.createdAt).format('YYYY-MM-DD');
      if (totals[txDate] !== undefined) {
        totals[txDate] += tx.amount;
      }
    });

    return dates.map(date => totals[date] || 0);
  }, [transactions, dates]);

  const projectedRevenue = useMemo(() => {
    return dates.map(date => {
      if (projections[date] !== undefined) {
        return projections[date];
      }
      const index = dates.indexOf(date);
      return Math.round(actualRevenue[index] * 1.1);
    });
  }, [actualRevenue, projections, dates]);

  const hasData = actualRevenue.some(val => val > 0);

  const options = {
    color: [getThemeColor('primary'), getThemeColor('tertiary-bg')],
    tooltip: {
      trigger: 'axis',
      padding: [7, 10],
      backgroundColor: getThemeColor('body-highlight-bg'),
      borderColor: getThemeColor('border-color'),
      textStyle: { color: getThemeColor('light-text-emphasis') },
      borderWidth: 1,
      transitionDuration: 0,
      axisPointer: { type: 'none' },
      formatter: (params: CallbackDataParams[]) =>
        tooltipFormatterDefault(params, 'MMM DD', 'color')
    },
    legend: {
      data: ['Projected revenue', 'Actual revenue'],
      right: 'right',
      itemWidth: 16,
      itemHeight: 8,
      itemGap: 20,
      top: 3,
      inactiveColor: getThemeColor('quaternary-color'),
      textStyle: {
        color: getThemeColor('body-color'),
        fontWeight: 600,
        fontFamily: 'Nunito Sans'
      }
    },
    xAxis: [
      {
        type: 'category',
        data: dates,
        axisLabel: {
          color: getThemeColor('secondary-color'),
          formatter: (value: string) => dayjs(value).format('MMM DD'),
          interval: 3,
          fontFamily: 'Nunito Sans',
          fontWeight: 600,
          fontSize: 12.8
        },
        axisLine: { lineStyle: { color: getThemeColor('tertiary-bg') } },
        axisTick: false
      }
    ],
    yAxis: [
      {
        axisPointer: { type: 'none' },
        axisTick: 'none',
        splitLine: {
          interval: 5,
          lineStyle: { color: getThemeColor('secondary-bg') }
        },
        axisLine: { show: false },
        axisLabel: {
          fontFamily: 'Nunito Sans',
          fontWeight: 600,
          fontSize: 12.8,
          color: getThemeColor('secondary-color'),
          margin: 20,
          verticalAlign: 'bottom',
          formatter: (value: number) => `$${value.toLocaleString()}`
        }
      }
    ],
    series: hasData
      ? [
          {
            name: 'Projected revenue',
            type: 'bar',
            data: projectedRevenue,
            barWidth: '6px',
            barGap: '30%',
            label: { show: false },
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: getThemeColor('primary')
            }
          },
          {
            name: 'Actual revenue',
            type: 'bar',
            data: actualRevenue,
            barWidth: '6px',
            barGap: '30%',
            label: { show: false },
            z: 10,
            itemStyle: {
              borderRadius: [2, 2, 0, 0],
              color: getThemeColor('info-bg-subtle')
            }
          }
        ]
      : [
          {
            name: 'No data',
            type: 'bar',
            data: new Array(dates.length).fill(0),
            itemStyle: {
              color: getThemeColor('border-color')
            },
            barWidth: '6px'
          }
        ],
    grid: {
      right: 0,
      left: 3,
      bottom: 0,
      top: '15%',
      containLabel: true
    },
    animation: false
  };

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={options}
      notMerge={true}
      lazyUpdate={true}
      opts={{ renderer: 'canvas' }}
      style={{ height: 300, width: '100%' }}
    />
  );
};

export default EcomProjectionVsActualChart;
