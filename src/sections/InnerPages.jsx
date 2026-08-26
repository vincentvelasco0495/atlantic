import { useState } from 'react';
import {
  ArrowForward,
  Bed,
  Check,
  ExpandMore,
  Groups,
  LocationOnOutlined,
  Luggage,
  MailOutline,
  PersonOutline,
  PhoneOutlined,
  Star,
} from '@mui/icons-material';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { NewsCard } from '../components/Cards';
import { allBranchImages, branchCoverImage, branchImage, branchImages, branches, news } from '../data';
import { Footer, RoomsSection, useSectionReveal } from './HomeSections';

const pageQuestions = [
  ['Which room is best for my stay?', 'Our bedspaces are ideal for budget-friendly stays, while solo and couple rooms offer more privacy. Tell us your dates and we can help you choose.'],
  ['Can I reserve a bedspace or private room?', 'Yes. You can reserve a bedspace, solo room, or couple room by contacting our Adriatico branch with your arrival and departure dates.'],
  ['Is storage available for my belongings?', 'Yes. Our dormitory provides secure storage so you can keep your personal belongings organized during your stay.'],
  ['What do I need to bring for check-in?', 'Bring a valid passport or seafarer ID, your reservation details, and the information needed for check-in.'],
  ['How close is the Adriatico branch to transport links?', 'The Adriatico branch is at 1711 M. Adriatico St., Malate, Manila, close to local transport, dining, and everyday essentials.'],
];

const pageHeroImages = {
  About: branchImage('adriatico', 'd335ab2f69a66ab73917a1dda1789c07.jpeg'),
  Rooms: branchImage('mabini', 'IMG_1854.JPG'),
  Gallery: branchImage('modesto', 'IMG_1873.PNG'),
  News: branchImage('modesto', 'IMG_1875.PNG'),
  Contacts: branchImage('adriatico', 'att.UHZIGmnUHJtaJiSFbgGxyKUSpnbnR0grCa22eX5kils.jpg'),
  'Popular questions about the hostel': branchImage('modesto', 'IMG_1876.PNG'),
  'Family Room with Private Bathroom': branchImage('mabini', 'IMG_1858.JPG'),
  Branches: branchCoverImage('modesto'),
};

const branchHeroImages = {
  adriatico: branchImage('adriatico', 'att.YTB-Sgbii_L3Pd_mxzUgZgeoJC4jWwsf5rIMZuVKFj0.jpg'),
  mabini: branchImage('mabini', 'att.fLV3Xu7Df6ulQJCjrr1eRFdo8HLUNZ5TADmJL9V7zJQ.jpg'),
  modesto: branchImage('modesto', 'att.tOvtWZR2-bzq0JF7IM4nqYUDBB9km3aV-BwdtJ07q1g.jpg'),
};

function PageHero({ title, image, imageFit = 'contain' }) {
  const branchName = title.endsWith(' Branch') ? title.split(' ')[0].toLowerCase() : null;
  const pageImage = image || (branchName ? branchCoverImage(branchName) : pageHeroImages[title]) || branchImage('modesto', 'IMG_1875.PNG');

  return (
    <section className={`page-hero ${title === 'Quirino (Upcoming) Branch' ? 'is-quirino' : ''}`} data-scroll-section>
      <Container className="site-container page-hero-layout">
        <Box className="page-hero-copy">
          <Typography component="h1" className="page-title">{title}</Typography>
        </Box>
        <Box className={`page-hero-image ${imageFit === 'cover' ? 'is-cover' : ''}`}><img src={pageImage} alt={`${title} at Atlantic Seaman's Dormitory`} /></Box>
      </Container>
    </section>
  );
}

function InnerPage({ children }) {
  useSectionReveal();
  return <><main>{children}</main><Footer /></>;
}

