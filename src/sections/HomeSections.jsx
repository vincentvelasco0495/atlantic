import { useEffect, useState } from 'react';
import {
  ArrowForward,
  Bed,
  ChevronLeft,
  ChevronRight,
  Close,
  EmailOutlined,
  Facebook,
  Instagram,
  LocalParking,
  LocationCity,
  LocationOnOutlined,
  Luggage,
  PhoneOutlined,
  PlayArrow,
  ScheduleOutlined,
  Star,
  Twitter,
  Wifi,
  WhatsApp,
  DirectionsBus,
  AccessTime,
  Person,
  LocationOn,
} from '@mui/icons-material';
import { Box, Button, Card, CardContent, CardMedia, Container, Dialog, DialogContent, IconButton, Stack, Typography } from '@mui/material';
import BookingForm from '../components/BookingForm';
import SectionHeader from '../components/SectionHeader';
import { NewsCard, RoomCard } from '../components/Cards';
import { branchImage, featuredBranchImages, gallery, news, reviews, rooms } from '../data';
import logo from '../assets/images/logo/logo.png';

export function useSectionReveal() {
  useEffect(() => {
    const sections = [...document.querySelectorAll('[data-scroll-section]')];
    if (!sections.length) return undefined;

    sections.forEach((section) => section.classList.add('scroll-reveal'));

    if (!('IntersectionObserver' in window)) {
      sections.forEach((section) => section.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        currentObserver.unobserve(entry.target);
      });
    }, { threshold: 0, rootMargin: '0px 0px -40px 0px' });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);
}

function HeroSection() {
  const heroSlides = featuredBranchImages;
  const heroImage = heroSlides[0]?.src;

  const features = [
    { icon: <LocationOn />, text: 'Malate, Manila' },
    { icon: <DirectionsBus />, text: 'Near Quirino LRT Station' },
    { icon: <AccessTime />, text: 'Open 24/7' },
    { icon: <Person />, text: 'Made for Seafarers' },
  ];

  return (
    <section className="hero-section-new" data-scroll-section>
      <Box className="hero-background">
        {heroImage && <img className="hero-slide is-active" src={heroImage} alt="Atlantic Seaman's Dormitory dormitory room with bunk beds" />}
        <Box className="hero-overlay" />
      </Box>
      <Container className="site-container hero-content-new">
        <Box className="hero-text-content">
          <Typography component="h1" className="hero-title-new">
            <span className="hero-title-atlantic">ATLANTIC</span>
            <span className="hero-title-dormitory">SEAMAN'S DORMITORY</span>
          </Typography>
          <Typography className="hero-tagline">Basta Seaman's Dorm, Atlantic Seaman's Dormitory Yan! ⚓</Typography>
          <Typography className="hero-description-new">
            Affordable, clean and convenient accommodation for Filipino seafarers in the heart of Manila.
          </Typography>
          <Box className="hero-features">
            {features.map((feature, index) => (
              <Box className="hero-feature-item" key={index}>
                <span className="hero-feature-icon">{feature.icon}</span>
                <Typography className="hero-feature-text">{feature.text}</Typography>
              </Box>
            ))}
          </Box>
          <Box className="hero-cta-buttons">
            <Button href="/rooms" className="hero-cta-primary">CHECK ROOM RATES</Button>
            <Button href="/contacts" className="hero-cta-secondary">RESERVE A BED</Button>
          </Box>
        </Box>
      </Container>
    </section>
  );
}

