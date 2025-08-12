import React, { CSSProperties } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { SunburstChart } from 'echarts/charts';

import { rgbaColor } from 'helpers/utils';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import { rtlTooltipFormatter } from 'helpers/echart-utils';

echarts.use([TooltipComponent, BarChart, SunburstChart]);
const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  // eslint-disable-next-line  @typescript-eslint/no-explicit-any
  data: any,
  colors: string[],
  isRTL: boolean,
  isDark: boolean
) => ({
  color: colors,
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    extraCssText: 'z-index: 1000',
    formatter: (params: CallbackDataParams) =>
      rtlTooltipFormatter(params, isRTL, isDark)
  },
  series: [
    {
      type: 'sunburst',
      center: ['50%', '50%'],
      data,
      // eslint-disable-next-line  @typescript-eslint/no-explicit-any
      sort(a: any, b: any) {
        if (a.depth === 1) {
          return b.getValue() - a.getValue();
        }
        return a.dataIndex - b.dataIndex;
      },
      label: {
        show: false
      },
      levels: [
        {},
        {
          r0: 0,
          r: 53,
          itemStyle: {
            borderWidth: 2,
            borderColor: getThemeColor('body-bg')
          },
          label: {
            show: false
          },
          blur: {
            itemStyle: {
              borderWidth: 6.5
            }
          }
        },
        {
          r0: 65,
          r: 110,
          itemStyle: {
            borderWidth: 2,
            borderColor: getThemeColor('body-bg')
          },
          label: {
            show: false
          }
        },
        {
          r0: 120,
          r: 125,
          itemStyle: {
            borderWidth: 2,
            borderColor: getThemeColor('body-bg')
          },
          label: {
            show: false
          }
        }
      ]
    }
  ]
});

const GrossProfitChart = ({ style }: { style: CSSProperties }) => {
  const {
    getThemeColor,
    config: { isDark, isRTL }
  } = useAppContext();
  const data = [
    {
      name: 'Flight',
      value: 30,
      itemStyle: {
        color: isDark
          ? getThemeColor('primary')
          : getThemeColor('primary-light')
      },
      children: [
        {
          name: '1st class',
          value: 5,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('primary'), 0.8)
              : rgbaColor(getThemeColor('primary-light'), 0.7)
          },

          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: getThemeColor('primary-dark')
              }
            }
          ]
        },
        {
          name: 'Business',
          value: 15,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('primary'), 0.7)
              : rgbaColor(getThemeColor('primary-light'), 0.5)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('primary-dark'), 0.9)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('primary-dark'), 0.8)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('primary-dark'), 0.7)
              }
            }
          ]
        },
        {
          name: 'Economy',
          value: 10,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('primary'), 0.6)
              : rgbaColor(getThemeColor('primary-light'), 0.3)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('primary-dark'), 0.6)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('primary-dark'), 0.5)
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Package',
      value: 50,
      itemStyle: {
        color: isDark ? getThemeColor('info') : getThemeColor('info-light')
      },
      children: [
        {
          name: 'Flight + Hotel',
          value: 5,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('info'), 0.4)
              : rgbaColor(getThemeColor('info-light'), 0.3)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.2)
              }
            }
          ]
        },
        {
          name: 'Flight + Event',
          value: 20,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('info'), 0.5)
              : rgbaColor(getThemeColor('info-light'), 0.4)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.3)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.4)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.5)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.6)
              }
            }
          ]
        },
        {
          name: 'Flight + Hotel + Event',
          value: 10,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('info'), 0.6)
              : rgbaColor(getThemeColor('info-light'), 0.55)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.66)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.7)
              }
            }
          ]
        },
        {
          name: 'Hotel + Event',
          value: 5,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('info'), 0.7)
              : rgbaColor(getThemeColor('info-light'), 0.75)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.8)
              }
            }
          ]
        },
        {
          name: 'Custom',
          value: 10,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('info'), 0.8)
              : rgbaColor(getThemeColor('info-light'), 0.9)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('info-dark'), 0.9)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: getThemeColor('info-dark')
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Hotel',
      value: 25,
      itemStyle: {
        color: isDark
          ? getThemeColor('success')
          : getThemeColor('success-light')
      },
      children: [
        {
          name: 'Rooms',
          value: 10,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('success'), 0.8)
              : rgbaColor(getThemeColor('success-light'), 0.9)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: getThemeColor('success-dark')
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('success-dark'), 0.88)
              }
            }
          ]
        },
        {
          name: 'Resorts',
          value: 15,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('success'), 0.7)
              : rgbaColor(getThemeColor('success-light'), 0.5)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('success-dark'), 0.77)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('success-dark'), 0.66)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('success-dark'), 0.55)
              }
            }
          ]
        }
      ]
    },
    {
      name: 'Trip',
      value: 15,
      itemStyle: {
        color: isDark
          ? getThemeColor('warning')
          : getThemeColor('warning-light')
      },
      children: [
        {
          name: 'Nature',
          value: 5,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('warning'), 0.8)
              : rgbaColor(getThemeColor('warning-light'), 0.8)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: getThemeColor('warning-dark')
              }
            }
          ]
        },
        {
          name: 'Events',
          value: 10,
          itemStyle: {
            color: isDark
              ? rgbaColor(getThemeColor('warning'), 0.7)
              : rgbaColor(getThemeColor('warning-light'), 0.5)
          },
          children: [
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('warning-dark'), 0.7)
              }
            },
            {
              name: 'label-3',
              value: 5,
              itemStyle: {
                color: rgbaColor(getThemeColor('warning-dark'), 0.5)
              }
            }
          ]
        }
      ]
    }
  ];
  const colors = [
    getThemeColor('primary-light'),
    getThemeColor('info-light'),
    getThemeColor('success-light'),
    getThemeColor('warning-light')
  ];

  return (
    <ReactEChartsCore
      echarts={echarts}
      option={getDefaultOptions(getThemeColor, data, colors, isRTL, isDark)}
      style={style}
      className="mx-auto mt-3 mt-md-0 mt-xl-3 mt-xxl-0"
    />
  );
};

export default GrossProfitChart;
