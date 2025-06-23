import { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { getPastDates } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { tooltipFormatterList } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart]);

const dates = getPastDates(4);

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
    formatter: tooltipFormatterList
  },
  xAxis: {
    type: 'value',
    inverse: true,
    axisLabel: {
      show: false
    },
    show: false,
    data: dates,
    axisLine: {
      lineStyle: {
        color: getThemeColor('tertiary-bg')
      }
    },
    axisTick: false
  },
  yAxis: {
    data: ['Closed Won', 'Objection', 'Offer', 'Qualify Lead', 'Created'],
    type: 'category',
    axisPointer: { type: 'none' },
    axisTick: 'none',
    splitLine: {
      interval: 5,
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisLine: { show: false },
    axisLabel: {
      show: true,
      align: 'left',
      margin: 100,
      color: getThemeColor('body-color')
    }
  },
  series: {
    name: 'Lead Conversion',
    type: 'bar',
    barWidth: '20px',
    showBackground: true,
    backgroundStyle: {
      borderRadius: [4, 0, 0, 4]
    },
    data: [
      {
        value: 1060,
        itemStyle: {
          color: !isDark
            ? getThemeColor('success-lighter')
            : getThemeColor('success-dark'),
          borderRadius: [4, 0, 0, 4]
        },
        emphasis: {
          itemStyle: {
            color: !isDark
              ? getThemeColor('success-light')
              : getThemeColor('success-dark')
          },
          label: {
            formatter: () => `{b| 53% }`,
            rich: {
              b: {
                color: getThemeColor('white')
              }
            }
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => `{b| 53%}`,
          rich: {
            b: {
              color: !isDark
                ? getThemeColor('success-dark')
                : getThemeColor('success-subtle'),
              fontWeight: 500,
              padding: [0, 5, 0, 0]
            }
          }
        }
      },
      {
        value: 1200,
        itemStyle: {
          color: !isDark
            ? getThemeColor('info-lighter')
            : getThemeColor('info-dark'),
          borderRadius: [4, 0, 0, 4]
        },
        emphasis: {
          itemStyle: {
            color: !isDark
              ? getThemeColor('info-light')
              : getThemeColor('info-dark')
          },
          label: {
            formatter: () => `{b| 60% }`,
            rich: {
              b: {
                color: getThemeColor('white')
              }
            }
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => `{b| 60%}`,
          rich: {
            b: {
              color: !isDark
                ? getThemeColor('info-dark')
                : getThemeColor('info-bg-subtle'),
              fontWeight: 500,
              padding: [0, 5, 0, 0]
            }
          }
        }
      },
      {
        value: 1600,
        itemStyle: {
          color: !isDark
            ? getThemeColor('primary-lighter')
            : getThemeColor('primary-dark'),
          borderRadius: [4, 0, 0, 4]
        },
        emphasis: {
          itemStyle: {
            color: !isDark
              ? getThemeColor('primary-light')
              : getThemeColor('primary-dark')
          },
          label: {
            formatter: () => `{b| 80% }`,
            rich: {
              b: {
                color: getThemeColor('white')
              }
            }
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => `{b| 80% }`,
          rich: {
            b: {
              color: !isDark
                ? getThemeColor('primary-dark')
                : getThemeColor('primary-bg-subtle'),
              fontWeight: 500,
              padding: [0, 5, 0, 0]
            }
          }
        }
      },
      {
        value: 1800,
        itemStyle: {
          color: !isDark
            ? getThemeColor('warning-lighter')
            : getThemeColor('warning-dark'),
          borderRadius: [4, 0, 0, 4]
        },
        emphasis: {
          itemStyle: {
            color: !isDark
              ? getThemeColor('warning-light')
              : getThemeColor('warning-dark')
          },
          label: {
            formatter: () => `{b| 90% }`,
            rich: {
              b: {
                color: getThemeColor('white')
              }
            }
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => `{b|90%}`,
          rich: {
            b: {
              color: !isDark
                ? getThemeColor('warning-dark')
                : getThemeColor('warning-bg-subtle'),
              fontWeight: 500,
              padding: [0, 5, 0, 0]
            }
          }
        }
      },
      {
        value: 2000,
        itemStyle: {
          color: !isDark
            ? getThemeColor('danger-lighter')
            : getThemeColor('danger-dark'),
          borderRadius: [4, 0, 0, 4]
        },
        emphasis: {
          itemStyle: {
            color: !isDark
              ? getThemeColor('danger-light')
              : getThemeColor('danger-dark')
          },
          label: {
            formatter: () => `{a|100%}`,
            rich: {
              a: {
                color: getThemeColor('white')
              }
            }
          }
        },
        label: {
          show: true,
          position: 'inside',
          formatter: () => `{a|100%}`,
          rich: {
            a: {
              color: !isDark
                ? getThemeColor('danger-dark')
                : getThemeColor('danger-bg-subtle'),
              fontWeight: 500
            }
          }
        }
      }
    ],
    barGap: '50%'
  },
  grid: {
    right: 5,
    left: 100,
    bottom: 0,
    top: '5%',
    containLabel: false
  },
  animation: false
});

const LeadConversationChart = ({ style }: { style: CSSProperties }) => {
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

export default LeadConversationChart;
