import classNames from 'classnames';

interface CircleProgressProps {
  className?: string;
  height?: number;
  width?: number;
  color: string;
}

const CircleProgress = ({
  className,
  height = 52,
  width = 52,
  color
}: CircleProgressProps) => {
  return (
    <svg
      className={classNames(className, 'circle-progress-svg')}
      width={height}
      height={width}
      viewBox="0 0 170 170"
    >
      <circle
        className="progress-bar-rail"
        cx={60}
        cy={60}
        r={54}
        fill="none"
        strokeLinecap="round"
        strokeWidth={12}
      />
      <circle
        className="progress-bar-top"
        cx={60}
        cy={60}
        r={54}
        fill="none"
        strokeLinecap="round"
        stroke={color}
        strokeWidth={12}
      />
    </svg>
  );
};

export default CircleProgress;
