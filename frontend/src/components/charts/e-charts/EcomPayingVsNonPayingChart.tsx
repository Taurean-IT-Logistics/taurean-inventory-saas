import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { GaugeChart } from 'echarts/charts';
import {
  CallbackDataParams,
  TooltipPositionCallbackParams
} from 'echarts/types/dist/shared';
import { type Size, handleTooltipPosition } from 'helpers/echart-utils';
echarts.use([TooltipComponent, GaugeChart]);

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    position: (
      point: number[],
      params: TooltipPositionCallbackParams,
      el: HTMLDivElement,
      rect: null,
      size: Size
    ) => handleTooltipPosition(point, params, el, rect, size),
    formatter: (params: CallbackDataParams) => {
      return `<strong>${params.seriesName}:</strong> ${params.value}%`;
    }
  },
  legend: { show: false },
  series: [
    {
      type: 'gauge',
      center: ['50%', '60%'],
      name: 'Paying customer',
      startAngle: 180,
      endAngle: 0,
      min: 0,
      max: 100,
      splitNumber: 12,
      itemStyle: {
        color: getThemeColor('primary')
      },
      progress: {
        show: true,
        roundCap: true,
        width: 12,
        itemStyle: {
          shadowBlur: 0,
          shadowColor: '#0000'
        }
      },
      pointer: {
        show: false
      },
      axisLine: {
        roundCap: true,
        lineStyle: {
          width: 12,
          color: [[1, getThemeColor('primary-bg-subtle')]]
        }
      },
      axisTick: {
        show: false
      },
      splitLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      title: {
        show: false
      },
      detail: {
        show: false
      },
      data: [
        {
          value: 30
        }
      ]
    }
  ]
});

const EcomPayingVsNonPayingChart = () => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={{ height: '100%', width: '100%' }}
    />
  );
};

export default EcomPayingVsNonPayingChart;
