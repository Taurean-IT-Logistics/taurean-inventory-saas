import { Col, Container, Row } from 'react-bootstrap';
import EcomGiftItemsBanner from 'components/banners/EcomGiftItemsBanner';
import PageHeroSections from 'components/sliders/PageHeroSections';
import EcomBecomeMember from 'components/cta/EcomBecomeMember';
import { mockFacilities, mockInventoryItems } from 'data';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';
import InventoryHeroSection from 'components/inventory/InventoryHeroSection';
import { Facility, InventoryItem } from 'types';

const Homepage = () => {
  // Call the hooks here to get the actual functions
  const { addToCart } = useCart();
  const { addToWishlist } = useWishlist();

  const handleAddToCartFacility = (facility: Facility) => {
    const defaultPricing =
      facility.pricing.find(p => p.isDefault) || facility.pricing[0];
    const mainImage =
      facility.images && facility.images.length > 0
        ? facility.images[0].path
        : undefined;

    addToCart({
      type: 'facility',
      itemId: facility._id || '',
      quantity: 1,
      name: facility.name,
      price: defaultPricing?.amount || 0,
      imageUrl: mainImage
    });
  };

  const handleAddToWishlistFacility = (facility: Facility) => {
    const defaultPricing =
      facility.pricing.find(p => p.isDefault) || facility.pricing[0];
    const mainImage =
      facility.images && facility.images.length > 0
        ? facility.images[0].path
        : undefined;

    addToWishlist({
      type: 'facility',
      itemId: facility._id || '',
      name: facility.name,
      price: defaultPricing?.amount || 0,
      imageUrl: mainImage
    });
  };

  const handleAddToCartInventory = (item: InventoryItem) => {
    addToCart({
      type: 'inventory_item',
      itemId: item._id || '',
      quantity: 1,
      name: item.name,
      price: item.purchaseInfo.purchasePrice || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0] : undefined
    });
  };

  const handleAddToWishlistInventory = (item: InventoryItem) => {
    addToWishlist({
      type: 'inventory_item',
      itemId: item._id || '',
      name: item.name,
      price: item.purchaseInfo.purchasePrice || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0] : undefined
    });
  };

  return (
    <div className="pt-5 mb-9">
      <section className="py-0">
        <Container fluid className="w-100%">
          <Row className="gap-10 mb-9 justify-content-center align-items-center">
            <Col className="text-center mb-4">
              <EcomGiftItemsBanner />
            </Col>
            <Col>
              <PageHeroSections
                onAddToCart={handleAddToCartFacility}
                onAddToWishlist={handleAddToWishlistFacility}
                to="facilites"
                title="Top Facilities today"
                facilities={mockFacilities}
              />
            </Col>
            <Col>
              <PageHeroSections
                onAddToCart={handleAddToCartFacility}
                onAddToWishlist={handleAddToWishlistFacility}
                to="/faciliites"
                title="Top Booked Facilites"
                facilities={mockFacilities}
              />
            </Col>
            <Col>
              <InventoryHeroSection
                to="rental"
                title="Top Items"
                onAddToCart={handleAddToCartInventory}
                onAddToWishlist={handleAddToWishlistInventory}
                items={mockInventoryItems}
              />
            </Col>
          </Row>
          <div className="text-center">
            <EcomBecomeMember />
          </div>
        </Container>
      </section>
    </div>
  );
};

export default Homepage;
