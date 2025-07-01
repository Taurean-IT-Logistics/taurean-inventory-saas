import { useEffect, useState } from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import EcomGiftItemsBanner from 'components/banners/EcomGiftItemsBanner';
import PageHeroSections from 'components/sliders/PageHeroSections';
import EcomBecomeMember from 'components/cta/EcomBecomeMember';
import { useCart } from 'hooks/useCart';
import { useWishlist } from 'hooks/useWishlist';
import InventoryHeroSection from 'components/inventory/InventoryHeroSection';
import { Facility, InventoryItem } from 'types';
import Carousel from 'components/carousel';
import { InventoryItemController, FacilityController } from 'controllers';

const Homepage = () => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
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
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  const handleAddToWishlistInventory = (item: InventoryItem) => {
    addToWishlist({
      type: 'inventory_item',
      itemId: item._id || '',
      name: item.name,
      price: item.purchaseInfo.purchasePrice || 0,
      imageUrl:
        item.images && item.images.length > 0 ? item.images[0].path : undefined
    });
  };

  const fetchAllData = async () => {
    try {
      setLoading(true);
      const [facilitiesResponse, inventoryResponse] = await Promise.all([
        FacilityController.getAllFacilites(),
        InventoryItemController.getAllInventoryItems()
      ]);

      const facilitiesData = (facilitiesResponse?.data.facilities ||
        []) as Facility[];
      const inventoryItemData = inventoryResponse?.data || [];

      const filteredFacilities = facilitiesData.filter(
        f => f && !f.isDeleted && f.isActive
      );

      setFacilities(filteredFacilities);
      setInventoryItems(
        (
          (Array.isArray(inventoryItemData)
            ? inventoryItemData
            : []) as InventoryItem[]
        ).filter(item => item && !item.isDeleted && item._id && item.name)
      );
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  return (
    <div className="pt-5 mb-9">
      <section className="py-0">
        <Container fluid>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : (
            <>
              {/* Banner */}
              <Row className="mb-5">
                <Col className="text-center">
                  <Carousel autoPlay={true}>
                    <EcomGiftItemsBanner />
                    <EcomGiftItemsBanner />
                    <EcomGiftItemsBanner />
                    <EcomGiftItemsBanner />
                  </Carousel>
                </Col>
              </Row>

              {/* Top Facilities Today */}
              <Row className="mb-5">
                <Col>
                  <PageHeroSections
                    onAddToCart={handleAddToCartFacility}
                    onAddToWishlist={handleAddToWishlistFacility}
                    to="facilities"
                    title="Top Facilities Today"
                    facilities={facilities}
                  />
                </Col>
              </Row>

              {/* Top Booked Facilities */}
              <Row className="mb-5">
                <Col>
                  <PageHeroSections
                    onAddToCart={handleAddToCartFacility}
                    onAddToWishlist={handleAddToWishlistFacility}
                    to="facilities"
                    title="Top Booked Facilities"
                    facilities={facilities}
                  />
                </Col>
              </Row>

              {/* Top Inventory Items */}
              <Row className="mb-5">
                <Col>
                  <InventoryHeroSection
                    to="rental"
                    title="Top Items"
                    onAddToCart={handleAddToCartInventory}
                    onAddToWishlist={handleAddToWishlistInventory}
                    items={inventoryItems}
                  />
                </Col>
              </Row>

              {/* Become Member CTA */}
              <Row className="mb-5">
                <Col className="text-center">
                  <EcomBecomeMember />
                </Col>
              </Row>
            </>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Homepage;
