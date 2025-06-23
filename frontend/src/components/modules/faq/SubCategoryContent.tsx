import {
  faChevronLeft,
  faCircle,
  faStar
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import { Tab } from 'react-bootstrap';
import { FaqType, faqCategories } from 'data/faq';
import { useFaqTabContext } from 'providers/FaqTabProvider';
import classNames from 'classnames';

const SubCategoryContent = () => {
  const { setIsOpenOffcanvas } = useFaqTabContext();
  return (
    <Tab.Content style={{ top: '8rem' }} defaultValue="sale-101">
      <Button
        onClick={() => setIsOpenOffcanvas(true)}
        variant="link"
        className="d-md-none mt-15 mt-md-6 fs-8 ps-0"
        startIcon={
          <FontAwesomeIcon icon={faChevronLeft} className="fs-9 me-2" />
        }
      >
        Categories
      </Button>
      {faqCategories.map(category => (
        <Tab.Pane key={category.id} eventKey={category.id}>
          <ul className="list-inline mb-0">
            {category.topFaqs.map(item => (
              <FaqItem key={item.question} item={item} type="topFaq" />
            ))}
          </ul>
          <hr className="border-top mt-6" />
          <ul className="faq-list list-inline">
            {category.faqs.map(item => (
              <FaqItem key={item.question} item={item} />
            ))}
          </ul>
        </Tab.Pane>
      ))}
    </Tab.Content>
  );
};

const FaqItem = ({ item, type }: { item: FaqType; type?: string }) => {
  return (
    <li className="d-flex mt-6">
      <FontAwesomeIcon
        icon={type === 'topFaq' ? faStar : faCircle}
        className={classNames({ 'fs-8 text-primary me-2': type === 'topFaq' })}
      />
      <div>
        <h4 className="mb-3 text-body-highlight">{item.question}</h4>
        <p className="mb-0 text-body-tertiary">{item.answer}</p>
      </div>
    </li>
  );
};

export default SubCategoryContent;
