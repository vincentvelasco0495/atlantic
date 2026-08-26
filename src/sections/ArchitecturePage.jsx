import { useEffect, useState } from 'react';
import { ArrowDownward, ArrowForward, OpenInNew } from '@mui/icons-material';
import { Box, Container, Typography } from '@mui/material';
import { useSectionReveal } from './HomeSections';

const referenceBase = 'https://zm-design-sigma.vercel.app';

const roles = ['Interior Designer', 'Freelance CAD Operator', 'Civil Engineering Student'];

const services = [
  {
    number: '01',
    title: 'Precision CAD Drafting',
    copy: 'Accurate and detailed CAD drawings tailored to your specifications. Floor plans, elevations and sections drawn to build, not just to present.',
  },
  {
    number: '02',
    title: 'Creative Interior Design',
    copy: 'Transform your space with innovative and stylish design solutions. Material, light and layout resolved together so the room works as well as it looks.',
  },
  {
    number: '03',
    title: 'Full Drawing Sets',
    copy: 'Complete documentation for permit and construction: architectural, electrical and sanitary sheets with schedules, details and load calculations.',
  },
];

const cadWorks = [
  ['A-1', 'Architectural', 'Bubble Diagram', 'Ground floor, typical floor and roof deck space planning', 'a0-bubble-diagram-DGhDhqLe.webp', '/cad/ZM-A0-bubble-diagram.pdf'],
  ['A-1', 'Architectural', 'Site Development Plan', 'Plot plan at 1:250 and vicinity map - 393.571 sq.m. lot', 'a1-site-development-l5F2p0_y.webp', '/cad/ZM-A1-site-development-plan.pdf'],
  ['A-2', 'Architectural', 'Floor Plans', 'Dimensioned ground, typical and roof deck plans with door and window schedules', 'a2-floor-plans-BFnipiLt.webp', '/cad/ZM-A2-floor-plans.pdf'],
  ['A-3', 'Architectural', 'Elevations', 'Front, rear, left and right side elevations at 1:300', 'a3-1-elevations-QDkQY3FX.webp', '/cad/ZM-A3-1-elevations.pdf'],
  ['A-4', 'Architectural', 'Elevations II', 'Further elevation studies with floor lines and levels', 'a3-2-elevations-CgE1YLPF.webp', '/cad/ZM-A3-2-elevations.pdf'],
  ['E-1.1', 'Electrical', 'Riser Diagram & Panel Schedule', 'Single line diagram, mounting heights, load schedule and voltage drop calculation', 'e1-1-riser-panel-TEbU9XN7.webp', '/cad/ZM-E1-1-electrical-riser-and-panel.pdf'],
  ['E-1.2', 'Electrical', 'Lighting & Power Layout', 'Lighting and power layout plans across first, typical and roof deck floors', 'e1-2-lighting-power-D2MW_v77.webp', '/cad/ZM-E1-2-lighting-and-power-layout.pdf'],
  ['P-1', 'Sanitary', 'Sanitary Details', 'Septic tank, catch basin, floor drain and clean out details with legends', 'p1-sanitary-details-CpO0lwfe.webp', '/cad/ZM-P1-sanitary-details.pdf'],
  ['P-2', 'Sanitary', 'Water & Drainage Layout', 'Water line plus sewage and drainage layouts per floor', 'p2-water-and-drainage-CGoBectj.webp', '/cad/ZM-P2-water-and-drainage-layout.pdf'],
];

