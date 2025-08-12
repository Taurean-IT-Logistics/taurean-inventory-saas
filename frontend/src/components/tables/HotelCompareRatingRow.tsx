import Badge from 'components/base/Badge';
import { numberFormat } from 'helpers/utils';
import { ProgressBar } from 'react-bootstrap';

interface HotelCompareRatingRowProps {
  title: string;
  ratingValues: number[];
}

const HotelCompareRatingRow = ({
  title,
  ratingValues
}: HotelCompareRatingRowProps) => {
  return (
    <tr>
      <td className="px-4 align-middle bg-body-highlight border-end-lg border-translucent">
        <h6 className="text-body fw-bolder text-uppercase mb-0">{title}</h6>
      </td>
      {ratingValues.map((value, index) => (
        <td className="px-3 border-end border-translucent" key={index}>
          <div className="d-flex align-items-center gap-2">
            <Badge bg="primary" className="fs-8">
              {numberFormat(value, 'standard', {
                minimumFractionDigits: 1
              })}
            </Badge>
            <ProgressBar
              now={parseFloat(value.toString()) * 20}
              style={{ height: 8 }}
              className="bg-body-highlight w-100"
            />
          </div>
        </td>
      ))}
    </tr>
  );
};

export default HotelCompareRatingRow;
