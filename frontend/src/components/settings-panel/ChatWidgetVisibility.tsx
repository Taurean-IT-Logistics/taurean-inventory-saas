import { useAppContext } from 'providers/AppProvider';
import { ChangeEvent } from 'react';
import { Form } from 'react-bootstrap';

const ChatWidgetVisibility = () => {
  const {
    config: { isChatWidgetVisible },
    setConfig
  } = useAppContext();

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { checked } = e.target;
    setConfig({
      isChatWidgetVisible: checked
    });
  };

  return (
    <div className="border border-translucent rounded-3 p-4 setting-panel-item bg-body-emphasis">
      <div className="d-flex justify-content-between align-items-center">
        <h5 className="setting-panel-item-title mb-1">Support Chat</h5>
        <Form.Check
          type="switch"
          id="custom-switch"
          onChange={handleChange}
          defaultChecked={isChatWidgetVisible}
          className="text-end"
        />
      </div>
      <p className="mb-0 text-body-tertiary">Toggle support chat</p>
    </div>
  );
};

export default ChatWidgetVisibility;
