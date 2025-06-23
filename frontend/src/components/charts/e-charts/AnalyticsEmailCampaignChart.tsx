import { useEffect, useRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import EChartsReactCore from 'echarts-for-react/lib/core';

echarts.use([TooltipComponent, BarChart]);

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const tooltipFormatter = (params: any) => {
  const el = params[1];

  const tooltipItem = `<div class='ms-1'>
    <h6 class="text-body-tertiary"><span class="d-inline-block rounded-circle me-2" style="height: 0.6rem; width: 0.6rem; background:${
      el.color
    }"></span>
        ${el.axisValue} : ${
          typeof el.value === 'object' ? el.value[1] : el.value
        }
      </h6>
    </div>`;

  return `<div>
            <p class='mb-2 text-body-tertiary'>
              ${el.seriesName}
            </p>
            ${tooltipItem}
          </div>`;
};

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: [getThemeColor('primary'), getThemeColor('tertiary-bg')],
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    axisPointer: {
      type: 'none'
    },
    formatter: tooltipFormatter
  },
  xAxis: {
    type: 'category',
    data: ['Total Emails', 'Sent', 'Bounce', 'Delivered'],
    splitLine: { show: false },
    axisLabel: {
      color: getThemeColor('body-color'),
      fontFamily: 'Nunito Sans',
      fontWeight: 400,
      fontSize: 12.8,
      margin: 24,
      rotate: 30,
      formatter: (value: string) => `${value.slice(0, 5)}...`
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    axisTick: false
  },
  yAxis: {
    type: 'value',
    splitLine: {
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLabel: {
      color: getThemeColor('body-color'),
      fontFamily: 'Nunito Sans',
      fontWeight: 700,
      fontSize: 12.8,
      margin: 24
      // formatter: value => value / 1000,
    },
    interval: 500
  },
  series: [
    {
      name: 'Placeholder',
      type: 'bar',
      barWidth: '64px',
      stack: 'Total',
      backgroundColor: getThemeColor('white'),
      label: {
        show: false
      },
      itemStyle: {
        borderColor: 'transparent',
        color: 'transparent'
      },
      emphasis: {
        itemStyle: {
          borderColor: 'transparent',
          color: 'transparent'
        }
      },
      data: [0, 1466, 966, 0]
    },
    {
      name: 'Email Campaign',
      type: 'bar',
      stack: 'Total',
      itemStyle: {
        color: !isDark
          ? getThemeColor('primary-lighter')
          : getThemeColor('primary-darker')
      },
      data: [
        {
          value: 2832,
          itemStyle: {
            color: !isDark
              ? getThemeColor('primary-light')
              : getThemeColor('primary-dark')
          }
        },
        1366,
        500,
        966
      ],
      label: {
        show: true,
        position: 'inside',
        color: !isDark
          ? getThemeColor('emphasis-color')
          : getThemeColor('white'),

        fontWeight: 'normal',
        fontSize: '12.8px',
        formatter: (value: { value: string }) =>
          `${value.value.toLocaleString()}`
      }
    }
  ],
  grid: {
    right: '0',
    left: 6,
    bottom: 10,
    top: '5%',
    containLabel: true
  },
  animation: false
});

const AnalyticsEmailCampaignChart = ({ className }: { className: string }) => {
  const chartRef = useRef<null | EChartsReactCore>(null);
  const updateDimensions = () => {
    if (window.innerWidth < 576) {
      chartRef.current?.getEchartsInstance().setOption({
        series: [
          {
            barWidth: '48px'
          }
        ],
        xAxis: {
          axisLabel: {
            show: true,
            rotate: 30,
            formatter: (value: string) => `${value.slice(0, 5)}...`
          }
        }
      });
    } else if (window.innerWidth < 768) {
      chartRef.current?.getEchartsInstance().setOption({
        series: [
          {
            barWidth: '64px'
          }
        ],
        xAxis: {
          axisLabel: {
            show: true,
            formatter: (value: string) => `${value.slice(0, 11)}`,
            rotate: 0
          }
        }
      });
    } else if (window.innerWidth < 992) {
      chartRef.current?.getEchartsInstance().setOption({
        series: [
          {
            barWidth: '56px'
          }
        ],
        xAxis: {
          axisLabel: {
            show: false
          }
        }
      });
    } else if (window.innerWidth > 992) {
      chartRef.current?.getEchartsInstance().setOption({
        series: [
          {
            barWidth: '64px'
          }
        ],
        xAxis: {
          axisLabel: {
            show: true,
            rotate: 0,
            formatter: (value: string) => `${value.slice(0, 11)}`
          }
        }
      });
    }
  };
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  useEffect(() => {
    updateDimensions();
  }, [chartRef.current]);

  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();
  return (
    <ReactEChartsCore
      ref={chartRef}
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, isDark)}
      className={className}
    />
  );
};

export default AnalyticsEmailCampaignChart;
