import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import {
  CallbackDataParams,
  TooltipPositionCallbackParams
} from 'echarts/types/dist/shared';
import { type Size, TopCouponChartTooltip } from 'helpers/echart-utils';

echarts.use([TooltipComponent, PieChart]);
const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  color: [
    getThemeColor('primary'),
    getThemeColor('primary-lighter'),
    getThemeColor('info-dark')
  ],

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
    ) => TopCouponChartTooltip(point, params, el, rect, size),
    formatter: (params: CallbackDataParams) =>
      `<strong>${params.name}:</strong> ${params.percent}%`
  },
  legend: { show: false },
  series: [
    {
      name: '72%',
      type: 'pie',
      radius: ['100%', '87%'],
      avoidLabelOverlap: false,
      emphasis: {
        scale: false,
        itemStyle: {
          color: 'inherit'
        }
      },
      itemStyle: {
        borderWidth: 2,
        borderColor: getThemeColor('body-bg')
      },
      label: {
        show: true,
        position: 'center',
        formatter: '{a}',
        fontSize: 23,
        color: getThemeColor('light-text-emphasis')
      },
      data: [
        { value: 7200000, name: 'Percentage discount' },
        { value: 1800000, name: 'Fixed card discount' },
        { value: 1000000, name: 'Fixed product discount' }
      ]
    }
  ],
  grid: { containLabel: true }
});

const EcomTopCouponsChart = () => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={{ height: '115px', width: '100%' }}
    />
  );
};

export default EcomTopCouponsChart;