const portfolioItems = [
  ['bedroom-BpCmGzx3.webp', 'Bedroom'],
  ['chandelier-CcDR64rZ.webp', 'Chandelier'],
  ['cool_dinning-DJuiy74s.webp', 'Cool Dining'],
  ['cool_kitchen-Op_MTpJE.webp', 'Cool Kitchen'],
  ['cozy_living-DtgKtLOr.webp', 'Cozy Living'],
  ['deluxe_living-BVSN2ocZ.webp', 'Deluxe Living'],
  ['dinning_room-B9AMuRKu.webp', 'Dining Room'],
  ['flat_roof-D_jGmGBs.webp', 'Flat Roof'],
  ['floral_complex-BtDoPP3y.webp', 'Floral Complex'],
  ['floral_living-uGmj3sur.webp', 'Floral Living'],
  ['fresh_dining-D1wMhMWj.webp', 'Fresh Dining'],
  ['fresh_kitchen-DAH77-qP.webp', 'Fresh Kitchen'],
  ['living_room-BcWU2EwL.webp', 'Living Room'],
  ['marble_kitchen-D5aWUgjC.webp', 'Marble Kitchen'],
  ['naturalistic_dining-W9iemQS1.webp', 'Naturalistic Dining'],
  ['naturalistic_flat-qagS-QEq.webp', 'Naturalistic Flat'],
  ['naturalistic_living-Bh-6fZ-A.webp', 'Naturalistic Living'],
  ['outlander_flat-DgGZklLK.webp', 'Outlander Flat'],
  ['restroom-CkR55Fer.webp', 'Restroom'],
  ['shady_flat-CBT71Z2F.webp', 'Shady Flat'],
  ['sunlight_lounge-CuvkKjzo.webp', 'Sunlight Lounge'],
  ['warm_flat-C_YUzcR4.webp', 'Warm Flat'],
  ['warm_living-CiHyQlcS.webp', 'Warm Living'],
  ['white_dining-B8Ck4VtX.webp', 'White Dining'],
  ['white_fridge-Li10ndfT.webp', 'White Fridge'],
  ['0bcef641-adbe-4d67-8412-8f2c5d122347-CoJCncKl.webp', ''],
  ['0ce1a012-5eff-4276-bac8-dd2b376badc9-DB27naln.webp', ''],
  ['0d642d76-72d5-424f-a30f-23d2ba4dc530-C9_-NofR.webp', ''],
  ['0e2f759d-4fbc-4893-b569-1840d6e5418b-DcnnlTUG.webp', ''],
  ['1299b4c4-0c3c-483d-87e2-d8c26c526b92-Ix7h82pj.webp', ''],
  ['12f112a3-3d8c-4036-a7c6-903017974155-B9N-RY62.webp', ''],
  ['17b974ed-76cc-4468-a46c-a4f94d99bf84-By7buad8.webp', ''],
  ['206b7ea3-bea3-461a-8316-50ce43b614e0-Bt8eSzH0.webp', ''],
  ['20fc6479-0c73-4612-b6c6-9f24839ecb62-BPWi9Hbc.webp', ''],
  ['22e9460e-64b4-4ab8-b309-68d9f8fff8eb-eZxQ1ymB.webp', ''],
  ['412bd8ee-c0a1-4696-a912-e4b10d2bf763-C1HpBygP.webp', ''],
  ['456a178e-ac2b-47ac-ac66-48620750f2e6-B0LI1i2T.webp', ''],
  ['462dfb5f-34e2-4fbb-8914-9331dbd00101-DknY2M2N.webp', ''],
  ['4d5ff2c0-9d53-4331-ba4e-42b0a655b6f3-DnvqXehl.webp', ''],
  ['54a5a151-0960-4ac5-8eb7-786dab3a22bd-CdmsXjWg.webp', ''],
  ['5b6c9340-a5b5-4d6c-b085-eaf5dc1dde77-QQigLOQA.webp', ''],
  ['61077373-1eae-49f5-9faf-974b5d5ba660-DcV_YNrE.webp', ''],
  ['648cd771-15c5-457a-8019-fc49c54e3b3a-kb8fZRM2.webp', ''],
  ['6cc69f36-f453-4cb3-8462-851cc68c5cd9-yirUSOYd.webp', ''],
  ['73b6710b-4e57-470e-a3f7-40fc3763347f-CoSrG_JU.webp', ''],
  ['793dbaa5-a628-40f1-8f0c-b565d38b5b33-CugvykU3.webp', ''],
  ['7d4c80de-8122-46bf-834b-407d11e7860d-BF8-2csW.webp', ''],
  ['81fc8d41-f0fd-4f34-a5b0-73b4bc6e0d3d-D49PW3KX.webp', ''],
  ['951ebed3-cf45-4def-8075-0f514337e173-Bg_Gq0th.webp', ''],
  ['96cf7df9-081f-4b04-a483-5d4772bd40e0-CV9zZXFg.webp', ''],
  ['9b772313-5e0b-499b-8d6c-84f21a815d9a-Dv50-y58.webp', ''],
  ['a21a2ca7-f9d7-4efc-b0d7-f50c6b420353-CHKxZvIw.webp', ''],
  ['a372e9db-a342-469c-a305-b3819e78bcad-DyZ3xfVv.webp', ''],
  ['a48c6c61-4d32-4bc9-8cee-40c6af379d7c-DBLj2A01.webp', ''],
  ['ac67d805-f3c0-4510-98b3-3db421af7bdf-BTsytgMU.webp', ''],
  ['af2c616d-3a89-4d74-b965-3b71488d54c8-C3p_6S2e.webp', ''],
  ['af67b6da-4730-4b36-9f95-fd4c7bf26bae-BH87PVB_.webp', ''],
  ['b72a7421-fe36-478d-99f5-4f511931c258-usZpLC4L.webp', ''],
  ['c7d8de9c-b739-4e7b-9cba-b001d51b6499-mWuBfRlD.webp', ''],
  ['c8254612-5743-4f06-9dbe-2bb01abc3a78-BYBh-4wz.webp', ''],
  ['ca1a7b99-440d-400a-8a39-f287205a7cf9-XuUWqRD7.webp', ''],
  ['cd7cabed-8409-4dd7-b346-8c8802858d78-BTJ5ZAal.webp', ''],
  ['d644cfac-7f2a-40b0-b65a-4cae51c07f0e-CxXfH-Bi.webp', ''],
  ['d72df4dd-3195-44d6-878d-9ec00aeb0488-7XiqSZ6G.webp', ''],
  ['ea83c9e2-02b9-49d1-91bc-8ba3f33dd5f0-BCHsqfix.webp', ''],
  ['ee41f4c9-ffd4-4291-b740-d574d67a500c-C_t4FpMB.webp', ''],
  ['f3db81ea-fdd0-465b-994c-6355af1c2506-C9y_R8mO.webp', ''],
  ['fa03f343-e8ef-42c6-b9e3-20da57602261-L71Dbv2t.webp', ''],
];

