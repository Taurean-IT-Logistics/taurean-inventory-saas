import CoverUpload from 'components/common/CoverUpload';
import coverImage from 'assets/img/generic/59.png';
import AvatarUpload from 'components/common/AvatarUpload';
import { Card, Col, Row } from 'components/ui';
import { CSSProperties } from 'react';
import {  } from '';
import { Link } from 'react-router-dom';
import {
  faPencil,
  faUserCheck,
  faUserGroup
} from 'lucide-react';

interface SocialProfileCardProps {
  showAbout?: boolean;
  avatar: string;
  className?: string;
}

const SocialProfileCard = ({
  showAbout,
  avatar,
  className
}: SocialProfileCardProps) => {
  return (
    <Card className={className}>
      <Card.Header
        className="position-relative mb-6"
        style={{ minHeight: '130px' }}
      >
        <CoverUpload
          src={coverImage}
          gradient={
            'linear-gradient(0deg, #000000 -3%, rgba(0, 0, 0, 0) 83%)' as CSSProperties
          }
        />
        <AvatarUpload
          size="4xl"
          src={avatar}
          status="online"
          thumbnail
          className="feed-avatar-profile"
          imageClassName="border-0"
        />
      </Card.Header>
      <Card.Body>
        <Row>
          <Col xs={12}>
            <div className="flex flex-wrap mb-2 align-items-center">
              <h3 className="me-2">Ansolo Lazinatov</h3>
              <span className="fw-normal fs-8">u/hansolo</span>
            </div>
            <div className="flex flex-wrap gap-y-2 gap-x-4 d-xl-block d-xxl-flex align-items-center">
              <div className="flex mb-xl-2 mb-xxl-0">
                <
                  icon={faUserGroup}
                  className="fs-10 me-2 me-lg-1 me-xl-2"
                />
                <h6 className="mb-0">
                  1297
                  <span className="font-semibold ms-1">Followers</span>
                </h6>
              </div>
              <div className="flex">
                <
                  icon={faUserCheck}
                  className="fs-10 me-2 me-lg-1 me-xl-2"
                />
                <h6 className="mb-0">
                  3971
                  <span className="font-semibold ms-1">Following</span>
                </h6>
              </div>
            </div>
            {showAbout && (
              <div className="mt-4">
                <p className="font-semibold mb-0">
                  About me
                  <Link to="#!">
                    <
                      icon={faPencil}
                      className="fs-10 text-body-quaternary ms-3"
                    />
                  </Link>
                </p>
                <p className="text-body-tertiary mb-0">
                  “Le capitalisme exploite. Et le capitalisme exploite les gens
                  de couleur. Comme il exploite les hommes. Ou comme il exploite
                  les femmes.”
                </p>
              </div>
            )}
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default SocialProfileCard;
