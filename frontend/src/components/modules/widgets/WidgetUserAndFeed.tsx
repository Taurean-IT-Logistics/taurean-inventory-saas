import WidgetsSectionTitle from './WidgetsSectionTitle';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import SocialCoverCard from 'components/cards/SocialCoverCard';
import { Col, Row } from 'react-bootstrap';
import PostCard from '../social/PostCard';
import { feedPosts, socialPhotos } from 'data/social/postsData';
import Events from '../events/Events';
import { events } from 'data/eventsData';
import EventTitleCard from 'components/cards/EventTitleCard';
import SocialProfileCard from 'components/cards/SocialProfileCard';
import profileImage from 'assets/img/team/59.webp';
import SocialMessages from 'components/list-items/SocialMessages';
import { messages } from 'data/social/messages';
import SocialPhotos from 'components/image-gallery/SocialPhotos';
import ProfileNavigation from 'components/list-items/ProfileNavigation';

const WidgetUserAndFeed = () => {
  return (
    <div>
      <WidgetsSectionTitle
        title="Users & Feed"
        subtitle="User engagement and personalized content presentation."
        icon={faUsers}
        className="mb-5 mt-7"
      />
      <SocialCoverCard />
      <Row className="gx-4">
        <Col xxl={8}>
          <PostCard post={feedPosts[0]} />
        </Col>
        <Col xxl={4}>
          <Events events={events} title="Upcoming events" />
        </Col>
      </Row>
      <Row className="g-5">
        <Col xxl={8}>
          <EventTitleCard />
        </Col>
        <Col xxl={4}>
          <SocialProfileCard
            showAbout={true}
            avatar={profileImage}
            className="h-100"
          />
        </Col>
      </Row>
      <div className="mt-5">
        <Row className="g-5">
          <Col xl={4}>
            <SocialMessages messages={messages} />
          </Col>
          <Col xl={4}>
            <SocialPhotos photos={socialPhotos} />
          </Col>
          <Col xl={4}>
            <ProfileNavigation />
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default WidgetUserAndFeed;