function AboutPage() {
  const benefits = [
    ['01', 'Clean and comfortable rooms for every stay', Groups],
    ['02', 'Secure storage for your personal gear', Luggage],
    ['03', 'A welcoming place to reset between voyages', Bed],
  ];
  const stages = [
    ['Choose your room', 'Compare bedspaces, solo rooms, and couple rooms, then select the stay that fits your schedule.'],
    ['Confirm your reservation', 'Contact the Adriatico branch with your dates and details so we can prepare for your arrival.'],
    ['Arrive and settle in', 'Check in, secure your belongings, and enjoy a clean place to rest between voyages.'],
  ];

  return (
    <InnerPage>
      <PageHero title="About" />
      <section className="section inner-benefits" data-scroll-section>
        <Container className="site-container">
           <Box className="inner-heading-centered"><Typography component="h2" className="section-title">Why seafarers choose Atlantic Seaman's Dormitory</Typography><Typography>Everything you need to rest, recharge, and prepare for your next voyage in Manila.</Typography></Box>
           <Box className="benefit-grid">{benefits.map(([number, text, BenefitIcon]) => <Box className="benefit-item" key={number}><span className="benefit-icon"><BenefitIcon /></span><Typography className="benefit-number">{number}</Typography><Typography>{text}</Typography></Box>)}</Box>
             <Box className="inner-feature-image"><img src={branchImage('modesto', 'IMG_1870.PNG')} alt="Atlantic Seaman's Dormitory lounge at the Modesto branch" /></Box>
        </Container>
      </section>
      <RoomsSection roomHref="/rooms" bookingHref="/contacts" />
      <section className="section stages-section" data-scroll-section>
           <Container className="site-container stages-layout"><Box><Typography component="h2" className="section-title">Stages of booking a room</Typography><Stack className="stage-list" spacing={3}>{stages.map(([title, text], index) => <Box className="stage-item" key={title}><span>0{index + 1}</span><Box><Typography component="h3">{title}</Typography><Typography>{text}</Typography></Box></Box>)}</Stack><Button variant="contained" href="/rooms" endIcon={<ArrowForward />}>Choose room</Button></Box><Box className="stages-image"><img src={branchImage('adriatico', 'IMG_1854.JPG')} alt="Atlantic Seaman's Dormitory dorm at the Adriatico branch" /></Box></Container>
      </section>
       <section className="section section-block rules-section" data-scroll-section>
         <Container className="site-container rules-layout"><Box><Typography component="h2" className="section-title">A simple, comfortable stay</Typography><Stack className="check-list" spacing={2}><Typography><Check /> Check-in is available after 2:00 pm</Typography><Typography><Check /> Bring a valid passport or seafarer ID for registration</Typography><Typography><Check /> Keep shared spaces clean and respect fellow guests</Typography></Stack></Box><Typography className="rules-copy">We keep every stay straightforward, secure, and comfortable so you can focus on rest before your next journey.</Typography></Container>
      </section>
        <section className="section question-section" data-scroll-section><Container className="site-container question-card"><Box><Typography component="h2" className="section-title">Ready to plan your stay?</Typography><Typography className="section-description">Tell us your arrival date and preferred room. Our Adriatico team can help you choose the right option.</Typography></Box><Button variant="contained" href="/contacts" endIcon={<ArrowForward />}>Contact Adriatico branch</Button></Container></section>
       <FaqSection title="Questions about staying with us" />
          <section className="section founder-section" data-scroll-section><Container className="site-container founder-layout"><Box className="founder-image"><img src={branchImage('adriatico', 'IMG_1856.JPG')} alt="Atlantic Seaman's Dormitory sleeping area at the Adriatico branch" /></Box><Box><Typography className="founder-quote">“After a long voyage, every seafarer deserves a clean bed, a warm welcome, and room to recharge.”</Typography><Typography className="founder-name">The Atlantic Seaman's Dormitory team</Typography><Typography className="founder-role">Welcoming seafarers in Manila</Typography></Box><Box className="newsletter-card"><Typography component="h3">Plan a comfortable stay</Typography><Typography>Choose a bedspace or private room, share your dates, and let our team help you find the right fit.</Typography><Button href="/rooms" className="card-action" endIcon={<ArrowForward />}>Explore rooms</Button></Box></Container></section>
    </InnerPage>
  );
}

function RoomsPage() {
  return <InnerPage><PageHero title="Rooms" image={branchImage('modesto', 'att.6Dafppv7gfbEaRqfZWvNORtXwOoj1rVAaoHOIr7RAxg.jpg')} imageFit="cover" /><RoomsSection roomHref="/rooms" bookingHref="/contacts" /></InnerPage>;
}

function BranchDetails({ address, phone, email }) {
  return <Stack className="branch-details" spacing={1.5}><Box className="branch-contact-row"><LocationOnOutlined /><Typography><strong>Address</strong>{address}</Typography></Box>{phone && <Box className="branch-contact-row"><PhoneOutlined /><Typography><strong>Phone</strong>{phone === 'N/A' ? phone : <a href={`tel:${phone.replaceAll(' ', '')}`}>{phone}</a>}</Typography></Box>}{email && <Box className="branch-contact-row"><MailOutline /><Typography><strong>Email</strong>{email === 'N/A' ? email : <a href={`mailto:${email}`}>{email}</a>}</Typography></Box>}</Stack>;
}

