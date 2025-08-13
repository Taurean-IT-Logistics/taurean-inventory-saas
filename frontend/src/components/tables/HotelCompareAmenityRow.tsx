import {  } from '';
import {
  faCircleCheck,
  faCircleXmark
} from 'lucide-react';

interface HotelCompareAmenityRowProps {
  title: string;
  reviewField: boolean[];
}

const HotelCompareAmenityRow = ({
  title,
  reviewField
}: HotelCompareAmenityRowProps) => {
  return (
    <tr>
      <td className="px-4 align-middle border-end-lg border-translucent bg-body-highlight">
        <h6 className="text-body fw-bolder text-uppercase mb-0">{title}</h6>
      </td>
      {reviewField.map((item, index) => (
        <td
          key={index}
          className="px-3 align-middle border-end-lg border-translucent"
        >
          {item ? (
            <h6 className="text-body">
              <
                icon={faCircleCheck}
                className="text-success me-2"
              />
              Available
            </h6>
          ) : (
            <h6 className="text-body">
              <
                icon={faCircleXmark}
                className="text-secondary-light me-2"
              />
              Not Available
            </h6>
          )}
        </td>
      ))}
    </tr>
  );
};

export default HotelCompareAmenityRow;