export function RoomsSection({ roomHref = '#rooms', bookingHref = '#contacts' }) {
  return (
    <section className="section section-block rooms-section" id="rooms" data-scroll-section>
      <Container className="site-container">
        <SectionHeader title="Room rates for seafarers" action="View all rooms" href={roomHref} />
        <Box className="rooms-grid">
          {rooms.map((room) => <RoomCard key={room.title} room={room} bookingHref={bookingHref} />)}
        </Box>
        <Card className="long-stay-card rooms-offer-card">
          <CardContent>
            <Box className="rooms-offer-copy"><Typography component="h3" className="long-stay-title">Special offer for seafarers</Typography><Typography className="long-stay-copy">Save more when you book a qualifying stay at Atlantic Seaman's Dormitory.</Typography></Box>
            <Typography className="rooms-offer-discount"><strong>10% OFF</strong> selected stays</Typography>
            <Button variant="contained" href={bookingHref} endIcon={<ArrowForward />}>Book now</Button>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

function AboutSection() {
  const [videoOpen, setVideoOpen] = useState(false);
  const features = [
     ['Clean and comfortable sleeping spaces', Bed],
     ['Convenient location in Manila', LocationCity],
     ['Secure space for your personal gear', Luggage],
     ['Reliable Wi-Fi and parking', LocalParking],
  ];
  return (
    <section className="section about-section" id="about" data-scroll-section>
      <Container className="site-container about-layout">
        <Box className="about-copy">
          <Typography component="h2" className="section-title">Everything a seafarer needs to feel at home</Typography>
          <Typography className="section-description">Atlantic Seaman's Dormitory is a clean, secure and affordable dormitory for seafarers. Rest comfortably, keep your gear close and enjoy practical amenities in a convenient Manila location while you prepare for your next voyage.</Typography>
          <Box className="feature-list">
            {features.map(([feature, FeatureIcon]) => <Typography key={feature}><FeatureIcon /> {feature}</Typography>)}
          </Box>
          <Stack direction="row" spacing={2} className="about-actions">
            <Button variant="contained" href="#contacts">Book now</Button>
            <Button href="#about" className="about-link" endIcon={<ArrowForward />}>More about</Button>
          </Stack>
        </Box>
        <Box className="about-media">
           <img src={branchImage('modesto', 'IMG_1874.PNG')} alt="A bright shared lounge at Atlantic Seaman's Dormitory" />
           <IconButton className="play-button" aria-label="Play Atlantic Seaman's Dormitory video" onClick={() => setVideoOpen(true)}><PlayArrow /></IconButton>
        </Box>
      </Container>
      <Dialog open={videoOpen} onClose={() => setVideoOpen(false)} fullWidth maxWidth="lg" className="video-dialog">
        <IconButton onClick={() => setVideoOpen(false)} aria-label="Close video" className="dialog-close"><Close /></IconButton>
          <DialogContent><iframe title="Atlantic Seaman's Dormitory video" src="https://www.youtube.com/embed/Scxs7L0vhZ4" allow="autoplay; encrypted-media" allowFullScreen /></DialogContent>
      </Dialog>
    </section>
  );
}

function RatingsSection() {
  const ratings = [
    ['8.3', '/10', '1398 comments', 'Booking.com'],
    ['4.6', '/5', '460 notes', 'Hostelworld'],
    ['4.9', '/5', '2389 notes', 'Tripadvisor'],
    ['98%', '', '2389 recommendations', 'Google'],
  ];
  return (
    <section className="ratings-section" data-scroll-section>
      <Container className="site-container ratings-grid">
        {ratings.map(([number, suffix, caption, provider]) => (
          <Box className="rating-item" key={number}>
            <Typography className="rating-number">{number}<small>{suffix}</small></Typography>
            <Typography className="rating-provider">{provider}</Typography>
            <Typography className="rating-caption">{caption}</Typography>
          </Box>
        ))}
      </Container>
    </section>
  );
}

function ReviewsSection() {
  const [active, setActive] = useState(0);
  const review = reviews[active];
  return (
    <section className="section reviews-section" data-scroll-section>
      <Container className="site-container reviews-layout">
        <Box className="review-gallery">
            <img className="review-current-image" src={review.image} alt={`${review.name}, ${review.role}`} />
           <Box className="review-thumbnails">{reviews.map((guest, index) => <button type="button" className={index === active ? 'is-active' : ''} onClick={() => setActive(index)} key={guest.name}><img src={guest.image} alt={`${guest.name} profile`} /></button>)}</Box>
        </Box>
        <Card className="review-card">
          <CardContent className="review-copy">
          <Typography className="eyebrow">Seafarer stories</Typography>
          <Typography component="h2" className="section-title">What seafarers say</Typography>
          <Typography className="review-date">Stay date: {review.date}</Typography>
          <Typography component="h3" className="review-title">{review.title}</Typography>
          <Box className="review-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} />)}</Box>
           <Typography className="review-body">{review.body}</Typography>
          <Stack direction="row" alignItems="center" spacing={2} className="review-person">
            <img src={review.image} alt={review.name} />
             <Box><Typography>{review.name}</Typography><Typography className="review-person-role">{review.role}</Typography></Box>
          </Stack>
          <Box className="review-card-controls">
            <IconButton onClick={() => setActive((active + reviews.length - 1) % reviews.length)} aria-label="Previous review"><ChevronLeft /></IconButton>
            <Typography>{String(active + 1).padStart(2, '0')} / 05</Typography>
            <IconButton onClick={() => setActive((active + 1) % reviews.length)} aria-label="Next review"><ChevronRight /></IconButton>
          </Box>
          </CardContent>
        </Card>
      </Container>
    </section>
  );
}

function PromoSection() {
  return (
    <section className="section promo-section" id="offers" data-scroll-section>
      <Container className="site-container promo-layout">
        <Box className="promo-copy">
          <Typography component="h2" className="section-title">A practical place to rest between voyages</Typography>
          <Typography className="section-description">Whether you are signing off, waiting for your next vessel, or traveling through Manila, Atlantic Seaman's Dormitory gives you a clean, secure, and comfortable place to stay.</Typography>
          <Stack className="promo-points" spacing={3}>
            {[
              ['Three Manila locations', LocationCity, 'Stay close to Malate, Ermita, and the city’s transport links'],
              ['Rooms for every stay', Wifi, 'Choose an affordable bedspace, solo room, or couple room'],
              ['Made for seafarers', Star, 'Rest with practical amenities, secure storage, and friendly support'],
            ].map(([point, PointIcon, description]) => (
              <Box key={point} className="promo-point">
                <span className="promo-point-icon"><PointIcon /></span>
                <Box><Typography component="h3">{point}</Typography><Typography>{description}</Typography></Box>
              </Box>
            ))}
          </Stack>
        </Box>
        <Box className="promo-media">
           <img src={branchImage('modesto', 'IMG_1876.PNG')} alt="A welcoming reception at the Modesto branch" />
          <Card className="promo-quote-card">
            <CardContent>
              <Typography className="promo-quote">“A clean bed, a warm welcome, and everything I needed between voyages.”</Typography>
                <Stack direction="row" spacing={1.5} alignItems="center" className="promo-author-row"><img src={branchImage('modesto', 'IMG_1876.PNG')} alt="Atlantic Seaman's Dormitory reception" /><Box><Typography className="promo-author">Atlantic Seaman's Dormitory team</Typography><Box className="promo-stars">{[1, 2, 3, 4, 5].map((star) => <Star key={star} />)}</Box></Box></Stack>
            </CardContent>
          </Card>
          <Card className="promo-room-card">
            <CardContent>
              <Typography className="promo-room-name">Solo Room</Typography>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography className="room-price">P 1,299 <span>/ 1 night</span></Typography>
                <Button href="#rooms" className="card-action" endIcon={<ArrowForward />}>See availability</Button>
              </Stack>
            </CardContent>
          </Card>
        </Box>
      </Container>
    </section>
  );
}

function GallerySection() {
  const [activeImage, setActiveImage] = useState(null);
  return (
    <section className="section gallery-section" id="gallery" data-scroll-section>
      <Container className="site-container">
        <SectionHeader title="Photos of our rooms" action="View full collection" href="/gallery" />
        <Box className="gallery-grid">
          {gallery.map((image, index) => <Box component="button" className={`gallery-item gallery-item-${index + 1}`} key={image} onClick={() => setActiveImage(image)} aria-label="View room photo"><img src={image} alt="Atlantic Seaman's Dormitory room" /><span><ArrowForward /></span></Box>)}
        </Box>
      </Container>
      <Dialog open={Boolean(activeImage)} onClose={() => setActiveImage(null)} maxWidth="xl" className="gallery-dialog">
        <IconButton onClick={() => setActiveImage(null)} aria-label="Close photo" className="dialog-close"><Close /></IconButton>
        <DialogContent>{activeImage && <img src={activeImage} alt="Atlantic Seaman's Dormitory room" />}</DialogContent>
      </Dialog>
    </section>
  );
}

function NewsSection() {
  return (
    <section className="section section-block news-section" id="news" data-scroll-section>
      <Container className="site-container">
        <SectionHeader title="Seafarer news and guides" action="View all news" href="#news" />
        <Box className="news-grid">{news.map((article) => <NewsCard article={article} key={article.title} />)}</Box>
      </Container>
    </section>
  );
}

function ContactsSection() {
  return (
    <section className="section contacts-section" id="contacts" data-scroll-section>
      <Container className="site-container contacts-layout">
        <Box className="contacts-copy">
          <Typography component="h2" className="section-title">Contacts</Typography>
          <Typography className="section-description">Contact our Adriatico branch for reservations, directions, and availability in Malate, Manila.</Typography>
          <Box className="contact-list">
            <Box className="contact-item"><PhoneOutlined /><Box><Typography className="contact-label">Phone</Typography><a href="tel:+639388873634">0938 887 3634</a></Box></Box>
            <Box className="contact-item"><EmailOutlined /><Box><Typography className="contact-label">Email</Typography><a href="mailto:postrano.lyssa@yahoo.com">postrano.lyssa@yahoo.com</a></Box></Box>
            <Box className="contact-item"><LocationOnOutlined /><Box><Typography className="contact-label">Location</Typography><Typography>1711 M. Adriatico St., Malate, Manila, Philippines, 1004</Typography></Box></Box>
            <Box className="contact-item"><ScheduleOutlined /><Box><Typography className="contact-label">Reservations</Typography><Typography>Contact us by phone for availability</Typography></Box></Box>
          </Box>
        </Box>
        <Box className="map-card" aria-label="Map showing Atlantic Seaman's Dormitory Adriatico branch">
          <iframe title="Atlantic Seaman's Dormitory Adriatico branch map" src="https://www.google.com/maps?q=1711+M.+Adriatico+St.,+Malate,+Manila,+Philippines,+1004&output=embed" loading="lazy" />
        </Box>
      </Container>
    </section>
  );
}

export function Footer() {
  return (
    <footer className="footer-section">
      <Container className="site-container footer-grid">
         <Box className="footer-brand"><Typography component="a" href="/" className="footer-logo"><span className="footer-logo-mark"><img src={logo} alt="" /></span>Atlantic Seaman's Dormitory</Typography><Typography>A clean, secure, and affordable dormitory where seafarers can rest, recharge, and feel at home between voyages in Manila.</Typography></Box>
        <Box className="footer-column"><Typography className="footer-heading">Quick links</Typography><a href="/">Home</a><a href="/about">About</a><a href="/rooms">Rooms</a><a href="/news">News</a></Box>
        <Box className="footer-column"><Typography className="footer-heading">Contact Us</Typography><Typography><LocationOnOutlined /> 1711 M. Adriatico St., Malate, Manila, Philippines, 1004</Typography><a href="tel:+639388873634"><PhoneOutlined /> 0938 887 3634</a><a href="mailto:postrano.lyssa@yahoo.com"><EmailOutlined /> postrano.lyssa@yahoo.com</a></Box>
        <Box className="footer-column footer-social"><Typography className="footer-heading">Follow Us</Typography><Typography>Follow us for branch updates, room availability, and seafarer news.</Typography><Stack direction="row" spacing={1}><IconButton aria-label="Facebook"><Facebook /></IconButton><IconButton aria-label="Twitter"><Twitter /></IconButton><IconButton aria-label="Instagram"><Instagram /></IconButton><IconButton aria-label="WhatsApp"><WhatsApp /></IconButton></Stack></Box>
      </Container>
        <Container className="site-container footer-bottom"><Typography>Atlantic Seaman's Dormitory. All rights reserved. Copyright 2026.</Typography></Container>
    </footer>
  );
}

export default function HomeSections() {
  useSectionReveal();
  return <><HeroSection /><RoomsSection /><AboutSection /><RatingsSection /><ReviewsSection /><PromoSection /><GallerySection /><NewsSection /><ContactsSection /><Footer /></>;
}