const branchDirectoryImages = {
  adriatico: branchImage('adriatico', 'att.DAC1lnKLHrePnHR5XXFvKBypmkoJEx-RfCTBVUYtP5A.jpg'),
  mabini: branchImage('mabini', 'att.lYP7WYjrhaveChbuakn-9BjEH9s2-EgchObs346xl_s.jpg'),
  modesto: branchImage('modesto', 'att.6Dafppv7gfbEaRqfZWvNORtXwOoj1rVAaoHOIr7RAxg.jpg'),
  quirino: branchImage('quirino', 'ChatGPT Image Aug 17, 2026, 11_08_46 AM.png'),
};

function BranchesPage() {
  return <InnerPage><PageHero title="Branches" imageFit="cover" /><section className="section branches-section" data-scroll-section><Container className="site-container"><Box className="branches-intro"><Box><Typography className="eyebrow">Find your stay</Typography><Typography component="h2" className="section-title">Three locations, one welcoming stay</Typography><Typography className="section-description">Choose the Atlantic Seaman's Dormitory branch that puts you closest to the places you want to explore in Manila.</Typography></Box><Typography className="branches-count">03<br /><span>branches</span></Typography></Box><Box className="branches-grid">{branches.map(({ name, id, address, phone, email }, index) => <Card className="branch-card" id={id} key={id}><Box className="branch-card-image"><img src={branchDirectoryImages[id] || branchCoverImage(id, index)} alt={`${name} branch accommodation`} /></Box><CardContent><Box className="branch-card-heading"><Typography component="h2" className="section-title">{name}</Typography><span className="branch-card-number">/{String(index + 1).padStart(2, '0')}</span></Box><BranchDetails address={address} phone={phone} email={email} /><Button variant="contained" href={`/branch/${id}`} endIcon={<ArrowForward />} sx={{ mt: 3 }}>View branch</Button></CardContent></Card>)}</Box><Box className="branches-map-layout"><Box className="branches-map-copy"><Typography className="eyebrow">Explore the area</Typography><Typography component="h2" className="section-title">Stay close to Manila</Typography><Typography className="section-description">Our branches are located around the Malate and Ermita area, close to the city’s energy, dining, and transport links.</Typography><Button href="/contacts" className="text-action" endIcon={<ArrowForward />}>Get in touch</Button></Box><Box className="branches-map-card"><iframe title="Atlantic Seaman's Dormitory branches map" src="https://www.google.com/maps?q=Malate+Manila+Philippines&output=embed" loading="lazy" /></Box></Box></Container></section></InnerPage>;
}

function BranchPage({ branch }) {
  const [visibleCount, setVisibleCount] = useState(6);
  const [activeImage, setActiveImage] = useState(null);
  const coverImage = branchCoverImage(branch.id);
  const branchGalleryImages = (branchImages[branch.id] || [])
    .filter(({ src }) => src !== coverImage)
    .map(({ src, file }) => ({ src, file }));
  const galleryImages = [{ src: coverImage, file: 'branch-cover' }, ...branchGalleryImages];
  const visibleGalleryImages = galleryImages.slice(0, visibleCount);
  const hasMoreImages = visibleCount < galleryImages.length;

  return <InnerPage><PageHero title={`${branch.name} Branch`} image={branchHeroImages[branch.id]} imageFit={branchHeroImages[branch.id] ? 'cover' : undefined} /><section className="section branch-detail-section" data-scroll-section><Container className="site-container branch-detail-layout"><Box className="branch-detail-copy"><Typography className="eyebrow">Atlantic Seaman's Dormitory branch</Typography><Typography component="h2" className="section-title">{branch.name}</Typography><Typography className="section-description">Contact the {branch.name} branch for reservations and local information.</Typography><BranchDetails address={branch.address} phone={branch.phone} email={branch.email} /><Button variant="contained" href="/branches" endIcon={<ArrowForward />} sx={{ mt: 4 }}>View all branches</Button></Box><Box className="branch-detail-visual"><Box className="branch-detail-gallery">{visibleGalleryImages.map(({ src, file }, index) => <button type="button" className="branch-gallery-item" onClick={() => setActiveImage(src)} aria-label={`View ${branch.name} branch photo`} key={file}><img src={src} alt={`${branch.name} branch interior`} loading={index === 0 ? 'eager' : 'lazy'} decoding="async" /></button>)}</Box>{hasMoreImages && <Box className="branch-gallery-actions"><Button type="button" variant="outlined" className="branch-gallery-load-more" onClick={() => setVisibleCount((current) => Math.min(current + 6, galleryImages.length))}>Load more <span>({galleryImages.length - visibleCount} remaining)</span></Button></Box>}<Box className="branch-detail-map"><iframe title={`${branch.name} branch map`} src={`https://www.google.com/maps?q=${encodeURIComponent(branch.address)}&output=embed`} loading="lazy" /></Box></Box></Container></section><Dialog open={Boolean(activeImage)} onClose={() => setActiveImage(null)} maxWidth="xl" className="gallery-dialog"><DialogContent>{activeImage && <img src={activeImage} alt={`${branch.name} branch interior`} />}</DialogContent></Dialog></InnerPage>;
}

