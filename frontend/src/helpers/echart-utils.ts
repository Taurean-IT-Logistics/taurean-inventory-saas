import dayjs from 'dayjs';
import {
  CallbackDataParams,
  TooltipPositionCallbackParams
} from 'echarts/types/dist/shared';
import classNames from 'classnames';

export interface Size {
  contentSize: number[];
  viewSize: number[];
}

export const tooltipFormatterDefault = (
  params: CallbackDataParams[],
  dateFormatter = 'MMM DD',
  colorProperty: 'borderColor' | 'color' = 'borderColor'
) => {
  let tooltipItem = ``;
  params.forEach(el => {
    tooltipItem += `<div class='ms-1'>
        <h6 class="text-body-tertiary">
        <span class="d-inline-block rounded-circle me-2" style="height: 0.5rem; width: 0.5rem; background:${
          el[colorProperty] || el.color
        }"></span>
          ${el.seriesName} : ${el.value}
        </h6>
      </div>`;
  });
  return `<div>
            <p class='mb-2 text-body-tertiary'>
              ${
                dayjs(params[0].name).isValid()
                  ? dayjs(params[0].name).format(dateFormatter)
                  : params[0].name
              }
            </p>
            ${tooltipItem}
          </div>`;
};

export const tooltipFormatterList = (params: CallbackDataParams[]) => {
  const result = params.map((param, index) => {
    let label = '';
    if (dayjs(params[0].name).isValid()) {
      if (index > 0) {
        label = dayjs(params[0].name).subtract(1, 'month').format('MMM DD');
      } else {
        label = dayjs(params[0].name).format('MMM DD');
      }
    } else {
      label = params[0].name;
    }
    return {
      value: param.value,
      label,
      color: param.color
    };
  });

  let tooltipItem = ``;
  result.forEach((el, index: number) => {
    tooltipItem += `<h6 class="text-body-tertiary ${
      (result.length === 1 || index > 0) && 'mb-0'
    }"><span class="d-inline-block rounded-circle me-2" style="height: 0.5rem; width: 0.5rem; background:${
      el.color
    }"></span>
    ${el.label} : ${el.value}
  </h6>`;
  });

  return `<div class='ms-1'>
            ${tooltipItem}
          </div>`;
};

export const rtlTooltipFormatter = (
  params: CallbackDataParams,
  isRTL: boolean,
  isDark: boolean
) => {
  const ltr = `<div class=${classNames({
    'text-body-tertiary': isDark,
    'text-black': !isDark
  })}>
    ${params.marker}
    <span class="fw-semibold" style="font-size:14px; margin-left: 2px">
      ${params.name}
    </span>
    <span class="fw-black" style="float:right;margin-left:20px;font-size:14px;">${
      params.value
    }</span>
  </div>`;

  const rtl = `<div class=${classNames({
    'text-body-tertiary': isDark,
    'text-black': !isDark
  })}>
    <span class="fw-black" style="float:left;margin-right:20px;font-size:14px;">${
      params.value
    }</span>
    <span class="fw-semibold" style="font-size:14px; margin-right: 2px">
      ${params.name}
    </span>
    <span class="d-inline-block ms-1" style="border-radius: 10px; width: 10px; height: 10px; background-color:${
      params.color
    }"></span>
  </div>
  `;

  return isRTL ? rtl : ltr;
};

export const handleTooltipPosition = (
  point: number[],
  params: TooltipPositionCallbackParams,
  dom: HTMLDivElement,
  rect: null,
  size: Size
) => {
  if (window.innerWidth <= 540) {
    const tooltipHeight = dom.offsetHeight;
    const obj: { top: number; left?: number; right?: number } = {
      top: point[1] - tooltipHeight - 20
    };

    obj[point[0] < size.viewSize[0] / 2 ? 'left' : 'right'] = 5;

    return obj;
  }

  return null;
};

export const TopCouponChartTooltip = (
  point: number[],
  params: TooltipPositionCallbackParams,
  el: HTMLDivElement,
  rect: null,
  size: Size
) => {
  const obj: { top?: number; left?: number; right?: number } = {
    top: point[1] - 35
  };

  if (window.innerWidth > 540) {
    if (point[0] <= size.viewSize[0] / 2) {
      obj.left = point[0] + 20;
    } else {
      obj.left = point[0] - size.contentSize[0] - 20;
    }
  } else {
    obj[point[0] < size.viewSize[0] / 2 ? 'left' : 'right'] = 0;
  }

  return obj;
};
