import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { Col, Row } from 'react-bootstrap';
import TinymceEditor from 'components/base/TinymceEditor';
import Dropzone from 'components/base/Dropzone';
import InventoryTab from 'components/tabs/InventoryTab';
import OrganizeFormCard from 'components/cards/OrganizeFormCard';
import VariantFormCard from 'components/cards/VariantFormCard';
import ReactSelect from 'components/base/ReactSelect';

const options = [
  { value: 'MUSIC', label: 'music' },
  { value: 'CONCEERT', label: 'conceert' },
  { value: 'GREATEST SHOW ON EARTH', label: 'greatest-show-on-earth' }
];

const WidgetForms = () => {
  return (
    <div>
      <WidgetsSectionTitle
        title="Forms"
        subtitle="Get different types of data from the user by using Phoenix's customizable form."
        icon={faFileAlt}
        className="mb-5 mt-7"
      />
      <Row className="g-5 mb-5">
        <Col xl={8}>
          <TinymceEditor
            options={{
              height: '15rem',
              placeholder: 'Write a description here...'
            }}
          />
          <Dropzone
            className="my-5"
            accept={{
              'image/*': ['.png', '.gif', '.jpeg', '.jpg']
            }}
          />
          <ReactSelect
            className="mb-5"
            options={options}
            isMulti
            placeholder="Add tags"
            styles={{
              control: baseStyles => ({
                ...baseStyles,
                height: '128px',
                alignItems: 'start'
              }),
              dropdownIndicator: baseStyles => ({
                ...baseStyles,
                display: 'none'
              })
            }}
          />
          <InventoryTab />
        </Col>
        <Col xl={4}>
          <OrganizeFormCard className="mb-3" />
          <VariantFormCard />
        </Col>
      </Row>
    </div>
  );
};

export default WidgetForms;
