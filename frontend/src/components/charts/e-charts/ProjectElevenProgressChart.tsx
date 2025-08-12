import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { PieChart } from 'echarts/charts';
import dayjs from 'dayjs';
import { getPastDates } from 'helpers/utils';
import { tooltipFormatterDefault } from 'helpers/echart-utils';
import { CallbackDataParams } from 'echarts/types/dist/shared';
echarts.use([TooltipComponent, PieChart]);

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
  color: [
    getThemeColor('gray-400'),
    getThemeColor('success'),
    getThemeColor('info'),
    getThemeColor('warning')
  ],
  tooltip: {
    trigger: 'axis',
    backgroundColor: getThemeColor('body-bg'),
    bordercolor: getThemeColor('secondary-bg'),
    formatter: (params: CallbackDataParams[]) =>
      tooltipFormatterDefault(params, 'MMM DD, YYYY', 'color'),
    axisPointer: {
      shadowStyle: {
        color: 'red'
      }
    }
  },
  legend: {
    bottom: '10',
    data: [
      {
        name: 'Open',
        icon: 'roundRect'
      },
      {
        name: 'Issues found',
        icon: 'roundRect'
      },
      {
        name: 'In Progress',
        icon: 'roundRect'
      }
    ],
    itemWidth: 16,
    itemHeight: 8,
    itemGap: 10,
    inactiveColor: getThemeColor('quaternary-color'),
    inactiveBorderWidth: 0,
    textStyle: {
      color: getThemeColor('body-color'),
      fontWeight: 600,
      fontSize: 16,
      fontFamily: 'Nunito Sans'
    }
  },
  xAxis: [
    {
      show: true,
      interval: 2,
      axisLine: {
        lineStyle: {
          type: 'solid',
          color: getThemeColor('tertiary-bg')
        }
      },
      axisLabel: {
        color: getThemeColor('body-color'),
        formatter: (data: string) => dayjs(data).format('D MMM'),
        interval: 5,
        align: 'left',
        margin: 20,
        fontSize: 12.8
      },
      axisTick: {
        show: true,
        length: 15
        // alignWithLabel: true
      },
      splitLine: {
        interval: 0,
        show: true,
        lineStyle: {
          color: getThemeColor('tertiary-bg'),
          type: 'dashed'
        }
      },
      type: 'category',
      boundaryGap: false,
      data: getPastDates(15)
    },
    {
      show: true,
      interval: 2,
      axisLine: {
        show: false
      },
      axisLabel: {
        show: false
      },
      axisTick: {
        show: false
      },
      splitLine: {
        interval: 1,
        show: true,
        lineStyle: {
          color: getThemeColor('tertiary-bg'),
          type: 'solid'
        }
      },
      boundaryGap: false,
      data: getPastDates(15)
    }
  ],
  yAxis: {
    show: true,
    type: 'value',
    axisLine: {
      lineStyle: {
        type: 'solid',
        color: getThemeColor('tertiary-bg')
      }
    },
    axisLabel: {
      color: getThemeColor('body-color'),
      margin: 20,
      fontSize: 12.8,
      interval: 0
    },
    splitLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('tertiary-bg'),
        type: 'solid'
      }
    },
    axisTick: {
      show: true,
      length: 15,
      alignWithLabel: true,
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    }
    // data: ['0', '10', '20']
  },
  series: [
    {
      name: 'Estimated',
      type: 'line',
      symbol: 'none',
      data: [20, 17.5, 15, 15, 15, 12.5, 10, 7.5, 5, 2.5, 2.5, 2.5, 0],
      lineStyle: {
        width: 0
      },
      areaStyle: {
        color: getThemeColor('primary-light'),
        opacity: 0.075
      },
      tooltip: {
        show: false
      }
    },
    {
      name: 'Issues found',
      type: 'line',
      symbolSize: 6,
      data: [3, 1, 2, 4, 3, 1]
    },
    {
      name: 'Open',
      type: 'line',
      symbolSize: 6,
      data: [6, 5, 4, 6, 5, 5]
    },
    {
      name: 'In Progress',
      type: 'line',
      symbolSize: 6,
      data: [11, 12, 11, 9, 11, 6]
    },
    {
      name: 'Actual',
      type: 'line',
      symbolSize: 6,
      data: [20, 19, 15, 14, 12, 8],
      lineStyle: {
        type: 'dashed'
      }
    }
  ],
  grid: {
    right: 5,
    left: 0,
    bottom: '15%',
    top: 20,
    containLabel: true
  }
});

const ProjectElevenProgressChart = () => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={{ minHeight: '320px', width: '100%' }}
    />
  );
};

export default ProjectElevenProgressChart;
