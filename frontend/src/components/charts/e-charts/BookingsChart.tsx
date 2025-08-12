import React, { CSSProperties, MutableRefObject, forwardRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { LineChart } from 'echarts/charts';
import { getPastDates, rgbaColor } from 'helpers/utils';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from 'helpers/echart-utils';
import dayjs from 'dayjs';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { bookingsData } from 'data/travel-agency/travelAgency';

echarts.use([TooltipComponent, LineChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: getThemeColor('body-highlight-bg'),
  legend: {
    data: ['Fulfilled', 'Cancelled'],
    itemWidth: 16,
    itemHeight: 16,
    icon: 'circle',
    itemGap: 32,
    left: 0,
    inactiveColor: getThemeColor('quaternary-color'),
    textStyle: {
      color: getThemeColor('secondary-color'),
      fontWeight: 600,
      fontFamily: 'Nunito Sans'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'none'
    },
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: (params: CallbackDataParams[]) => tooltipFormatterDefault(params)
  },
  xAxis: {
    type: 'category',
    axisLabel: {
      color: getThemeColor('secondary-text-emphasis'),
      formatter: (value: number) => dayjs(value).format('MMM DD'),

      fontFamily: 'Nunito Sans',
      fontWeight: 600,
      fontSize: 12.8
    },
    data: getPastDates(8),
    axisLine: {
      lineStyle: {
        color: getThemeColor('border-color-translucent')
      }
    },
    axisTick: false
  },
  yAxis: {
    axisLabel: {
      color: getThemeColor('body-color'),
      formatter: (value: number) => `${Math.abs(Math.round(value / 1000))}K`,
      fontWeight: 700,
      fontFamily: 'Nunito Sans'
    },
    splitLine: {
      interval: 10,
      lineStyle: {
        color: getThemeColor('border-color-translucent')
      }
    }
  },
  series: [
    {
      name: 'Fulfilled',
      type: 'bar',
      stack: 'one',
      data: bookingsData.fullfilledData[0],
      barWidth: '27%',
      itemStyle: {
        borderRadius: [4, 4, 0, 0],
        color: isDark ? getThemeColor('info') : getThemeColor('info-light')
      }
    },
    {
      name: 'Cancelled',
      type: 'bar',
      stack: 'one',
      barWidth: '27%',
      data: bookingsData.cencelledData[0],
      itemStyle: {
        borderRadius: [0, 0, 4, 4],
        color: isDark
          ? rgbaColor(getThemeColor('info'), 0.5)
          : getThemeColor('info-lighter')
      }
    }
  ],
  grid: { left: 0, right: 8, top: 52, bottom: 0, containLabel: true }
});

const BookingsChart = forwardRef<
  EChartsReactCore | null,
  {
    style?: CSSProperties;
  }
>(({ style }, ref) => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();
  const chartRef = ref as MutableRefObject<EChartsReactCore | null>;

  return (
    <ReactEChartsCore
      echarts={echarts}
      ref={chartRef}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={style}
    />
  );
});

export default BookingsChart;
