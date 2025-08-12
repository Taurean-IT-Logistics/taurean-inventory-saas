import { useEffect, useState } from 'react';
import { Col, Container, Row, Spinner } from 'react-bootstrap';
import {
  BookingStatsSection,
  ContactTeamSection,
  HolidayBookingSection,
  SpecialDealsSection
} from 'components/banners/EcomGiftItemsBanner';
import PageHeroSections from 'components/sliders/PageHeroSections';
import EcomBecomeMember from 'components/cta/EcomBecomeMember';
import InventoryHeroSection from 'components/inventory/InventoryHeroSection';
import { Facility, InventoryItem } from 'types';
import Carousel from 'components/carousel';
import { InventoryItemController, FacilityController } from 'controllers';
import { useAppSelector } from 'hooks/useAppDispatch';
import { RootState } from 'lib/store';

const Homepage = () => {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

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
                    <HolidayBookingSection />
                    <BookingStatsSection />
                    <ContactTeamSection />
                    <SpecialDealsSection />
                  </Carousel>
                </Col>
              </Row>

              {/* Top Facilities Today */}
              <Row className="mb-5">
                <Col>
                  <PageHeroSections
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
                    items={inventoryItems}
                  />
                </Col>
              </Row>

              {/* Become Member CTA */}
              {!user && (
                <Row className="mb-5">
                  <Col className="text-center">
                    <EcomBecomeMember />
                  </Col>
                </Row>
              )}
            </>
          )}
        </Container>
      </section>
    </div>
  );
};

export default Homepage;
