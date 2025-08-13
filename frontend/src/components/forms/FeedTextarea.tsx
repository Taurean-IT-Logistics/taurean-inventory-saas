import {
  Calendar,
  faCaretDown,
  faGlobeAsia,
  faImage,
  MapPin,
  faTag
} from 'lucide-react';
import {  } from '';
import Button from 'components/base/Button';
import { useState } from 'react';
import { Card, Dropdown, Form } from 'components/ui';

const FeedTextarea = ({ className }: { className?: string }) => {
  const [privacy, setPrivacy] = useState('Public');
  return (
    <Card className={className}>
      <Card.Body className="p-0">
        <Form.Control
          as="textarea"
          className="border-translucent rounded-bottom-0 border-0 flex-1 fs-8"
          rows={7}
          placeholder="Write something..."
        />
      </Card.Body>
      <Card.Footer className="p-3">
        <div className="flex justify-content-between align-items-center">
          <Button className="p-0 me-3">
            < icon={faImage} className="fs-8" />
          </Button>
          <Button className="p-0 me-3">
            < icon={Calendar} className="fs-8" />
          </Button>
          <Button className="p-0 me-3">
            < icon={MapPin} className="fs-8" />
          </Button>
          <Button className="p-0 me-3">
            < icon={faTag} className="fs-8" />
          </Button>
          <Dropdown className="me-3 flex-1">
            <Dropdown.Toggle
              variant=""
              className="p-0 dropdown-caret-none d-flex align-items-center"
            >
              < icon={faGlobeAsia} className="fs-8 me-1" />
              <span className="me-1 lh-base d-none d-sm-block">{privacy}</span>
              <
                icon={faCaretDown}
                className="fs-10 text-body-quaternary"
              />
            </Dropdown.Toggle>
            <Dropdown.Menu>
              <Dropdown.Item onClick={() => setPrivacy('Public')}>
                Public
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setPrivacy('Private')}>
                Private
              </Dropdown.Item>
              <Dropdown.Item onClick={() => setPrivacy('Draft')}>
                Draft
              </Dropdown.Item>
            </Dropdown.Menu>
          </Dropdown>
          <Button
            variant="primary"
            type="submit"
            size="sm"
            className="px-6 px-sm-8"
          >
            Post
          </Button>
        </div>
      </Card.Footer>
    </Card>
  );
};

export default FeedTextarea;
