import { faComment } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { useChatWidgetContext } from 'providers/ChatWidgetProvider';

const FaqCta = () => {
  const { setIsOpenChat, isOpenChat } = useChatWidgetContext();
  return (
    <div>
      <div className="text-center py-11">
        <h3 className="text-body-emphasis">Still can’t find your answer?</h3>
        <p className="text-body">We are happy to help</p>
        <Button
          onClick={() => setIsOpenChat(!isOpenChat)}
          variant="outline-primary"
          size="sm"
          startIcon={<FontAwesomeIcon icon={faComment} className="me-2" />}
        >
          Chat with us
        </Button>
      </div>
    </div>
  );
};

export default FaqCta;
