import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
echarts.use([TooltipComponent, PieChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: [
    !isDark ? getThemeColor('info-light') : getThemeColor('info-dark'),
    !isDark ? getThemeColor('warning-light') : getThemeColor('warning-dark'),
    !isDark ? getThemeColor('danger-light') : getThemeColor('danger-dark'),
    !isDark ? getThemeColor('success-light') : getThemeColor('success-dark'),
    getThemeColor('primary')
  ],
  tooltip: {
    trigger: 'item'
  },
  responsive: true,
  maintainAspectRatio: false,

  series: [
    {
      name: 'Tasks assigned to me',
      type: 'pie',
      radius: ['48%', '90%'],
      startAngle: 30,
      avoidLabelOverlap: false,
      // label: {
      //   show: false,
      //   position: 'center'
      // },

      label: {
        show: false,
        position: 'center',
        formatter: '{x|{d}%} \n {y|{b}}',
        rich: {
          x: {
            fontSize: 31.25,
            fontWeight: 800,
            color: getThemeColor('tertiary-color'),
            padding: [0, 0, 5, 15]
          },
          y: {
            fontSize: 12.8,
            color: getThemeColor('tertiary-color'),
            fontWeight: 600
          }
        }
      },
      emphasis: {
        label: {
          show: true
        }
      },
      labelLine: {
        show: false
      },
      data: [
        { value: 78, name: 'Product design' },
        { value: 63, name: 'Development' },
        { value: 56, name: 'QA & Testing' },
        { value: 36, name: 'Customer queries' },
        { value: 24, name: 'R & D' }
      ]
    }
  ],
  grid: {
    bottom: 0,
    top: 0,
    left: 0,
    right: 0,
    containLabel: false
  }
});

const IssuesDiscoveredChart = () => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={{ minHeight: '390px', width: '100%' }}
    />
  );
};

export default IssuesDiscoveredChart;
