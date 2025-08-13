import {
  faCalendarDays,
  faImage,
  faLocationDot,
  faTag
} from 'lucide-react';
import {  } from '';
import Button from 'components/base/Button';
import { Form } from 'components/ui';

const CommentForm = () => {
  return (
    <>
      <Form.Group className="mb-3" controlId="commentForm">
        <Form.Control placeholder="Add comment" as="textarea" rows={3} />
      </Form.Group>
      <div className="flex align-items-center gap-3">
        <Button size="sm" className="p-0">
          < icon={faImage} className="fs-8" />
        </Button>
        <Button size="sm" className="p-0">
          < icon={faCalendarDays} className="fs-8" />
        </Button>
        <Button size="sm" className="p-0">
          < icon={faLocationDot} className="fs-8" />
        </Button>
        <Button size="sm" className="p-0">
          < icon={faTag} className="fs-8" />
        </Button>
        <Button variant="primary" className="px-6 ms-auto">
          Comment
        </Button>
      </div>
    </>
  );
};

export default CommentForm;
