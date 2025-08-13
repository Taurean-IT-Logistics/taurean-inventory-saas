import { faPen } from 'lucide-react';
import {  } from '';
import Button from 'components/base/Button';
import SeeMoreText from 'components/base/SeeMoreText';
import { useState } from 'react';
import { FormControl } from 'components/ui';

interface EditableDetailsFieldProps {
  children: string;
  onSave?: (value: string) => void;
  rows?: number;
  className?: string;
}

const EditableDetailsField = ({
  onSave,
  children,
  rows = 4,
  className
}: EditableDetailsFieldProps) => {
  const [editMode, setEditMode] = useState(false);
  const [value, setValue] = useState(children);

  return (
    <div className={className}>
      <div className="flex align-items-center mb-2">
        <h4 className="text-body me-4">Description</h4>
        {!editMode && (
          <Button
            variant="link"
            className="text-decoration-none p-0"
            onClick={() => setEditMode(true)}
          >
            < icon={faPen} />
          </Button>
        )}
      </div>
      {editMode ? (
        <>
          <FormControl
            as="textarea"
            rows={rows}
            className="mb-3"
            value={value}
            onChange={e => setValue(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              className="px-4"
              onClick={() => {
                setEditMode(false);
                if (onSave) {
                  onSave(value);
                }
              }}
            >
              Save
            </Button>
            <Button
              variant="phoenix-secondary"
              size="sm"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </Button>
          </div>
        </>
      ) : (
        <SeeMoreText
          link="#!"
          className="text-body-highlight mb-0"
          maxChars={300}
        >
          {value}
        </SeeMoreText>
      )}
    </div>
  );
};

export default EditableDetailsField;
