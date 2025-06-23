import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { getPastDates, rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import dayjs from 'dayjs';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart, LineChart]);

const dates = getPastDates(7);

const data1 = [2000, 5700, 3700, 5500, 8000, 4000, 5500];
const data2 = [10500, 9000, 7000, 9000, 10400, 7500, 9300];

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: [getThemeColor('primary-lighter'), getThemeColor('info-light')],
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: (params: CallbackDataParams[]) =>
      tooltipFormatterDefault(params, 'MMM DD, YYYY', 'color')
  },
  xAxis: {
    type: 'category',
    data: dates,
    axisLabel: {
      color: getThemeColor('body-color'),
      formatter: (value: number) => dayjs(value).format('ddd'),
      fontFamily: 'Nunito Sans',
      fontWeight: 400,
      fontSize: 12.8,
      margin: 16
    },
    axisLine: {
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisTick: false
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLabel: {
      color: getThemeColor('body-color'),
      fontFamily: 'Nunito Sans',
      fontWeight: 700,
      fontSize: 12.8,
      margin: 24,
      formatter: (value: number) => `${value / 1000}k`
    }
    // interval: 1000,
  },
  series: [
    {
      name: 'Revenue',
      type: 'bar',
      barWidth: '16px',
      label: {
        show: false
      },
      itemStyle: {
        color: !isDark
          ? getThemeColor('primary-lighter')
          : getThemeColor('primary'),

        borderRadius: [4, 4, 0, 0]
      },
      data: data2
    },
    {
      name: 'Profit',
      type: 'line',
      symbol: 'circle',
      symbolSize: 11,
      itemStyle: {
        color: getThemeColor('info-light'),
        borderColor: !isDark
          ? getThemeColor('white')
          : getThemeColor('light-text-emphasis'),
        borderWidth: 2
      },
      areaStyle: {
        color: {
          type: 'linear',
          x: 0,
          y: 0,
          x2: 0,
          y2: 1,
          colorStops: [
            {
              offset: 0,
              color: rgbaColor(getThemeColor('info-light'), 0.2)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('info-light'), 0.2)
            }
          ]
        }
      },
      data: data1
    }
  ],
  grid: {
    right: '0',
    left: '0',
    bottom: 0,
    top: 10,
    containLabel: true
  },
  animation: false
});

const AnalyticsSalesTrendsChart = ({ style }: { style: CSSProperties }) => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();
  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={style}
    />
  );
};

export default AnalyticsSalesTrendsChart;