function GalleryPage() {
  const [filter, setFilter] = useState('All');
  const [activeImage, setActiveImage] = useState(null);
  const filters = ['All', 'Adriatico', 'Mabini', 'Modesto'];
  const visibleImages = filter === 'All' ? allBranchImages : (branchImages[filter.toLowerCase()] || []);
  return (
    <InnerPage>
      <PageHero title="Gallery" />
      <section className="section gallery-page-section" data-scroll-section>
        <Container className="site-container">
          <Box className="gallery-page-toolbar">
            <Box className="gallery-filter">
              {filters.map((item) => <Button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</Button>)}
            </Box>
            <Typography className="gallery-result-count">{visibleImages.length} photos</Typography>
          </Box>
          <Box className="gallery-page-grid">
            {visibleImages.map(({ src, branch, file }) => (
              <Box component="button" type="button" className="gallery-page-item" onClick={() => setActiveImage(src)} key={`${branch}/${file}`}>
                <img src={src} alt={`${branch} branch accommodation`} loading="lazy" />
                <span><ArrowForward /></span>
              </Box>
            ))}
          </Box>
        </Container>
        <Dialog open={Boolean(activeImage)} onClose={() => setActiveImage(null)} maxWidth="xl" className="gallery-dialog">
          <DialogContent>{activeImage && <img src={activeImage} alt="Atlantic Seaman's Dormitory room" />}</DialogContent>
        </Dialog>
      </section>
    </InnerPage>
  );
  /*
  return <InnerPage><PageHero title="Gallery" /><section className="section gallery-page-section" data-scroll-section><Container className="site-container"><Box className="gallery-page-toolbar"><Box className="gallery-filter">{filters.map((item) => <Button className={filter === item ? 'active' : ''} onClick={() => setFilter(item)} key={item}>{item}</Button>)}</Box><Typography className="gallery-result-count">{visibleImages.length} photos</Typography></Box><Box className="gallery-page-grid">{visibleImages.map(({ src, branch, file }) => <Box component="button" type="button" className="gallery-page-item" onClick={() => setActiveImage(src)} key={`${branch}/${file}`}><img src={src} alt={`${branch} branch accommodation`} loading="lazy" /><span><ArrowForward /></span></Box>)}</Box></Container><Dialog open={Boolean(activeImage)} onClose={() => setActiveImage(null)} maxWidth="xl" className="gallery-dialog"><DialogContent>{activeImage && <img src={activeImage} alt="Hosteller room" /></DialogContent></Dialog></section></InnerPage>;
  */
}

function FaqSection({ title = 'Questions about staying with us', standalone = false }) {
  return <section className={`section faq-section ${standalone ? 'section-block' : ''}`} data-scroll-section><Container className="site-container faq-layout"><Box><Typography component="h2" className="section-title">{title}</Typography><Typography className="section-description">Clear answers about rooms, reservations, check-in, storage, and staying at our Adriatico branch.</Typography></Box><Box className="faq-list">{pageQuestions.map(([question, answer]) => <Accordion key={question}><AccordionSummary expandIcon={<ExpandMore />}>{question}</AccordionSummary><AccordionDetails>{answer}</AccordionDetails></Accordion>)}</Box></Container></section>;
}

