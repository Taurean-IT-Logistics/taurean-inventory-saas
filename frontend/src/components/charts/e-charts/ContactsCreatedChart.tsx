import React, { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { getPastDates } from 'helpers/utils';
import dayjs from 'dayjs';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const dates = getPastDates(9);

const data1 = [24, 14, 30, 24, 32, 32, 18, 12, 32];

const data2 = [36, 28, 36, 39, 54, 38, 22, 34, 52];

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  color: [getThemeColor('primary'), getThemeColor('tertiary-bg')],
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('tertiary-bg'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: (params: CallbackDataParams[]) =>
      tooltipFormatterDefault(params, 'MMM DD', 'color')
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      color: getThemeColor('secondary-color'),
      formatter: (value: string) => dayjs(value).format('D MMM, YY'),
      fontFamily: 'Nunito Sans',
      fontWeight: 600,
      fontSize: 10.24,
      padding: [0, 0, 0, 20]
    },
    splitLine: {
      show: true,
      interval: '10',
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    show: true,
    interval: 10,
    data: dates,
    axisLine: {
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    axisTick: false
  },
  yAxis: {
    axisPointer: { type: 'none' },
    position: 'right',
    axisTick: 'none',
    splitLine: {
      interval: 5,
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLine: { show: false },
    axisLabel: {
      fontFamily: 'Nunito Sans',
      fontWeight: 700,
      fontSize: 12.8,
      color: getThemeColor('body-color'),
      margin: 20,
      verticalAlign: 'bottom',
      formatter: (value: string) => `${value.toLocaleString()}`
    }
  },
  series: [
    {
      name: 'Actual revenue',
      type: 'bar',
      data: data1,
      barWidth: '4px',
      barGap: '3',
      label: {
        show: false,
        position: 'top',
        color: getThemeColor('body-color'),
        fontWeight: 'bold',
        fontSize: '10.24px'
      },
      emphasis: {
        label: {
          show: true
        }
      },
      z: 10,
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: getThemeColor('tertiary-bg')
      }
    },
    {
      name: 'Projected revenue',
      type: 'bar',
      barWidth: '4px',
      data: data2,
      label: {
        show: false,
        position: 'top',
        color: getThemeColor('primary'),
        fontWeight: 'bold',
        fontSize: '10.24px'
      },
      emphasis: {
        label: {
          show: true
        }
      },
      itemStyle: {
        borderRadius: [2, 2, 0, 0],
        color: getThemeColor('primary')
      }
    }
  ],
  grid: {
    right: 3,
    left: 6,
    bottom: 0,
    top: '5%',
    containLabel: true
  },
  animation: false
});

const ContactsCreatedChart = ({ style }: { style: CSSProperties }) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={style}
    />
  );
};

export default ContactsCreatedChart;
