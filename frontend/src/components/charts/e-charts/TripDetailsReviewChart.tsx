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
import classNames from 'classnames';
echarts.use([TooltipComponent, GaugeChart]);

interface TripDetailsReviewChartProps {
  stat: number;
  className?: string;
}

interface GetDefaultOptionProps {
  getThemeColor: (name: string) => string;
  stat: number;
}

const getDefaultOptions = ({ getThemeColor, stat }: GetDefaultOptionProps) => ({
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
    },
    extraCssText: 'z-index: 1000'
  },
  legend: { show: false },
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
        clip: false,
        itemStyle: {
          color: getThemeColor('primary')
        }
      },
      axisLine: {
        lineStyle: {
          width: 4,
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
      detail: {
        fontSize: '20px',
        color: getThemeColor('body-color'),
        offsetCenter: [0, '10%']
      },
      data: [
        {
          value: stat
        }
      ]
    }
  ]
});
const TripDetailsReviewChart = ({
  stat,
  className
}: TripDetailsReviewChartProps) => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions({
        getThemeColor: getThemeColor,
        stat
      })}
      style={{ height: 60, width: 60 }}
      className={classNames(className)}
    />
  );
};

export default TripDetailsReviewChart;
