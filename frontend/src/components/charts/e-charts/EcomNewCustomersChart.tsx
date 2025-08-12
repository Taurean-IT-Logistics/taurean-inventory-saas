import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { getDates } from 'helpers/utils';
import dayjs from 'dayjs';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterList } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const getDefaultOptions = (getThemeColor: (name: string) => string) => ({
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
      data: getDates(
        new Date('5/1/2022'),
        new Date('5/7/2022'),
        1000 * 60 * 60 * 24
      ),
      show: true,
      boundaryGap: false,
      axisLine: {
        show: true,
        lineStyle: { color: getThemeColor('secondary-bg') }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        formatter: (value: Date) => dayjs(value).format('DD MMM'),
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
      data: getDates(
        new Date('5/1/2022'),
        new Date('5/7/2022'),
        1000 * 60 * 60 * 24
      ),
      axisLabel: {
        formatter: (value: Date) => dayjs(value).format('DD MMM'),
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
      data: [150, 100, 300, 200, 250, 180, 250],
      showSymbol: false,
      symbol: 'circle',
      lineStyle: {
        width: 2,
        color: getThemeColor('secondary-bg')
      },
      emphasis: {
        lineStyle: {
          color: getThemeColor('secondary-bg')
        }
      },
      itemStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    {
      type: 'line',
      data: [200, 150, 250, 100, 500, 400, 600],
      lineStyle: {
        width: 2,
        color: getThemeColor('primary')
      },
      showSymbol: false,
      symbol: 'circle',
      itemStyle: {
        color: getThemeColor('primary')
      }
    }
  ],
  grid: { left: 0, right: 0, top: 5, bottom: 20 }
});

const EcomNewCustomersChart = () => {
  const { getThemeColor } = useAppContext();

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor)}
      style={{ height: '180px', width: '100%' }}
    />
  );
};

export default EcomNewCustomersChart;
