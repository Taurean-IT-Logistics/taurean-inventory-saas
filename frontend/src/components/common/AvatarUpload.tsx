import React, { CSSProperties, ChangeEvent, useState } from 'react';
import Avatar, { Size, Status } from 'components/base/Avatar';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { faCamera } from '@fortawesome/free-solid-svg-icons';

interface AvatarUploadProps {
  size: Size;
  src: string;
  className?: string;
  status?: Status;
  thumbnail?: boolean;
  onChange?: () => void;
  imageClassName?: string;
}

const AvatarUpload = ({
  size,
  src,
  status,
  thumbnail,
  onChange,
  className,
  imageClassName
}: AvatarUploadProps) => {
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
    <div className={classNames('d-inline-flex', className)}>
      <input
        className="d-none"
        id="avatarFile"
        type="file"
        accept="image/*"
        onChange={handleChange}
      />
      <label
        className="cursor-pointer hover-actions-trigger"
        htmlFor="avatarFile"
      >
        <Avatar
          size={size}
          status={status}
          src={image ? URL.createObjectURL(image) : src}
          thumbnail={thumbnail}
          imageClassName={imageClassName}
        />
        <div
          className="h-100 w-100 bg-black position-absolute top-0 rounded-circle justify-content-center align-items-center hover-actions"
          data-bs-theme="light"
          style={{ '--phoenix-bg-opacity': 0.56 } as CSSProperties}
        >
          <FontAwesomeIcon icon={faCamera} className="text-light w-30 h-30" />
        </div>
      </label>
    </div>
  );
};

export default AvatarUpload;
