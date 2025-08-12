import React, { PropsWithChildren, useEffect, useState } from 'react';
import { Card, Col, Nav, Row, Collapse, Toast } from 'react-bootstrap';
import Button from './Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import FeatherIcon from 'feather-icons-react';
import { LiveEditor, LiveError, LivePreview } from 'react-live';
import classNames from 'classnames';
import { snakeCase } from 'helpers/utils';
import { Link } from 'react-router-dom';
import PhoenixDocProvider, {
  usePhoenixDocContext
} from 'providers/PhoenixDocProvider';
import PhoenixLiveProvider, {
  PhoenixLiveProviderProps
} from 'components/docs/PhoenixLiveProvider';
import { faCopy } from '@fortawesome/free-solid-svg-icons';

interface PhoenixDocCardProps {
  className?: string;
  noProvider?: boolean;
}

interface PhoenixDocCardHeaderProps {
  title?: string;
  id?: string;
  className?: string;
  description?: string;
  alignItems?: string;
  noPreview?: boolean;
}
interface PhoenixDocCardBodyProps extends PhoenixLiveProviderProps {
  hidePreview?: boolean;
  className?: string;
  transformCode?: (code: string) => string | Promise<string>;
}

const PhoenixDocCard = ({
  children,
  className,
  noProvider
}: PropsWithChildren<PhoenixDocCardProps>) => {
  return (
    <Card
      className={classNames(className, 'shadow-none border overflow-visible')}
    >
      {noProvider ? (
        children
      ) : (
        <PhoenixDocProvider>{children}</PhoenixDocProvider>
      )}
    </Card>
  );
};

const PhoenixDocCardHeader = ({
  title,
  description,
  id,
  noPreview,
  alignItems = 'center',
  children,
  className
}: PropsWithChildren<PhoenixDocCardHeaderProps>) => {
  const [showToast, setShowToast] = useState(false);
  const { open, setOpen, showPreviewBtn, setShowPreviewBtn, textToCopy } =
    usePhoenixDocContext();

  const headerId = id ? id : title && snakeCase(title);

  const handleCopyCode = async () => {
    if (textToCopy) {
      await navigator.clipboard.writeText(textToCopy);
      setShowToast(true);
    }
  };

  useEffect(() => {
    setShowPreviewBtn(!noPreview);
  }, [noPreview]);

  return (
    <Card.Header
      className={classNames(
        className,
        'p-4 border-bottom bg-body hover-actions-trigger'
      )}
      id={headerId}
    >
      <Row className={`g-3 justify-content-between align-items-${alignItems}`}>
        <Col xs={12} md>
          {title && (
            <h4
              className={classNames('text-body text-nowrap', {
                'mb-0': !children && !description,
                'mb-2': children || description
              })}
            >
              {title}
              <Link to={`#${headerId}`} className="opacity-0 hover-show ps-2">
                #
              </Link>
            </h4>
          )}
          {description && (
            <p className="mb-0 text-body-secondary">{description}</p>
          )}
          {children}
        </Col>
        {showPreviewBtn && (
          <Col md="auto">
            <Nav className="nav-underline justify-content-end doc-tab-nav align-items-center">
              <Button
                variant="link"
                size="sm"
                className="px-2 text-body copy-code-btn me-2"
                onClick={handleCopyCode}
              >
                <FontAwesomeIcon icon={faCopy} className="me-1" />
                Copy Code
              </Button>
              <Button
                variant="phoenix-primary"
                className="text-nowrap"
                size="sm"
                style={{ width: 135 }}
                onClick={() => setOpen(!open)}
              >
                {open ? (
                  <>
                    <FeatherIcon icon="eye" className="me-2" size={16} />
                    Preview
                  </>
                ) : (
                  <>
                    <FeatherIcon icon="code" className="me-2" size={16} />
                    View Code
                  </>
                )}
              </Button>
            </Nav>
          </Col>
        )}
      </Row>

      <Toast
        show={showToast}
        onClose={() => setShowToast(false)}
        className="align-items-center bg-dark border-0 bottom-0 end-0 mb-3 me-3 position-fixed text-white z-5"
        delay={3000}
        data-bs-theme="light"
        autohide
      >
        <div className="d-flex">
          <Toast.Body className="P-3">
            <span className="fw-black">
              <code className="text-body-quaternary">
                Code has been copied to clipboard.
              </code>
            </span>
          </Toast.Body>
        </div>
      </Toast>
    </Card.Header>
  );
};

const PhoenixDocCardBody = ({
  code,
  scope,
  noInline,
  hidePreview,
  children,
  className,
  transformCode
}: PropsWithChildren<PhoenixDocCardBodyProps>) => {
  const { open, showPreviewBtn, setTextToCopy } = usePhoenixDocContext();

  useEffect(() => {
    if (code) {
      setTextToCopy(code);
    }
  }, []);
  return (
    <Card.Body className={classNames(className, 'p-0')}>
      {code && (
        <PhoenixLiveProvider
          transformCode={transformCode}
          code={code}
          scope={scope}
          noInline={noInline}
        >
          {code && !showPreviewBtn ? (
            <LiveEditor />
          ) : (
            <>
              <Collapse in={open}>
                <div>
                  <LiveEditor />
                  {!hidePreview && <LiveError />}
                </div>
              </Collapse>
              {!hidePreview && (
                <div className="p-4">
                  <LivePreview />
                </div>
              )}
            </>
          )}
        </PhoenixLiveProvider>
      )}

      {children && <div className="p-4">{children}</div>}
    </Card.Body>
  );
};

PhoenixDocCardHeader.componentName = 'PhoenixDocCardHeader';
PhoenixDocCard.Header = PhoenixDocCardHeader;
PhoenixDocCard.Body = PhoenixDocCardBody;

export default PhoenixDocCard;
