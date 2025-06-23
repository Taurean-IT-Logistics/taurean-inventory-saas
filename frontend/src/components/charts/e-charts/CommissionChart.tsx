import React, { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';

echarts.use([TooltipComponent, BarChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  color: string = 'primary'
) => ({
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: (params: CallbackDataParams) => {
      return `<strong>${params.seriesName}:</strong> ${params.value}%`;
    }
  },
  series: [
    {
      type: 'gauge',
      name: 'Commission',
      startAngle: 90,
      endAngle: -270,
      radius: '90%',
      pointer: {
        show: false
      },
      progress: {
        show: true,
        overlap: false,
        roundCap: true,
        clip: false,
        itemStyle: {
          color: getThemeColor(color)
        }
      },
      axisLine: {
        lineStyle: {
          width: 3,
          color: [[1, getThemeColor('secondary-bg')]]
        }
      },
      splitLine: {
        show: false
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        show: false
      },
      data: [
        {
          value: 70
        }
      ],
      detail: {
        show: false
      }
    }
  ]
});

const CommissionChart = ({
  style,
  color
}: {
  style: CSSProperties;
  color?: string;
}) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, color)}
      style={style}
    />
  );
};

export default CommissionChart;
