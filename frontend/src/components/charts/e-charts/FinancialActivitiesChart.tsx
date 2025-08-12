import {
  CSSProperties,
  MutableRefObject,
  forwardRef,
  useCallback,
  useEffect,
  useMemo
} from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterDefault } from 'helpers/echart-utils';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { FinancialActivitiesData } from 'data/travel-agency/travelAgency';
echarts.use([TooltipComponent, BarChart]);

const FinancialActivitiesChart = forwardRef<
  EChartsReactCore | null,
  {
    style?: CSSProperties;
  }
>(({ style }, ref) => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();

  const chartRef = ref as MutableRefObject<EChartsReactCore | null>;

  const getDefaultOptions = useMemo(
    () => ({
      color: [getThemeColor('primary'), getThemeColor('tertiary-bg')],
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
        formatter: (params: CallbackDataParams[]) =>
          tooltipFormatterDefault(params, 'MMM DD', 'color')
      },
      legend: {
        data: ['Profit', 'Revenue', 'Expenses'],
        show: false
      },

      xAxis: {
        axisLabel: {
          show: true,
          margin: 12,
          color: getThemeColor('secondary-text-emphasis'),
          formatter: (value: number) =>
            `${Math.abs(Math.round((value / 1000) * 10) / 10)}k`,
          fontFamily: 'Nunito Sans',
          fontWeight: 700
        },
        splitLine: {
          lineStyle: {
            color: getThemeColor('border-color-translucent')
          }
        }
      },

      yAxis: {
        axisTick: {
          show: false
        },
        data: [
          'NOV-DEC',
          'SEP-OCT',
          'JUL-AUG',
          'MAY-JUN',
          'MAR-APR',
          'JAN-FEB'
        ],
        axisLabel: {
          show: true,
          color: getThemeColor('secondary-text-emphasis'),
          margin: 8,
          fontFamily: 'Nunito Sans',
          fontWeight: 700
        },
        axisLine: {
          lineStyle: {
            color: getThemeColor('border-color-translucent')
          }
        }
      },
      series: [
        {
          name: 'Profit',
          stack: 'Total',
          type: 'bar',
          barWidth: 8,
          roundCap: true,
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
            color: isDark
              ? getThemeColor('primary')
              : getThemeColor('primary-light')
          },
          data: FinancialActivitiesData.profitData[0]
        },
        {
          name: 'Revenue',
          type: 'bar',
          barWidth: 8,
          barGap: '100%',
          stack: 'Total',
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: [4, 0, 0, 4],
            color: isDark
              ? getThemeColor('success')
              : getThemeColor('success-light')
          },
          data: FinancialActivitiesData.revenueData[0]
        },
        {
          name: 'Expenses',
          type: 'bar',
          barWidth: 8,
          emphasis: {
            focus: 'series'
          },
          itemStyle: {
            borderRadius: [4, 0, 0, 4],
            color: isDark ? getThemeColor('info') : getThemeColor('info-light')
          },
          data: FinancialActivitiesData.expensesData[0]
        }
      ],
      grid: {
        right: 20,
        left: 3,
        bottom: 0,
        top: 16,
        containLabel: true
      },
      animation: false
    }),
    [getThemeColor, isDark]
  );

  const updateDimensions = useCallback(() => {
    if (window.innerWidth < 576) {
      chartRef?.current?.getEchartsInstance().setOption({
        yAxis: {
          axisLabel: {
            show: false
          }
        },
        grid: {
          left: 15
        }
      });
    } else if (window.innerWidth < 768) {
      chartRef.current?.getEchartsInstance().setOption({
        yAxis: {
          axisLabel: {
            margin: 32,
            show: true
          }
        },
        grid: {
          left: 3
        }
      });
    } else if (window.innerWidth <= 1540) {
      chartRef.current?.getEchartsInstance().setOption({
        yAxis: {
          axisLabel: {
            show: false
          }
        },
        grid: {
          left: 15
        }
      });
    } else {
      chartRef.current?.getEchartsInstance().setOption({
        yAxis: {
          axisLabel: {
            show: true
          }
        },
        grid: {
          left: 3
        }
      });
    }
  }, []);

  useEffect(() => {
    if (chartRef.current) {
      updateDimensions();
    }
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return (
    <ReactEChartsCore
      echarts={echarts}
      ref={chartRef}
      option={getDefaultOptions}
      style={style}
      className="echart-financial-Activities"
    />
  );
});

export default FinancialActivitiesChart;
