import {
  faAngleDown,
  faSquareEnvelope,
  faSquarePhone
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Deal } from 'data/crm/deals';
import { currencyFormat } from 'helpers/utils';
import { Card, Collapse, Form, ProgressBar, Table } from 'react-bootstrap';
import FeatherIcon from 'feather-icons-react';
import { UilHeadphones, UilUser } from '@iconscout/react-unicons';
import classNames from 'classnames';
import { Link } from 'react-router-dom';
import Badge, { BadgeBg } from 'components/base/Badge';
import { faWhatsappSquare } from '@fortawesome/free-brands-svg-icons';
import { useDealsContext } from 'providers/CrmDealsProvider';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface DealCardProps {
  deal: Deal;
  columnId: number;
  cursor?: boolean;
}

const DealCard = ({ deal, columnId, cursor }: DealCardProps) => {
  const { dealColumns, setDealColumns } = useDealsContext();

  const {
    setNodeRef,
    isDragging,
    transform,
    transition,
    attributes,
    listeners
  } = useSortable({
    id: deal.id,
    data: {
      type: 'deal',
      item: deal,
      columnId
    }
  });

  const handleOpenDetails = () => {
    const updatedColumns = structuredClone(dealColumns);
    const column = updatedColumns.find(c => c.id === columnId);
    if (column) {
      const targetDeal = column.deals.find(item => item.id === deal.id);
      if (targetDeal) {
        targetDeal.openDetails = !targetDeal.openDetails;
      }
    }
    setDealColumns(updatedColumns);
  };

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: isDragging || cursor ? 'grabbing' : 'pointer',
    opacity: isDragging ? 0 : 1
  };
  return (
    <div ref={setNodeRef} style={styles} {...attributes} {...listeners}>
      <Card className="mb-3">
        <Card.Body>
          <div className="d-flex align-items-center justify-content-between mb-3">
            <FeatherIcon icon="clock" size={16} className="me-2" />

            <p className="mb-0 fs-9 fw-semibold text-body-tertiary flex-1">
              {deal.date} .{' '}
              <span className="text-body-quaternary">{deal.time}</span>
            </p>
            <button
              className="btn p-0 deal-collapse-btn"
              onClick={handleOpenDetails}
            >
              <FontAwesomeIcon
                icon={faAngleDown}
                className={classNames('text-body-tertiary fs-8', {
                  show: deal.openDetails
                })}
              />
            </button>
          </div>
          <div className="d-flex align-items-center mb-2">
            <Link
              to="/apps/crm/deal-details"
              className="fw-bold line-clamp-1 me-3 fs-7"
            >
              {deal.title}
            </Link>
            <p
              className={classNames('fs-10 mb-0', {
                'd-none': !deal.openDetails
              })}
            >
              <FeatherIcon
                icon="grid"
                size={12}
                className="text-body-quaternary me-1"
              />
              {deal.category}
            </p>
            <p
              className={classNames(
                'ms-auto fs-9 text-body-emphasis fw-semibold mb-0',
                {
                  'd-none': deal.openDetails
                }
              )}
            >
              {currencyFormat(deal.revenue, { minimumFractionDigits: 2 })}
            </p>
          </div>

          <div
            className={classNames('d-flex flex-between-center mb-2', {
              'd-none': deal.openDetails
            })}
          >
            <div className="d-flex align-items-center">
              <UilUser className="me-2" size={16} />
              <p className="text-body-secondary fw-bold fs-9 mb-0">
                {deal.company}
              </p>
            </div>
            <div className="d-flex align-items-center">
              <UilHeadphones className="me-2" size={16} />
              <p className="text-body-secondary fw-bold fs-9 mb-0">
                {deal.agent}
              </p>
            </div>
          </div>

          <Collapse in={deal.openDetails}>
            <div>
              <div className="d-flex gap-2 mb-5">
                <Badge variant="phoenix" bg={deal.status.variant as BadgeBg}>
                  {deal.status.label}
                </Badge>
                <Badge variant="phoenix" bg={deal.priority.variant as BadgeBg}>
                  {deal.priority.label}
                </Badge>
              </div>
              <div className="scrollbar mb-4">
                <Table className="mb-0 w-100 align-middle" borderless size="sm">
                  <tbody>
                    <tr>
                      <td className="d-flex gap-2 align-items-center">
                        <FeatherIcon
                          icon="dollar-sign"
                          size={16}
                          className="text-body-tertiary"
                        />
                        <p className="fw-semibold fs-9 mb-0 text-body-tertiary">
                          Expected Revenue
                        </p>
                      </td>
                      <td>:</td>
                      <td className="fw-semibold fs-9 mb-0 text-body-emphasis">
                        {currencyFormat(deal.revenue, {
                          minimumFractionDigits: 2
                        })}
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex gap-2 align-items-center">
                        <FeatherIcon
                          icon="user"
                          size={16}
                          className="text-body-tertiary"
                        />
                        <p className="fw-semibold fs-9 mb-0 text-body-tertiary">
                          Company Name
                        </p>
                      </td>
                      <td>:</td>
                      <td className="fw-semibold fs-9 mb-0 text-body-emphasis">
                        <p className="align-items-center d-flex fs-9 fw-semibold gap-2 mb-0 text-body-emphasis">
                          {deal.company}
                          <Link to="#!">
                            <FontAwesomeIcon
                              icon={faSquarePhone}
                              className="text-body-tertiary"
                            />
                          </Link>
                          <Link to="#!">
                            <FontAwesomeIcon
                              icon={faSquareEnvelope}
                              className="text-body-tertiary"
                            />
                          </Link>
                          <Link to="#!">
                            <FontAwesomeIcon
                              icon={faWhatsappSquare}
                              className="text-body-tertiary"
                            />
                          </Link>
                        </p>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex gap-2 align-items-center">
                        <FeatherIcon
                          icon="calendar"
                          size={16}
                          className="text-body-tertiary"
                        />
                        <p className="fw-semibold fs-9 mb-0 text-body-tertiary">
                          Closing Date & Time
                        </p>
                      </td>
                      <td>:</td>
                      <td className="fw-semibold fs-9 mb-0 text-body-emphasis">
                        {deal.closingDate} . <span>{deal.closingTime}</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="d-flex gap-2 align-items-center">
                        <FeatherIcon
                          icon="headphones"
                          size={16}
                          className="text-body-tertiary"
                        />
                        <p className="fw-semibold fs-9 mb-0 text-body-tertiary">
                          Assigned Agent
                        </p>
                      </td>
                      <td>:</td>
                      <td className="fw-semibold fs-9 mb-0 text-body-emphasis">
                        <Form.Select
                          size="sm"
                          className="py-0 ms-n3 border-0 shadow-none"
                        >
                          {[
                            'Ally Aagaard',
                            'Lonnie Kub',
                            'Aida Moen',
                            'Niko Koss',
                            'Alec Haag',
                            'Ola Smith',
                            'Leif Walsh',
                            'Brain Cole',
                            'Reese Mann'
                          ].map(agent => (
                            <option key={agent}>{agent}</option>
                          ))}
                        </Form.Select>
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
              <p className="fs-9 mb-1">Probability:</p>
              <ProgressBar
                style={{ height: '8px' }}
                now={Number(deal.probability.value)}
                variant={deal.probability.variant}
              />
            </div>
          </Collapse>
        </Card.Body>
      </Card>
    </div>
  );
};

export default DealCard;
