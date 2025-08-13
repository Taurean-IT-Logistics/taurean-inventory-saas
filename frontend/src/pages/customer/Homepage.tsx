import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';
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
    <div className="pt-20 mb-36">
      <section className="py-0">
        <div className="container mx-auto px-4 max-w-7xl">
          {loading ? (
            <div className="text-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-primary-600 mx-auto" />
            </div>
          ) : (
            <>
              {/* Banner */}
              <div className="mb-20">
                <div className="text-center">
                  <Carousel autoPlay={true}>
                    <HolidayBookingSection />
                    <BookingStatsSection />
                    <ContactTeamSection />
                    <SpecialDealsSection />
                  </Carousel>
                </div>
              </div>

              {/* Top Facilities Today */}
              <div className="mb-20">
                <PageHeroSections
                  to="facilities"
                  title="Top Facilities Today"
                  facilities={facilities}
                />
              </div>

              {/* Top Booked Facilities */}
              <div className="mb-20">
                <PageHeroSections
                  to="facilities"
                  title="Top Booked Facilities"
                  facilities={facilities}
                />
              </div>

              {/* Top Inventory Items */}
              <div className="mb-20">
                <InventoryHeroSection
                  to="rental"
                  title="Top Items"
                  items={inventoryItems}
                />
              </div>

              {/* Become Member CTA */}
              {!user && (
                <div className="mb-20">
                  <div className="text-center">
                    <EcomBecomeMember />
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default Homepage;
