import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { getPastDates } from 'helpers/utils';
import dayjs from 'dayjs';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterList } from 'helpers/echart-utils';
import { ThemeVariant } from 'config';

echarts.use([TooltipComponent, BarChart]);

const dates = getPastDates(11);
const currentMonthData = [
  2000, 2250, 1070, 1200, 1000, 1450, 3100, 2900, 1800, 1450, 1700
];

const prevMonthData = [
  1100, 1200, 2700, 1700, 2100, 2000, 2300, 1200, 2600, 2900, 1900
];

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  theme: ThemeVariant
) => ({
  tooltip: {
    trigger: 'axis',
    padding: 10,
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: tooltipFormatterList
  },
  xAxis: [
    {
      type: 'category',
      data: dates,
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('DD MMM, YY'),
        interval: 3,
        showMinLabel: true,
        showMaxLabel: false,
        color: getThemeColor('secondary-color'),
        align: 'left',
        fontFamily: 'Nunito Sans',
        fontWeight: 700,
        fontSize: 12.8,
        margin: 15
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: getThemeColor('tertiary-bg')
        }
      },
      axisTick: {
        show: true,
        interval: 5
      },
      boundaryGap: false
    },
    {
      type: 'category',
      position: 'bottom',
      data: dates,
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('DD MMM, YY'),
        interval: 130,
        showMaxLabel: true,
        showMinLabel: false,
        color: getThemeColor('body-color'),
        align: 'right',
        fontFamily: 'Nunito Sans',
        fontWeight: 700,
        fontSize: 12.8,
        margin: 15
      },
      axisLine: {
        show: true,
        lineStyle: {
          color: getThemeColor('tertiary-bg')
        }
      },
      axisTick: {
        show: true
      },
      splitLine: {
        show: false
      },
      boundaryGap: false
    }
  ],
  yAxis: {
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      show: true,
      lineStyle: {
        color:
          theme === 'dark'
            ? getThemeColor('body-highlight-bg')
            : getThemeColor('secondary-bg')
      }
    },
    axisLine: { show: false },
    axisLabel: {
      show: true,
      fontFamily: 'Nunito Sans',
      fontWeight: 700,
      fontSize: 12.8,
      color: getThemeColor('body-color'),
      margin: 25,
      // verticalAlign: 'bottom',
      formatter: (value: number) => `${value / 1000}k`
    }
    // axisLabel: { show: true }
  },
  series: [
    {
      name: 'e',
      type: 'line',
      data: prevMonthData,
      // symbol: 'none',
      lineStyle: {
        type: 'line',
        width: 3,
        color: getThemeColor('info-lighter')
      },
      showSymbol: false,
      symbol: 'emptyCircle',
      symbolSize: 6,
      itemStyle: {
        color: getThemeColor('info-lighter'),
        borderWidth: 3
      }
    },
    {
      name: 'd',
      type: 'line',
      data: currentMonthData,
      showSymbol: false,
      symbol: 'emptyCircle',
      symbolSize: 6,
      itemStyle: {
        color: getThemeColor('primary'),
        borderWidth: 3
      },

      lineStyle: {
        type: 'line',
        width: 3,
        color: getThemeColor('primary')
      }
    }
  ],
  grid: {
    right: 2,
    left: 5,
    bottom: '10px',
    top: '2%',
    containLabel: true
  },
  animation: false
});

const AdClicksChart = ({ style }: { style: CSSProperties }) => {
  const {
    config: { theme },
    getThemeColor
  } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, theme)}
      style={style}
    />
  );
};

export default AdClicksChart;
