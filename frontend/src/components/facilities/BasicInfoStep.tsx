import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Alert,
  Spinner,
  Image
} from 'components/ui';
import {  } from '';
import { faUpload, faTimes } from 'lucide-react';
import { Facility } from 'types';

interface BasicInfoStepProps {
  formData: Partial<Facility>;
  handleInputChange: (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => void;
  handleImageUpload: (files: FileList) => void;
  removeImage: (index: number) => void;
  uploadingImages: boolean;
}

const BasicInfoStep = ({
  formData,
  handleInputChange,
  handleImageUpload,
  removeImage,
  uploadingImages
}: BasicInfoStepProps) => {
  return (
    <Card className="mb-4">
      <Card.Header>
        <h5 className="mb-0">Step 1: Basic Information & Images</h5>
      </Card.Header>
      <Card.Body>
        {/* Image Upload Section */}
        <div className="mb-4">
          <Form.Label className="font-semibold">Facility Images *</Form.Label>
          <div className="border-2 border-dashed rounded p-4 text-center">
            <Form.Control
              type="file"
              multiple
              accept="image/*"
              onChange={e => {
                const files = (e.target as HTMLInputElement).files;
                if (files) handleImageUpload(files);
              }}
              className="d-none"
              id="imageUpload"
            />
            <label htmlFor="imageUpload" className="cursor-pointer">
              <
                icon={faUpload}
                size="2x"
                className="text-gray-600 dark:text-gray-400 mb-2"
              />
              <div className="text-gray-600 dark:text-gray-400">
                <strong>Click to upload images</strong> or drag and drop
              </div>
              <small className="text-gray-600 dark:text-gray-400">
                PNG, JPG, GIF up to 10MB each
              </small>
            </label>
          </div>

          {uploadingImages && (
            <div className="text-center mt-2">
              <Spinner animation="border" size="sm" className="me-2" />
              <span>Uploading images...</span>
            </div>
          )}

          {formData.images && formData.images.length > 0 && (
            <Row className="mt-3">
              {formData.images.map((image, index) => (
                <Col xs={6} md={4} lg={3} key={index} className="mb-3">
                  <div className="relative">
                    <Image
                      src={image.path}
                      alt={image.originalName}
                      className="w-100 rounded"
                      style={{ height: '120px', objectFit: 'cover' }}
                    />
                    <Button
                      variant="danger"
                      size="sm"
                      className="position-absolute top-0 end-0 m-1"
                      onClick={() => removeImage(index)}
                    >
                      < icon={faTimes} />
                    </Button>
                  </div>
                  <small className="text-gray-600 dark:text-gray-400 d-block mt-1">
                    {image.originalName}
                  </small>
                </Col>
              ))}
            </Row>
          )}

          {(!formData.images || formData.images.length === 0) && (
            <Alert variant="warning" className="mt-2">
              At least one image is required for the facility.
            </Alert>
          )}
        </div>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">Facility Name *</Form.Label>
              <Form.Control
                type="text"
                name="name"
                value={formData.name || ''}
                onChange={handleInputChange}
                required
                placeholder="Enter facility name"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">Address</Form.Label>
              <Form.Control
                type="text"
                name="location.address"
                value={formData.location?.address}
                onChange={handleInputChange}
                placeholder="Enter facility address"
              />
            </Form.Group>
          </Col>
        </Row>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">Latitude</Form.Label>
              <Form.Control
                type="number"
                step="any"
                name="location.coordinates.latitude"
                value={formData.location?.coordinates?.latitude}
                onChange={handleInputChange}
                placeholder="Latitude"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">Longitude</Form.Label>
              <Form.Control
                type="number"
                step="any"
                name="location.coordinates.longitude"
                value={formData.location?.coordinates?.longitude}
                onChange={handleInputChange}
                placeholder="Longitude"
              />
            </Form.Group>
          </Col>
        </Row>

        <Form.Group className="mb-3">
          <Form.Label className="font-semibold">Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={4}
            name="description"
            value={formData.description || ''}
            onChange={handleInputChange}
            placeholder="Describe the facility..."
          />
        </Form.Group>

        <Row>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">
                Maximum Capacity *
              </Form.Label>
              <Form.Control
                type="number"
                name="capacity.maximum"
                value={formData.capacity?.maximum || ''}
                onChange={handleInputChange}
                required
                min="1"
                placeholder="Maximum number of people"
              />
            </Form.Group>
          </Col>
          <Col md={6} className="mb-3">
            <Form.Group>
              <Form.Label className="font-semibold">
                Recommended Capacity
              </Form.Label>
              <Form.Control
                type="number"
                name="capacity.recommended"
                value={formData.capacity?.recommended || ''}
                onChange={handleInputChange}
                min="1"
                placeholder="Recommended number of people"
              />
            </Form.Group>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
};

export default BasicInfoStep;
