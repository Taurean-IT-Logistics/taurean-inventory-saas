import classNames from 'classnames';
import {
  Accept,
  DropEvent,
  FileRejection,
  DropzoneProps as ReactDropZoneProps,
  useDropzone
} from 'react-dropzone';
import Button from './Button';
import imageIcon from 'assets/img/icons/image-icon.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  Dispatch,
  PropsWithChildren,
  SetStateAction,
  useEffect,
  useMemo,
  useState
} from 'react';
import AttachmentPreview, {
  FileAttachment
} from 'components/common/AttachmentPreview';
import { convertFileToAttachment } from 'helpers/utils';
import ImageAttachmentPreview from 'components/common/ImageAttachmentPreview';
import { faTrashAlt } from '@fortawesome/free-solid-svg-icons';

interface DropzoneProps {
  className?: string;
  size?: 'sm';
  reactDropZoneProps?: ReactDropZoneProps;
  accept?: Accept;
  noPreview?: boolean;
  defaultFiles?: File[];
  multiple?: boolean;
  setPhotos?: Dispatch<SetStateAction<File[]>>;
  onDrop?: <T extends File>(
    acceptedFiles: T[],
    fileRejections: FileRejection[],
    event: DropEvent
  ) => void;
}

const Dropzone = ({
  className,
  size,
  onDrop,
  accept,
  defaultFiles = [],
  noPreview,
  reactDropZoneProps,
  multiple = true,
  setPhotos,
  children
}: PropsWithChildren<DropzoneProps>) => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<FileAttachment[]>([]);

  const handleRemoveFile = (index: number) => {
    setFiles(files.filter((file, ind) => index !== ind));
    setPreviews(previews.filter((file, ind) => index !== ind));
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (...args) => {
      const [acceptedFiles] = args;
      setFiles(acceptedFiles);
      setPreviews(acceptedFiles.map(file => convertFileToAttachment(file)));
      if (onDrop) {
        onDrop(...args);
      }
    },
    multiple: multiple,
    accept,
    ...reactDropZoneProps
  });

  const imageOnly = useMemo(() => {
    return Boolean(accept && accept['image/*']);
  }, [accept]);

  useEffect(() => {
    if (defaultFiles.length > 0) {
      setFiles(defaultFiles);
    }
  }, [defaultFiles]);

  useEffect(() => {
    if (files.length > 0) {
      setPhotos && setPhotos(files);
    }
  }, [files]);

  return (
    <>
      <div
        {...getRootProps()}
        className={classNames(className, 'dropzone', {
          'dropzone-sm': size === 'sm'
        })}
      >
        <input {...getInputProps()} />
        {children ? (
          <>{children}</>
        ) : (
          <div className="text-body-tertiary text-opacity-85 fw-bold fs-9">
            Drag your {imageOnly ? 'photo' : 'files'} here{' '}
            <span className="text-body-secondary">or </span>
            <Button variant="link" className="p-0">
              Browse from device
            </Button>
            <br />
            <img
              className="mt-3"
              src={imageIcon}
              width={classNames({ 24: size === 'sm', 40: size !== 'sm' })}
              alt=""
            />
          </div>
        )}
      </div>
      {!imageOnly &&
        previews.map((file, index) => (
          <div
            key={index}
            className={classNames(
              'border-bottom border-translucent d-flex align-items-center justify-content-between py-3'
            )}
          >
            <AttachmentPreview attachment={file} />

            <button className="btn p-0" onClick={() => handleRemoveFile(index)}>
              <FontAwesomeIcon icon={faTrashAlt} className="fs-0" />
            </button>
          </div>
        ))}

      {imageOnly && !noPreview && files.length > 0 && (
        <div className="d-flex flex-wrap gap-2 mt-3">
          {files.map((file, index) => (
            <ImageAttachmentPreview
              key={file.name}
              image={URL.createObjectURL(file)}
              handleClose={() => handleRemoveFile(index)}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default Dropzone;
