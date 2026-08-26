const base = 'https://html.merku.love/hosteller';

import seafarerOne from './assets/images/seafarer/1.png';
import seafarerTwo from './assets/images/seafarer/2.png';
import seafarerThree from './assets/images/seafarer/3.png';
import seafarerFour from './assets/images/seafarer/4.png';
import seafarerFive from './assets/images/seafarer/5.png';

export const asset = (path) => `${base}/${path}`;

const branchAssetModules = import.meta.glob('./assets/images/branches/**/*.{jpg,jpeg,png,JPG,JPEG,PNG}', {
  eager: true,
  import: 'default',
  query: '?url',
});

const branchImageEntries = Object.entries(branchAssetModules)
  .map(([path, src]) => {
    const match = path.match(/branches\/([^/]+)\/(.+)$/);
    return match ? { branch: match[1], file: match[2], src } : null;
  })
  .filter(Boolean)
  .sort((left, right) => left.file.localeCompare(right.file, undefined, { numeric: true, sensitivity: 'base' }));

export const branchImages = branchImageEntries.reduce((groups, image) => {
  groups[image.branch] = groups[image.branch] || [];
  groups[image.branch].push(image);
  return groups;
}, {});

export const allBranchImages = branchImageEntries;

export const branchImage = (branch, file) => branchImages[branch]?.find((image) => image.file === file)?.src;

export const branchImageAt = (branch, index = 0) => {
  const images = branchImages[branch] || [];
  return images.length ? images[index % images.length].src : undefined;
};

const preferredBranchCovers = {
  adriatico: 'IMG_1856.JPG',
  mabini: 'IMG_1855.JPG',
  modesto: 'IMG_1873.PNG',
};

const branchFallbackImage = branchImage('mabini', 'IMG_1858.JPG') || allBranchImages[0]?.src;

export const branchCoverImage = (branch, index = 0) => (
  branchImage(branch, preferredBranchCovers[branch])
  || branchImageAt(branch, index)
  || branchFallbackImage
);

export const featuredBranchImages = [
  { src: branchImage('adriatico', 'att.UHZIGmnUHJtaJiSFbgGxyKUSpnbnR0grCa22eX5kils.jpg'), alt: "Atlantic Seaman's Dormitory accommodation at the Adriatico branch" },
  { src: branchImage('adriatico', '31dfc26b3c344c898e32448ea9a89e02.jpeg'), alt: "Atlantic Seaman's Dormitory reception at the Adriatico branch" },
  { src: branchImage('adriatico', 'IMG_1856.JPG'), alt: "Atlantic Seaman's Dormitory seafarer dormitory with bunk beds" },
  { src: branchImage('adriatico', 'IMG_1854.JPG'), alt: "Atlantic Seaman's Dormitory couple room at the Adriatico branch" },
  { src: branchImage('adriatico', 'seaman.jpg'), alt: "Seafarer at Atlantic Seaman's Dormitory" },
  // { src: 'https://images.unsplash.com/photo-1773829149054-b37887a28053?auto=format&fit=crop&w=1800&q=85', alt: 'Life preserver on a ship railing at sunset' },
];

export const navItems = [
  { label: 'Home', href: '/' },
  { label: 'About', href: '/about' },
  { label: 'Rooms', href: '/rooms' },
  { label: 'Branches', href: '/branches', dropdown: true },
  { label: 'Other Offers', href: '#offers', dropdown: true, noNavigation: true },
  { label: 'Contacts', href: '/contacts' },
];

export const branches = [
  {
    name: 'Adriatico',
    id: 'adriatico',
    address: '1711 M. Adriatico St., Malate, Manila, Philippines, 1004',
    phone: '0938 887 3634',
    email: 'postrano.lyssa@yahoo.com',
  },
  {
    name: 'Mabini',
    id: 'mabini',
    address: 'Mabini St., Ermita, Philippines',
    phone: '0927 945 3818',
    email: 'asd.mabinibranch@gmail.com',
  },
  {
    name: 'Modesto',
    id: 'modesto',
    address: '2065 MODESTO STREET MALATE, Manila, Philippines, 1004',
    phone: '+63 938 887 3634',
    email: 'asd.mabinibranch@gmail.com',
  },
  {
    name: 'Quirino (Upcoming)',
    id: 'quirino',
    address: 'N/A',
    phone: 'N/A',
    email: 'N/A',
    upcoming: true,
  },
];

