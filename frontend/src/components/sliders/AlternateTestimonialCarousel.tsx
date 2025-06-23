import { Carousel } from 'react-bootstrap';
import bg39 from 'assets/img/bg/39.png';
import bgLeft from 'assets/img/bg/bg-left-22.png';
import bgRight from 'assets/img/bg/bg-right-22.png';
import { Testimonial, alternateTestimonial } from 'data/landing/testimonial';
import Rating from 'components/base/Rating';
import Avatar from 'components/base/Avatar';

const TestimonialItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="text-center py-8 px-5 px-xl-15">
      <Rating initialValue={testimonial.rating} readonly />
      <h3 className="fw-semibold fst-italic mt-3 mb-8 w-xl-70 mx-auto lh-base">
        {testimonial.comment}
      </h3>
      <div className="d-flex align-items-center justify-content-center gap-3 mx-auto">
        <Avatar
          src={testimonial.avatar}
          size="3xl"
          imageClassName="border border-2 border-primary"
        />
        <div className="text-start">
          <h5>{testimonial.name}</h5>
          <p className="mb-0">{testimonial.occupation}</p>
        </div>
      </div>
    </div>
  );
};

const AlternateTestimonialCarousel = () => {
  return (
    <div className="testimonial-carousel position-relative dark__bg-gray-1100">
      <div
        className="bg-holder d-none d-xl-block"
        style={{
          backgroundImage: `url(${bg39})`,
          backgroundSize: '186px',
          backgroundPosition: 'top 20px right 20px'
        }}
      />
      <img
        src={bgLeft}
        alt=""
        className="position-absolute d-none d-lg-block"
        width={150}
        style={{ top: '-100px', left: '-70px' }}
      />
      <img
        src={bgRight}
        alt=""
        className="position-absolute d-none d-lg-block"
        width={150}
        style={{ bottom: '-80px', right: '-80px' }}
      />
      <Carousel controls={false}>
        {alternateTestimonial.map(testimonial => (
          <Carousel.Item key={testimonial.id}>
            <TestimonialItem testimonial={testimonial} />
          </Carousel.Item>
        ))}
      </Carousel>
    </div>
  );
};

export default AlternateTestimonialCarousel;
