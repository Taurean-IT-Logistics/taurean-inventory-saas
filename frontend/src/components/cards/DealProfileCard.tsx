import React from 'react';
import { Card, Col, Dropdown, Form, ProgressBar, Row } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import Avatar from 'components/base/Avatar';
import avatar from 'assets/img/team/72x72/58.webp';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Button from 'components/base/Button';
import Badge from 'components/base/Badge';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons';
import { useAppContext } from 'providers/AppProvider';

const DealProfileCard = ({ className }: { className?: string }) => {
  const {
    config: { isRTL }
  } = useAppContext();
  return (
    <Card className={className}>
      <Card.Body>
        <Row className="align-items-center g-3">
          <Col sm="auto" className="flex-1">
            <h3 className="fw-bolder mb-2 line-clamp-1">
              Start-Up Growth Suite
            </h3>
            <div className="d-flex align-items-center mb-4">
              <h5 className="mb-0 me-4">USD $12,000.00</h5>
              <h5 className="fw-semibold">
                <FeatherIcon
                  icon="grid"
                  className="d-inline-block lh-sm me-1"
                  width={16}
                  height={16}
                />
                <span className="d-inline-block lh-sm">Financial</span>
              </h5>
            </div>
            <div className="d-md-flex d-xl-block align-items-center justify-content-between mb-5">
              <div className="d-flex align-items-center mb-3 mb-md-0 mb-xl-3">
                <Avatar size="xl" src={avatar} className="me-3" />
                <div>
                  <h5>Ansolo Lazinatov</h5>
                  <Dropdown align={isRTL ? 'end' : 'start'}>
                    <Dropdown.Toggle
                      variant="link"
                      className="text-body-secondary text-decoration-none dropdown-caret-none p-0 fs-8 fw-normal"
                    >
                      Owner
                      <FontAwesomeIcon
                        icon={faCaretDown}
                        className="text-body-secondary fs-9 ms-2"
                      />
                    </Dropdown.Toggle>

                    <Dropdown.Menu
                      className="shadow-sm"
                      style={{ minWidth: '20rem' }}
                    >
                      <Card className="position-relative border-0">
                        <Card.Body className="p-0">
                          <div className="mx-3">
                            <h4 className="mb-3 fw-bold">Switch ownership</h4>
                            <h5 className="mb-3">Deal Owner</h5>
                            <Form.Select className="mb-3">
                              <option value="">Select</option>
                              <option value="1">Jerry Seinfield</option>
                              <option value="2">Anthoney Michael</option>
                              <option value="3">Ansolo Lazinatov</option>
                            </Form.Select>
                            <div className="text-end">
                              <Button variant="link" className="text-danger">
                                Cancel
                              </Button>
                              <Button
                                size="sm"
                                variant="primary"
                                className="px-5"
                              >
                                Save
                              </Button>
                            </div>
                          </div>
                        </Card.Body>
                      </Card>
                    </Dropdown.Menu>
                  </Dropdown>
                </div>
              </div>
              <div>
                <Badge variant="phoenix" bg="success" className="me-2">
                  Success
                </Badge>
                <Badge variant="phoenix" bg="danger" className="me-2">
                  Lost
                </Badge>
                <Badge variant="phoenix" bg="secondary">
                  Close
                </Badge>
              </div>
            </div>
            <ProgressBar variant="primary-lighter" now={40} className="mb-2" />
            <div className="d-flex align-items-center justify-content-between">
              <p className="mb-0">New</p>
              <div>
                <FeatherIcon
                  icon="clock"
                  className="lh-sm me-1"
                  width={16}
                  height={16}
                />
                <span className="d-inline-block lh-sm">Dec 15, 05:00AM</span>
              </div>
            </div>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default DealProfileCard;
