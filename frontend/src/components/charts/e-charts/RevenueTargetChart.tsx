import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const data1 = [42000, 35000, 35000, 40000];
const data2 = [30644, 33644, 28644, 38644];

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  color: [getThemeColor('primary'), getThemeColor('tertiary-bg')],
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
      tooltipFormatterDefault(params, 'MMM DD', 'color')
  },
  xAxis: {
    type: 'value',
    axisLabel: {
      show: true,
      interval: 3,
      showMinLabel: true,
      showMaxLabel: false,
      color: getThemeColor('quaternary-color'),
      align: 'left',
      fontFamily: 'Nunito Sans',
      fontWeight: 400,
      fontSize: 12.8,
      margin: 10,
      formatter: (value: number) => `${value / 1000}k`
    },
    show: true,
    axisLine: {
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    axisTick: false,
    splitLine: {
      show: false
    }
  },
  yAxis: {
    data: ['Luxemburg', 'Canada', 'Australia', 'India'],
    type: 'category',
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      interval: 5,
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLine: { show: false },
    axisLabel: {
      show: true,
      margin: 21,
      color: getThemeColor('body-color')
    }
  },
  series: [
    {
      name: 'Target',
      type: 'bar',
      label: {
        show: false
      },
      emphasis: {
        disabled: true
      },
      showBackground: true,
      backgroundStyle: {
        color: getThemeColor('body-highlight-bg')
      },
      barWidth: '30px',
      barGap: '-100%',
      data: data1,
      itemStyle: {
        borderWidth: 4,
        color: getThemeColor('secondary-bg'),
        bordercolor: getThemeColor('secondary-bg')
      }
    },
    {
      name: 'Gained',
      type: 'bar',
      emphasis: {
        disabled: true
      },
      label: {
        show: true,
        color: getThemeColor('white'),
        fontWeight: 700,
        fontFamily: 'Nunito Sans',
        fontSize: 12.8,
        formatter: (value: CallbackDataParams) =>
          `$${value.value.toLocaleString()}`
      },
      backgroundStyle: {
        color: getThemeColor('body-highlight-bg')
      },
      barWidth: '30px',
      data: data2,
      itemStyle: {
        borderWidth: 4,
        color: getThemeColor('primary-light'),
        bordercolor: getThemeColor('secondary-bg')
      }
    }
  ],
  grid: {
    right: 0,
    left: 0,
    bottom: 8,
    top: 0,
    containLabel: true
  },
  animation: false
});

const RevenueTargetChart = ({ style }: { style: CSSProperties }) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={style}
    />
  );
};

export default RevenueTargetChart;
