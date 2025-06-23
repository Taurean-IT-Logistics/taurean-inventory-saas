import React, { PropsWithChildren } from 'react';
import { Range, getTrackBackground } from 'react-range'; // import the types directly from react-range
import {
  IRenderTrackParams,
  IRenderThumbParams,
  IRenderMarkParams
} from 'react-range/lib/types';
import { useAppContext } from 'providers/AppProvider';

type Variant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'danger'
  | 'warning'
  | 'info'
  | 'primary-lighter';

export interface PhoenixReactRangeProps {
  trackHeight: string;
  variant?: Variant;
  values: number[];
  min?: number;
  max?: number;
  step?: number;
  tipFormatter?: (value: number) => React.ReactNode; // Ensure it returns ReactNode
  alwaysShowTooltip?: boolean;
  allowOverlap?: boolean;
  draggableTrack?: boolean;
  disabled?: boolean;
  rtl?: boolean;
  onChange?: (values: number[]) => void;
  onFinalChange?: (values: number[]) => void;
  renderMark?: (params: IRenderMarkParams) => React.ReactNode;
  renderThumb?: (params: IRenderThumbParams) => React.ReactNode;
  renderTrack?: (params: IRenderTrackParams) => React.ReactNode;
  classNames?: string;
}

const PhoenixReactRange = ({
  step = 1,
  min = 0,
  max = 100,
  variant = 'primary',
  trackHeight = '0.75rem',
  tipFormatter,
  draggableTrack = false,
  alwaysShowTooltip = false,
  values,
  onChange = () => {},
  classNames
}: PropsWithChildren<PhoenixReactRangeProps>) => {
  const {
    getThemeColor,
    config: { isRTL }
  } = useAppContext();
  const Track = ({ props, children }: IRenderTrackParams): React.ReactNode => (
    <div
      onMouseDown={props.onMouseDown}
      onTouchStart={props.onTouchStart}
      className={`phoenix-react-range ${classNames ? classNames : ''}`}
      style={{
        ...props.style
      }}
    >
      <div
        ref={props.ref}
        className="phoenix-react-range-track"
        style={{
          height: trackHeight,
          cursor: !draggableTrack ? 'pointer' : 'ew-resize',
          background: getTrackBackground({
            values,
            colors:
              values.length === 2
                ? [
                    getThemeColor('gray-100'),
                    getThemeColor(variant),
                    getThemeColor('gray-100')
                  ]
                : [getThemeColor(variant), getThemeColor('gray-100')],
            min,
            max,
            rtl: isRTL
          }),
          alignSelf: 'center'
        }}
      >
        {children}
      </div>
    </div>
  );

  const Thumb = ({ props, isDragged, index }: IRenderThumbParams) => {
    return (
      <div
        {...props}
        key={props.key}
        className={`phoenix-react-range-thumb ${isDragged ? 'dragging' : ''}`}
        style={{
          ...props.style
        }}
      >
        <div
          className={`phoenix-react-range-tooltip ${
            alwaysShowTooltip || isDragged ? 'show' : ''
          }`}
        >
          {tipFormatter
            ? tipFormatter(values[index])
            : values[index].toFixed(1)}
        </div>
      </div>
    );
  };

  return (
    <Range
      draggableTrack={draggableTrack}
      values={values}
      step={step}
      min={min}
      max={max}
      onChange={onChange}
      renderTrack={Track}
      renderThumb={Thumb}
      rtl={isRTL}
    />
  );
};

export default PhoenixReactRange;