function SectionRail({ number, label }) {
  return <Box className="architecture-section-rail"><span>{number}</span><i /><Typography className="architecture-eyebrow">{label}</Typography></Box>;
}

function ArchitectureHero() {
  const [activeRole, setActiveRole] = useState(0);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveRole((current) => (current + 1) % roles.length);
    }, 3200);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <header className="architecture-hero" data-scroll-section>
      <img className="architecture-hero-image" src={`${referenceBase}/assets/deluxe_living-BVSN2ocZ.webp`} alt="" />
      <Box className="architecture-hero-shade" />
      <Box className="architecture-hero-gradient" />
      <Container className="architecture-hero-content">
        <Box className="architecture-brand"><strong>ZM</strong><span>Design</span></Box>
        <Typography className="architecture-location">Cavite, Philippines</Typography>
        <Box className="architecture-hero-note"><span>Interior spaces</span><i /><span>Technical drawings</span></Box>
        <Box className="architecture-hero-bottom">
          <Box>
            <Typography component="h1" className="architecture-hero-title">Zjer Owric <span>Manalo</span></Typography>
            <Box className="architecture-role" aria-live="polite">{roles.map((role, index) => <span className={index === activeRole ? 'is-active' : ''} key={role}>{role}</span>)}</Box>
          </Box>
          <a href="#architecture-introduction" className="architecture-scroll-link">Scroll <ArrowDownward /></a>
        </Box>
      </Container>
    </header>
  );
}

function IntroductionSection() {
  return (
    <section id="architecture-introduction" className="architecture-section architecture-introduction" data-scroll-section>
      <Container className="architecture-container">
        <SectionRail number="01" label="Introduction" />
        <Box className="architecture-introduction-grid">
          <Box className="architecture-image-tile"><img src={`${referenceBase}/assets/my_team-fIK2-8eX.webp`} alt="Zjer Owric Manalo on site with his team" loading="lazy" /></Box>
          <Box className="architecture-copy">
            <Typography component="h2" className="architecture-display architecture-section-title">Bringing your <span>dream space</span> to life.</Typography>
            <Box className="architecture-body-copy">
              <p>Are you looking to bring your dream space to life? Look no further.</p>
              <p>I'm Zjer Owric Manalo, a passionate 4th-year Civil Engineering student at Rizal Technological University and a skilled freelance CAD operator and interior designer with one year of hands-on experience in the construction industry.</p>
              <p>Every space begins as a measured drawing and ends as somewhere you want to be. I work across both ends of that line, so what gets designed is what actually gets built.</p>
            </Box>
            <Box className="architecture-stats">
              <Box><strong>01</strong><span>Year in construction</span></Box>
              <Box><strong>70+</strong><span>Rendered spaces</span></Box>
              <Box><strong>4th</strong><span>Year civil engineering</span></Box>
            </Box>
          </Box>
        </Box>
      </Container>
    </section>
  );
}

function ServicesSection() {
  return (
    <section id="architecture-services" className="architecture-section architecture-services" data-scroll-section>
      <Container className="architecture-container">
        <SectionRail number="02" label="Services" />
        <Typography component="h2" className="architecture-display architecture-section-title">What I <span>offer.</span></Typography>
        <Box className="architecture-services-grid">
          <Box className="architecture-service-list">
            {services.map((service) => (
              <article className="architecture-service" key={service.number}>
                <span className="architecture-service-number">{service.number}</span>
                <Box><Typography component="h3">{service.title}</Typography><Typography>{service.copy}</Typography><span className="architecture-service-arrow"><ArrowForward /></span></Box>
              </article>
            ))}
          </Box>
          <Box className="architecture-image-tile architecture-services-image"><img src={`${referenceBase}/assets/services_bg-BMU2ftkp.webp`} alt="Exterior architectural render of a two-storey residence" loading="lazy" /></Box>
        </Box>
      </Container>
    </section>
  );
}