export const rooms = [
  {
    image: branchImage('adriatico', 'IMG_1856.JPG'),
    price: 'P 250.00',
    title: 'Bedspace',
    sleeps: '1 Guest',
    beds: '1 bunk bed',
    description: 'A clean and affordable bunk with secure storage and a friendly shared space to rest between voyages.',
  },
  {
    image: branchImage('adriatico', 'IMG_1854.JPG'),
    price: 'P 1,799',
    title: 'Couple Room',
    sleeps: '2 Guests',
    beds: '1 double bed',
    description: 'A private and comfortable room for two guests who want quality rest, quiet moments and more space.',
  },
  {
    image: branchImage('adriatico', 'IMG_1855.JPG'),
    price: 'P 1,299',
    title: 'Solo Room',
    sleeps: '1 Guest',
    beds: '1 single bed',
    description: 'Your own peaceful room for privacy, comfort and a good night\'s sleep before your next voyage.',
  },
];

export const reviews = [
  { date: 'January 2026', title: 'Quiet rest after signing off', body: "After a long rotation at sea, I needed a clean, quiet place to rest. Atlantic Seaman's Dormitory gave me a comfortable bed and the calm I needed before traveling home.", name: 'Miguel Santos', role: 'Deck Officer', image: seafarerOne },
  { date: 'February 2026', title: 'A warm welcome after a long voyage', body: 'The room was clean, the crew were helpful, and I felt welcome as soon as I arrived. It was the right place to recharge before my next assignment.', name: 'Arnel Dela Cruz', role: 'Marine Engineer', image: seafarerTwo },
  { date: 'March 2026', title: 'Convenient for my Manila transit', body: "The location made it easy to reach the port, transport, and the places I needed in Manila. I had a comfortable base while waiting for my next contract.", name: 'Maria Reyes', role: 'Navigation Officer', image: seafarerThree },
  { date: 'April 2026', title: 'Practical and comfortable between contracts', body: 'I appreciated the secure space for my gear, reliable Wi-Fi, and restful room. Everything I needed was ready after a long day at sea.', name: 'Rafael Bautista', role: 'Deck Crew', image: seafarerFour },
  { date: 'May 2026', title: 'A friendly home away from the sea', body: 'It was good to meet fellow seafarers in a clean, welcoming place. The team made my stay easy from check-in to departure.', name: 'Jonas Villanueva', role: 'Ship Chef', image: seafarerFive },
];

export const news = [
  { category: 'Seafarer life', image: branchImage('modesto', 'IMG_1875.PNG'), title: 'How to rest well after signing off', description: 'Practical tips for settling in, recovering from a long voyage, and preparing for your next assignment.', date: 'June 2026', readTime: '4 min read' },
  { category: 'Your stay', image: branchImage('adriatico', 'IMG_1854.JPG'), title: 'Choosing the right room for your stay', description: 'Compare bedspaces, solo rooms, and couple rooms to find a comfortable base between contracts.', date: 'May 2026', readTime: '3 min read' },
  { category: 'Manila guide', image: branchImage('modesto', 'IMG_1876.PNG'), title: 'Your local guide to Malate and Ermita', description: 'Useful tips for transport, meals, and everyday essentials close to our dormitory branches.', date: 'April 2026', readTime: '5 min read' },
];

export const gallery = [
  branchImage('adriatico', 'att.DAC1lnKLHrePnHR5XXFvKBypmkoJEx-RfCTBVUYtP5A.jpg'),
  branchImage('adriatico', 'att.ho4C_DG8lIQdZJPJg3IVT3F-_9X97OrBAuMYQ487TQQ.jpg'),
  branchImage('adriatico', 'IMG_1857.JPG'),
  branchImage('adriatico', 'att.q7Rrn2gsOiUX1id85jIVF9dPCUSDZueo_zOEdzUIQZk.jpg'),
].filter(Boolean);
