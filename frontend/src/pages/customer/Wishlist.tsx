import Section from 'components/base/Section';
import EcomWishlistTable from 'components/tables/EcomWishlistTable';
import { mockFacilities } from 'data';

const Wishlist = () => {
  return (
    <div className="pt-5 mb-9">
      <Section small className="py-0">
        <h2 className="mb-5">
          Wishlist
          <span className="text-body-tertiary fw-normal ms-2">(43)</span>
        </h2>
        <EcomWishlistTable data={mockFacilities} />
      </Section>
    </div>
  );
};

export default Wishlist;
