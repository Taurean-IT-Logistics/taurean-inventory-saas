import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { contactSourceData } from 'data/crm/dashboardData';

echarts.use([TooltipComponent]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: [
    getThemeColor('primary'),
    getThemeColor('success'),
    getThemeColor('info'),
    !isDark ? getThemeColor('info-light') : getThemeColor('info-dark'),
    !isDark ? getThemeColor('danger-lighter') : getThemeColor('danger-darker'),
    !isDark ? getThemeColor('warning-light') : getThemeColor('warning-dark')
  ],
  tooltip: {
    trigger: 'item',
    borderWidth: 0
  },
  responsive: true,
  maintainAspectRatio: false,

  series: [
    {
      name: 'Contacts by Source',
      type: 'pie',
      radius: ['55%', '90%'],
      startAngle: 90,
      avoidLabelOverlap: false,
      itemStyle: {
        borderColor: getThemeColor('body-bg'),
        borderWidth: 3
      },

      label: {
        show: false
      },
      emphasis: {
        label: {
          show: false
        }
      },
      labelLine: {
        show: false
      },
      data: contactSourceData
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

const ContactsBySourceChart = ({ style }: { style: CSSProperties }) => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={style}
    />
  );
};

export default ContactsBySourceChart;
