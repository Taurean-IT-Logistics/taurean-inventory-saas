import React, { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterList } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  data: number[],
  dates: Date[],
  color: string = 'primary'
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
  xAxis: {
    type: 'category',
    data: dates,
    show: false,
    boundaryGap: false
  },

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
        color: getThemeColor(color)
      },
      itemStyle: {
        color: getThemeColor(color)
      },
      showSymbol: false,
      symbol: 'circle'
    }
  ],
  grid: { left: 5, right: 5, top: 5, bottom: 0 }
});

const BaseLineChart = ({
  style,
  data,
  dates,
  color
}: {
  data: number[];
  dates: Date[];
  style: CSSProperties;
  color?: string;
}) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, data, dates, color)}
      style={style}
    />
  );
};

export default BaseLineChart;
