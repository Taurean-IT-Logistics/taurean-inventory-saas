import { Clock } from '@fortawesome/free-regular-svg-icons';
import { faFilePdf } from 'lucide-react';
import {  } from '';
import classNames from 'classnames';
import Timeline from 'components/base/Timeline';
import { TimelineItem } from 'data/timelineData';
import { Col, Row } from 'components/ui';
import { Link } from 'react-router-dom';

const BasicTimeline = ({ data }: { data: TimelineItem[] }) => {
  return (
    <Timeline variant="basic" className="mb-9">
      {data.map((item, index) => (
        <Timeline.Item key={item.id}>
          <Row className="g-3">
            <Col xs="auto">
              <Timeline.Separator className="relative">
                <Timeline.Dot className="icon-item-md border border-translucent bg-body">
                  <
                    icon={item.icon}
                    className={`fs-9 text-${item.iconColor}`}
                  />
                </Timeline.Dot>
                {index !== data.length - 1 && (
                  <Timeline.Bar className="h-100 border-dashed" />
                )}
              </Timeline.Separator>
            </Col>
            <Col>
              <Timeline.Content>
                <div className="flex justify-content-between">
                  <div className="flex mb-2">
                    <h6
                      className="lh-sm mb-0 me-2 text-body-secondary timeline-item-title"
                      dangerouslySetInnerHTML={{ __html: item.title }}
                    />
                    {item.file && (
                      <h6 className="mb-0 fs-9">
                        <
                          icon={faFilePdf}
                          className="me-1 text-body-tertiary"
                        />
                        <Link to="#!">{item.file}</Link>
                      </h6>
                    )}
                  </div>
                  <div className="text-body-quaternary fs-9 text-nowrap timeline-time">
                    < icon={Clock} className="me-1" />
                    {item.time}
                  </div>
                </div>
                <h6
                  className={classNames('fs-10 fw-normal', {
                    'mb-3': index !== data.length - 1
                  })}
                >
                  by{' '}
                  <Link to="#!" className="font-semibold">
                    {item.tasker}
                  </Link>
                </h6>
                <p
                  className={classNames(
                    'fs-9 text-body-secondary w-sm-60 mb-0',
                    {
                      'mb-5': index !== data.length - 1
                    }
                  )}
                >
                  {item.content}
                </p>
              </Timeline.Content>
            </Col>
          </Row>
        </Timeline.Item>
      ))}
    </Timeline>
  );
};

export default BasicTimeline;
