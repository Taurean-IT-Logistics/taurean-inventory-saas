import { IconProp } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Icon } from '@iconscout/react-unicons';
import Unicon from 'components/base/Unicon';
import { PropsWithChildren, useEffect, useState } from 'react';
import { Form, Toast } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';

interface IconCardProps {
  icon: IconProp | Icon | string;
  name: string;
  iconFamily: 'font-awesome' | 'unicons' | 'feather';
}

const IconCard = ({
  icon,
  name,
  iconFamily,
  children
}: PropsWithChildren<IconCardProps>) => {
  const [text, setText] = useState('');
  const [showCopyToast, setShowCopyToast] = useState(false);

  const handleClick = async () => {
    await navigator.clipboard.writeText(text);
    setShowCopyToast(true);
  };

  useEffect(() => {
    if (iconFamily === 'font-awesome') {
      setText(`<FontAwesomeIcon icon={${name}} />`);
    }
    if (iconFamily === 'unicons') {
      setText(`<Unicon icon={${name}} />`);
    }
    if (iconFamily === 'feather') {
      setText(`<FeatherIcon icon='${name}' />`);
    }
  }, []);

  return (
    <div className="border rounded-2 p-3 mb-4 text-center bg-body-emphasis dark__bg-gray-1000 shadow-sm">
      {iconFamily === 'font-awesome' && (
        <FontAwesomeIcon icon={icon as IconProp} className="text-body fs-5" />
      )}
      {iconFamily === 'unicons' && (
        <Unicon icon={icon as Icon} className="text-body fs-5" />
      )}
      {iconFamily === 'feather' && (
        <FeatherIcon icon={icon} className="text-body" size={16} />
      )}
      {children}
      <Form.Control
        onClick={handleClick}
        type="text"
        readOnly
        value={text}
        className="text-center text-dark bg-body-secondary dark__bg-gray-1100 mt-3"
      />

      <Toast
        show={showCopyToast}
        onClose={() => setShowCopyToast(false)}
        className="align-items-center bg-dark border-0 bottom-0 end-0 mb-3 me-3 position-fixed text-white z-5"
        data-bs-theme="light"
        delay={3000}
        autohide
      >
        <div className="d-flex">
          <Toast.Body className="P-3">
            <span className="fw-black">
              Copied: <code className="text-body-quaternary">{text}</code>
            </span>
          </Toast.Body>
        </div>
      </Toast>
    </div>
  );
};

export default IconCard;
