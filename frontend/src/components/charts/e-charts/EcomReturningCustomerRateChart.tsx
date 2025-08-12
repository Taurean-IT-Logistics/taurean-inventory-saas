import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart, LineChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { tooltipFormatterDefault } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart, LineChart]);

type DataSeries = {
  name: string;
  data: number[];
  lineType?: 'solid' | 'dashed';
  colorKey: string;
};

type ChartProps = {
  months: string[];
  dataSeries: DataSeries[];
};

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  months: string[],
  dataSeries: DataSeries[]
) => {
  const hasData = dataSeries.some(series => series.data.length > 0);

  return {
    color: getThemeColor('body-highlight-bg'),
    legend: {
      data: dataSeries.map(series => ({
        name: series.name,
        icon: 'roundRect',
        itemStyle: {
          color: getThemeColor(series.colorKey),
          borderWidth: 0
        }
      })),
      right: 'right',
      itemWidth: 16,
      itemHeight: 8,
      itemGap: 20,
      top: 3,
      inactiveColor: getThemeColor('quaternary-color'),
      inactiveBorderWidth: 0,
      textStyle: {
        color: getThemeColor('body-color'),
        fontWeight: 600,
        fontFamily: 'Nunito Sans'
      }
    },
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'none'
      },
      padding: [7, 10],
      backgroundColor: getThemeColor('body-highlight-bg'),
      borderColor: getThemeColor('border-color'),
      textStyle: { color: getThemeColor('light-text-emphasis') },
      borderWidth: 1,
      transitionDuration: 0,
      formatter: (params: CallbackDataParams[]) =>
        tooltipFormatterDefault(params)
    },
    xAxis: {
      type: 'category',
      data: months,
      show: true,
      boundaryGap: false,
      axisLine: {
        lineStyle: { color: getThemeColor('tertiary-bg') }
      },
      axisTick: { show: false },
      axisLabel: {
        showMinLabel: false,
        showMaxLabel: false,
        color: getThemeColor('secondary-color'),
        formatter: (value: string) => value.slice(0, 3),
        fontFamily: 'Nunito Sans',
        fontWeight: 600,
        fontSize: 12.8
      },
      splitLine: {
        show: true,
        lineStyle: { color: getThemeColor('secondary-bg'), type: 'dashed' }
      }
    },
    yAxis: {
      type: 'value',
      boundaryGap: false,
      axisLabel: {
        showMinLabel: true,
        showMaxLabel: true,
        color: getThemeColor('secondary-color'),
        formatter: (value: number) => `${value}%`,
        fontFamily: 'Nunito Sans',
        fontWeight: 600,
        fontSize: 12.8
      },
      splitLine: {
        show: true,
        lineStyle: { color: getThemeColor('secondary-bg') }
      }
    },
    series: hasData
      ? dataSeries.map(series => ({
          name: series.name,
          type: 'line',
          data: series.data,
          showSymbol: false,
          symbol: 'circle',
          symbolSize: 10,
          emphasis: {
            lineStyle: { width: series.lineType === 'dashed' ? 1 : 3 }
          },
          lineStyle: {
            width: series.lineType === 'dashed' ? 1 : 3,
            type: series.lineType || 'solid',
            color: getThemeColor(series.colorKey)
          },
          itemStyle: {
            borderColor: getThemeColor(series.colorKey),
            borderWidth: 3
          }
        }))
      : [],
    grid: { left: 0, right: 8, top: '14%', bottom: 0, containLabel: true },
    ...(hasData
      ? {}
      : {
          graphic: {
            type: 'text',
            left: 'center',
            top: 'middle',
            style: {
              text: 'No data available',
              fill: getThemeColor('secondary-color'),
              fontSize: 16,
              fontWeight: 600,
              fontFamily: 'Nunito Sans'
            }
          }
        })
  };
};

const EcomReturningCustomerRateChart = ({ months, dataSeries }: ChartProps) => {
  const { getThemeColor } = useAppContext();

  return dataSeries && months ? (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, months, dataSeries)}
      style={{ height: '300px', width: '100%' }}
    />
  ) : (
    <div>No Data available to display</div>
  );
};

export default EcomReturningCustomerRateChart;
