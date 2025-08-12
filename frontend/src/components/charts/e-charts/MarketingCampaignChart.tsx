import { CSSProperties, useEffect, useRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { rgbaColor } from 'helpers/utils';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { RadarChart } from 'echarts/charts';
import EChartsReactCore from 'echarts-for-react/lib/core';

echarts.use([TooltipComponent, RadarChart]);

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  color: [getThemeColor('primary-light'), getThemeColor('warning-light')],
  tooltip: {
    trigger: 'item',
    padding: [7, 10],
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('tertiary-bg'),
    textStyle: {
      color: getThemeColor('body-color'),
      fontSize: 12.8,
      fontFamily: 'Nunito Sans'
    },
    borderWidth: 1,
    transitionDuration: 0
  },
  radar: {
    splitNumber: 5,
    axisNameGap: 10,
    radius: '87%',
    splitLine: {
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    splitArea: {
      show: true,
      areaStyle: {
        shadowBlur: 0.5,
        color: [
          !isDark
            ? getThemeColor('body-highlight-bg')
            : getThemeColor('body-highlight-bg'),
          !isDark ? getThemeColor('body-bg') : getThemeColor('secondary-bg')
        ]
      }
    },
    axisLine: {
      show: true,
      lineStyle: {
        color: getThemeColor('secondary-bg')
      }
    },
    axisName: {
      color: getThemeColor('tertiary-color'),
      fontWeight: 800,
      fontSize: 10.2
    },
    indicator: [
      { name: 'SAT', max: 5000 },
      { name: 'FRI', max: 5000 },
      { name: 'THU', max: 5000 },
      { name: 'WED', max: 5000 },
      { name: 'TUE', max: 5000 },
      { name: 'MON', max: 5000 },
      { name: 'SUN', max: 5000 }
    ]
  },
  series: [
    {
      name: 'Budget vs spending',
      type: 'radar',
      symbol: 'emptyCircle',
      symbolSize: 6,

      data: [
        {
          value: [2100, 2300, 1600, 3700, 3000, 2500, 2500],
          name: 'Offline Marketing',
          itemStyle: {
            color: getThemeColor('primary-light')
          },
          areaStyle: {
            color: rgbaColor(getThemeColor('primary-light'), 0.3)
          }
        },
        {
          value: [3000, 1600, 3700, 500, 3700, 3000, 3200],
          name: 'Online Marketing',
          areaStyle: {
            color: rgbaColor(getThemeColor('warning-light'), 0.3)
          },
          itemStyle: {
            color: getThemeColor('warning-light')
          }
        }
      ]
    }
  ],
  grid: {
    top: 10,
    left: 0
  }
});

const MarketingCampaignChart = ({ style }: { style: CSSProperties }) => {
  const chartRef = useRef<null | EChartsReactCore>(null);
  const updateDimensions = () => {
    if (window.innerWidth < 1200) {
      chartRef.current?.getEchartsInstance()?.setOption({
        radar: {
          radius: '74%'
        }
      });
    } else if (window.innerWidth > 1200) {
      chartRef.current?.getEchartsInstance().setOption({
        radar: {
          radius: '85%'
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
      style={style}
    />
  );
};

export default MarketingCampaignChart;
