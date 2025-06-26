import React, { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { rgbaColor } from 'helpers/utils';
import dayjs from 'dayjs';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterList } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  data: number[],
  dates: Date[]
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
      show: true,
      boundaryGap: false,
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('DD MMM, YY'),
        showMinLabel: true,
        showMaxLabel: false,
        color: getThemeColor('secondary-color'),
        align: 'left',
        interval: 5,
        fontFamily: 'Nunito Sans',
        fontWeight: 600,
        fontSize: 12.8
      }
    },
    {
      type: 'category',
      position: 'bottom',
      show: true,
      data: dates,
      axisLabel: {
        formatter: (value: string) => dayjs(value).format('DD MMM, YY'),
        interval: 130,
        showMaxLabel: true,
        showMinLabel: false,
        color: getThemeColor('secondary-color'),
        align: 'right',
        fontFamily: 'Nunito Sans',
        fontWeight: 600,
        fontSize: 12.8
      },
      axisLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      boundaryGap: false
    }
  ],
  yAxis: {
    show: false,
    type: 'value',
    boundaryGap: false
  },
  series: [
    {
      type: 'line',
      data,
      lineStyle: {
        width: 2,
        color: getThemeColor('info')
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
              color: rgbaColor(getThemeColor('info'), 0.2)
            },
            {
              offset: 1,
              color: rgbaColor(getThemeColor('info'), 0)
            }
          ]
        }
      },
      showSymbol: false,
      symbol: 'circle'
    }
  ],
  grid: { left: 0, right: 0, top: 5, bottom: 20 }
});

const BasicLineChart = ({
  style,
  dates,
  data
}: {
  data: number[];
  dates: Date[];
  style: CSSProperties;
}) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, data, dates)}
      style={style}
    />
  );
};

export default BasicLineChart;