function CadSection() {
  return (
    <section id="architecture-cad" className="architecture-section architecture-cad" data-scroll-section>
      <Container className="architecture-container">
        <Box className="architecture-section-heading"><Box><SectionRail number="03" label="CAD Works" /><Typography component="h2" className="architecture-display architecture-section-title">The <span>drawings.</span></Typography></Box><Typography className="architecture-sheet-count">{cadWorks.length} Sheets</Typography></Box>
        <Box className="architecture-cad-intro"><Typography component="h3" className="architecture-display">Proposed Twelve Storey Commercial Hotel Building</Typography><Typography>Commerce Avenue, Biñan, Laguna · Full architectural, electrical and sanitary drawing set produced in AutoCAD for the Civil Engineering Department, Rizal Technological University.</Typography></Box>
        <Box className="architecture-cad-grid">
          {cadWorks.map(([id, discipline, title, copy, preview, file]) => (
            <a className="architecture-cad-card" href={`${referenceBase}${file}`} target="_blank" rel="noopener noreferrer" key={id + title}>
              <Box className="architecture-cad-sheet"><img src={`${referenceBase}/assets/${preview}`} alt={`Sheet ${id} - ${title}: ${copy}`} loading="lazy" /></Box>
              <Box className="architecture-cad-card-heading"><Box><Typography>{title}</Typography><Typography>{copy}</Typography></Box><span>{id}</span></Box>
              <Typography className="architecture-cad-discipline">{discipline}<span> <OpenInNew /></span></Typography>
            </a>
          ))}
        </Box>
      </Container>
    </section>
  );
}

function PortfolioSection() {
  return (
    <section id="architecture-work" className="architecture-section architecture-portfolio" data-scroll-section>
      <Container className="architecture-container">
        <SectionRail number="04" label="Selected Work" />
        <Box className="architecture-section-heading architecture-portfolio-heading"><Typography component="h2" className="architecture-display architecture-section-title">The <span>portfolio.</span></Typography><Typography className="architecture-space-count">68 Spaces</Typography></Box>
        <Box className="architecture-portfolio-grid">
          {portfolioItems.map(([image, caption], index) => (
            <figure className="architecture-portfolio-item" key={image}>
              <img src={`${referenceBase}/assets/${image}`} alt={caption || `Interior design space ${index + 1}`} loading="lazy" decoding="async" />
              <span className="architecture-portfolio-index">{String(index + 1).padStart(2, '0')}</span>
              {caption && <figcaption>{caption}</figcaption>}
            </figure>
          ))}
        </Box>
      </Container>
    </section>
  );
}

function ArchitectureContact() {
  return (
    <section id="architecture-contact" className="architecture-contact" data-scroll-section>
      <img className="architecture-contact-image" src={`${referenceBase}/assets/aesthetic_kitchen-SDxsh-rT.webp`} alt="" loading="lazy" />
      <Box className="architecture-contact-shade" />
      <Container className="architecture-container architecture-contact-content">
        <SectionRail number="05" label="Let's work together" />
        <Typography component="h2" className="architecture-display architecture-contact-title">Let's turn your <span>vision</span> into reality.</Typography>
        <Typography className="architecture-contact-copy">Reach out and tell me about the space. Email is the fastest way to get a considered reply.</Typography>
        <Box className="architecture-contact-details">
          <Box><span>Email</span><a href="mailto:zjerowric@gmail.com">zjerowric@gmail.com</a></Box>
          <Box><span>Phone</span><a href="tel:+639452756283">0945 275 6283</a></Box>
          <Box><span>Based In</span><p>Cavite, Philippines</p></Box>
        </Box>
        <Box className="architecture-social-links"><a href="https://www.facebook.com/profile.php?id=100012261910572" target="_blank" rel="noopener noreferrer">Facebook <ArrowForward /></a><a href="http://instagram.com/zeric___/" target="_blank" rel="noopener noreferrer">Instagram <ArrowForward /></a></Box>
      </Container>
    </section>
  );
}

function ArchitectureFooter() {
  return <footer className="architecture-footer"><Container className="architecture-container"><span>ZM Design</span><span>© {new Date().getFullYear()} Zjer Owric Manalo</span></Container></footer>;
}

export default function ArchitecturePage() {
  useSectionReveal();
  return <><main className="architecture-page"><ArchitectureHero /><IntroductionSection /><ServicesSection /><CadSection /><PortfolioSection /><ArchitectureContact /></main><ArchitectureFooter /></>;
}
