import React, { CSSProperties, useEffect, useRef } from 'react';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import { useAppContext } from 'providers/AppProvider';
import { TooltipComponent } from 'echarts/components';
import { BarChart } from 'echarts/charts';
import { CallbackDataParams } from 'echarts/types/dist/shared';
import EChartsReactCore from 'echarts-for-react/lib/core';
import { getRandomNumber } from 'helpers/utils';

echarts.use([TooltipComponent, BarChart]);

const data = [
  127, 156, 183, 110, 195, 129, 176, 147, 163, 199, 158, 115, 191, 105, 143,
  179, 120, 168, 137, 185, 154, 122, 197, 112, 144, 170, 193, 118, 166, 151,
  187, 134, 162, 107, 192, 152, 114, 198
];
const axisData = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22,
  23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38
];

const getDefaultOptions = (
  getThemeColor: (name: string) => string,
  isDark: boolean
) => ({
  tooltip: {
    trigger: 'axis',
    padding: [7, 10],
    axisPointer: {
      type: 'none'
    },
    backgroundColor: getThemeColor('body-highlight-bg'),
    borderColor: getThemeColor('border-color'),
    textStyle: { color: getThemeColor('light-text-emphasis') },
    borderWidth: 1,
    transitionDuration: 0,
    formatter: (params: CallbackDataParams[]) => {
      return `<div>
        <h6 class="fs-9 text-700 mb-0"><span class="fas fa-circle me-1 text-primary-light"></span>
          Users : <span class="fw-normal">${params[0].value}</span>
        </h6>
    </div>`;
    }
  },
  xAxis: {
    type: 'category',

    axisLabel: {
      show: false
    },
    axisTick: {
      show: false
    },
    axisLine: {
      show: false
    },
    boundaryGap: [0.2, 0.2],
    data: axisData
  },

  yAxis: {
    type: 'value',
    scale: true,
    boundaryGap: false,
    axisLabel: {
      show: false
    },
    splitLine: {
      show: false
    },
    min: 100,
    max: 200
  },
  series: [
    {
      type: 'bar',
      barMaxWidth: 8,
      barGap: 5,
      data,
      itemStyle: {
        color: isDark
          ? getThemeColor('primary')
          : getThemeColor('primary-light'),
        borderRadius: [2, 2, 0, 0]
      }
    }
  ],
  grid: {
    right: 0,
    left: 0,
    bottom: 0,
    top: 0
  }
});

const CountryWiseVitorsChart = ({
  style,
  updateUserCounder
}: {
  style: CSSProperties;
  updateUserCounder: (arg1: number) => void;
}) => {
  const {
    getThemeColor,
    config: { isDark }
  } = useAppContext();
  const chartRef = useRef<null | EChartsReactCore>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      const rndData = getRandomNumber(130, 200);
      data.shift();
      data.push(rndData);
      axisData.shift();
      axisData.push(getRandomNumber(37, 100));
      updateUserCounder(rndData);

      chartRef?.current?.getEchartsInstance()?.setOption({
        xAxis: {
          data: axisData
        },
        series: [
          {
            data
          }
        ]
      });
    }, 2000);

    //Clearing the interval
    return () => clearInterval(interval);
  }, []);

  return (
    <ReactEChartsCore
      echarts={echarts}
      ref={chartRef}
      option={getDefaultOptions(getThemeColor, isDark)}
      style={style}
    />
  );
};

export default CountryWiseVitorsChart;
