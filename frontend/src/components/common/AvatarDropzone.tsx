import classNames from 'classnames';
import {
  DropEvent,
  FileRejection,
  DropzoneProps as ReactDropZoneProps,
  useDropzone
} from 'react-dropzone';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload } from '@fortawesome/free-solid-svg-icons';

interface DropzoneProps extends ReactDropZoneProps {
  className?: string;
  onDrop?: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void;
}

const AvatarDropzone = ({ className, onDrop, ...rest }: DropzoneProps) => {
  const { getRootProps, getInputProps } = useDropzone({
    multiple: false,
    onDrop,
    accept: {
      'image/*': ['.png', '.gif', '.jpeg', '.jpg']
    },
    ...rest
  });

  return (
    <>
      <div
        {...getRootProps()}
        className={classNames(className, 'dropzone px-2 py-3')}
      >
        <input {...getInputProps()} />
        <div className="text-center text-body-emphasis">
          <h5 className="mb-2">
            <FontAwesomeIcon icon={faUpload} className="me-2" />
            Upload Profile Picture
          </h5>
          <p className="mb-0 fs-9 text-body-tertiary text-opacity-85 lh-sm">
            Upload a 300x300 jpg image with <br />a maximum size of 400KB
          </p>
        </div>
      </div>
    </>
  );
};

export default AvatarDropzone;