function FaqPage() {
  return <InnerPage><PageHero title="Popular questions about the hostel" /><FaqSection standalone /><section className="section get-in-touch-section" data-scroll-section><Container className="site-container"><Typography component="h2" className="section-title">Get in touch</Typography><Typography className="section-description">Egestas pretium aenean pharetra magna ac. Et tortor consequat id porta nibh venenatis cras sed</Typography><Box component="form" className="contact-form" onSubmit={(event) => event.preventDefault()}><TextField placeholder="Your name" /><TextField placeholder="Your email" type="email" /><TextField placeholder="Your message" multiline minRows={4} /><Button variant="contained" type="submit">Submit</Button></Box></Container></section></InnerPage>;
}

function NewsPage() {
  return <InnerPage><PageHero title="News" /><section className="section section-block inner-news-section" data-scroll-section><Container className="site-container"><Box className="section-header"><Typography component="h2" className="section-title">Seafarer news and guides</Typography><Typography>Practical stories and useful tips for your stay in Manila</Typography></Box><Box className="news-grid">{news.map((article) => <NewsCard article={article} key={article.title} />)}</Box></Container></section></InnerPage>;
}

function RoomDetailPage() {
  return <InnerPage><PageHero title="Family Room with Private Bathroom" /><section className="section detail-section" data-scroll-section><Container className="site-container detail-layout"><Box className="detail-image"><img src={branchImage('mabini', 'IMG_1858.JPG')} alt="Family Room with Private Bathroom" /></Box><Box className="detail-copy"><Typography className="eyebrow">Private ensuite room</Typography><Typography component="h1" className="section-title">Family Room with Private Bathroom</Typography><Typography className="detail-price">$149 <small>/ 1 night</small></Typography><Typography className="section-description">Posuere morbi leo urna molestie at elementum eu facilisis sed. Diam phasellus vestibulum lorem sed risus ultricies tristique.</Typography><Stack direction="row" spacing={2} className="room-meta"><span><PersonOutline />4 Sleeps</span><span><Bed />2 twin beds</span></Stack><Button variant="contained" href="/contacts" sx={{ mt: 4 }}>See availability</Button></Box></Container></section></InnerPage>;
}

function ContactsPage() {
  return <InnerPage><PageHero title="Contacts" imageFit="cover" /><section className="section contacts-page-section" data-scroll-section><Container className="site-container"><Box className="contacts-page-grid"><Box><Typography component="h2" className="section-title">Contacts</Typography><Typography className="section-description">Contact our Adriatico branch for reservations, directions, and availability in Malate, Manila.</Typography><Stack className="contact-page-list" spacing={3}><Typography><strong>Phone</strong><a href="tel:+639388873634">0938 887 3634</a></Typography><Typography><strong>Email</strong><a href="mailto:postrano.lyssa@yahoo.com">postrano.lyssa@yahoo.com</a></Typography><Typography><strong>Location</strong>1711 M. Adriatico St., Malate, Manila, Philippines, 1004</Typography><Typography><strong>Reservations</strong>Contact us by phone for availability</Typography></Stack></Box><iframe className="contacts-page-map" title="Atlantic Seaman's Dormitory Adriatico branch map" src="https://www.google.com/maps?q=1711+M.+Adriatico+St.,+Malate,+Manila,+Philippines,+1004&output=embed" loading="lazy" /></Box></Container></section></InnerPage>;
}

function ErrorPage() {
  return <InnerPage><section className="error-page"><Container className="site-container"><Box className="error-page-image"><img src={branchImage('mabini', 'IMG_1858.JPG')} alt="A welcoming Atlantic Seaman's Dormitory room" /></Box><Typography className="error-code">404</Typography><Typography component="h1" className="section-title">The page was not found</Typography><Typography>Sorry, the page you are looking for does not exist or has been moved.</Typography><Button variant="contained" href="/" endIcon={<ArrowForward />}>Back to home</Button></Container></section></InnerPage>;
}

export function RoutePage({ path }) {
  if (path === '/about') return <AboutPage />;
  if (path === '/rooms') return <RoomsPage />;
  if (path === '/gallery') return <GalleryPage />;
  if (path === '/faq' || path === '/faq2') return <FaqPage />;
  if (path === '/room') return <RoomDetailPage />;
  if (path === '/news' || path === '/post') return <NewsPage />;
  if (path === '/branches') return <BranchesPage />;
  const branch = branches.find(({ id }) => path === `/branch/${id}`);
  if (branch) return <BranchPage branch={branch} />;
  if (path === '/contacts' || path === '/contacts2') return <ContactsPage />;
  if (path === '/error' || path === '/404') return <ErrorPage />;
  return null;
}
