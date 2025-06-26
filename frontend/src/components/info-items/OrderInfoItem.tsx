import FeatherIcon from 'feather-icons-react';

interface OrderInfoItemProps {
  icon: string;
  label: string;
}

const OrderInfoItem = ({ icon, label }: OrderInfoItemProps) => {
  return (
    <div className="d-flex align-items-center mb-1">
      <FeatherIcon
        icon={icon}
        className="me-2"
        size={16}
        style={{ strokeWidth: '2.5' }}
      />
      <h6 className="mb-0">{label}</h6>
    </div>
  );
};

export default OrderInfoItem;
