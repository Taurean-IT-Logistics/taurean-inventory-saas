import PhoenixOffcanvas from 'components/base/PhoenixOffcanvas';
import { useFaqTabContext } from 'providers/FaqTabProvider';
import CategoryTab from './CategoryTab';
import SubCategoryTab from './SubCategoryTab';
import { Row } from 'react-bootstrap';

const CategoryOffcanvas = () => {
  const { isOpenOffcanvas } = useFaqTabContext();
  return (
    <PhoenixOffcanvas
      open={isOpenOffcanvas}
      placement="start"
      noBackdrop
      className="faq-offcanvas w-100"
      fixed
    >
      <Row className="g-0">
        <CategoryTab />
        <SubCategoryTab />
      </Row>
    </PhoenixOffcanvas>
  );
};

export default CategoryOffcanvas;
