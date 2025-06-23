import { CSSProperties, ChangeEvent, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCamera } from '@fortawesome/free-solid-svg-icons';
import Button from 'components/base/Button';
import imageIcon from 'assets/img/icons/image-icon.png';
import classNames from 'classnames';
interface CoverUploadProps {
  src?: string;
  className?: string;
  gradient?: CSSProperties;
  onChange?: () => void;
}

const CoverUpload = ({
  src,
  gradient,
  onChange,
  className
}: CoverUploadProps) => {
  const [image, setImage] = useState<File | null>(null);

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setImage(e.target.files[0]);
      if (onChange) {
        onChange();
      }
    }
  };
  return (
    <>
      {!src && (
        <div className="text-body-tertiary fw-bold d-flex flex-center flex-column gap-3 fs-9 w-100 h-100">
          <img className="mt-3" src={imageIcon} width={40} alt="" />
          <Button variant="link" className="p-0">
            Add cover image
          </Button>
        </div>
      )}
      <div
        className={classNames(
          className,
          'bg-holder rounded-top hover-actions-trigger position-absolute'
        )}
        style={{
          backgroundImage: `${gradient ? gradient + ',' : ''}url(${
            image ? URL.createObjectURL(image) : src
          })`
        }}
      >
        <input
          className="d-none"
          id="coverFile"
          type="file"
          accept="image/*"
          onChange={handleChange}
        />
        <label className="cover-image-file-input" htmlFor="coverFile" />
        <div className="hover-actions end-0 bottom-0 pe-1 pb-2 text-white">
          <FontAwesomeIcon icon={faCamera} className="me-2 overlay-icon" />
        </div>
      </div>
    </>
  );
};

export default CoverUpload;
