import { Col, Container, Row } from 'react-bootstrap';
import EcomGiftItemsBanner from 'components/banners/EcomGiftItemsBanner';
import PageHeroSections from 'components/sliders/PageHeroSections';
import EcomBecomeMember from 'components/cta/EcomBecomeMember';
import { mockFacilities } from 'data';

const Homepage = () => {
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
                to="facilites"
                title="Top Facilities today"
                facilities={mockFacilities}
              />
            </Col>
            <Col>
              <PageHeroSections
                to="/faciliites"
                title="Top Booked Facilites"
                facilities={mockFacilities}
              />
            </Col>
            <Col>
              <PageHeroSections
                to="facilites"
                title="Top Items"
                facilities={mockFacilities}
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
