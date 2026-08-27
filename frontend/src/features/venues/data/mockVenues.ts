import type { Venue } from '../types';

export const MOCK_VENUES: Venue[] = [
  {
    id: 'v-1',
    name: 'Apex Sports Arena',
    tagline: 'Premier Olympic-grade indoor & outdoor sports hub',
    description: 'Apex Sports Arena offers state-of-the-art synthetic badminton courts, professional artificial turf for football, and floodlit tennis courts. Complete with air-conditioned locker rooms, cafeteria, and ample parking.',
    city: 'Delhi NCR',
    area: 'Gurugram, Sector 45',
    fullAddress: 'Plot 12, Golf Course Ext Rd, Sector 45, Gurugram, Haryana 122003',
    latitude: 28.4357,
    longitude: 77.0858,
    sports: ['Badminton', 'Tennis', 'Football', 'Basketball'],
    venueType: 'BOTH',
    startingPrice: 450,
    rating: 4.8,
    reviewCount: 142,
    images: [
      'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: true,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a2', name: 'Changing Rooms', icon: '👕' },
      { id: 'a3', name: 'Showers', icon: '🚿' },
      { id: 'a4', name: 'Cafeteria', icon: '☕' },
      { id: 'a5', name: 'Floodlights', icon: '💡' },
      { id: 'a6', name: 'First Aid', icon: '🩹' },
    ],
    courts: [
      { id: 'c-101', name: 'Badminton Court 1 (BWF Mat)', sport: 'Badminton', pricePerHour: 450, openingTime: '06:00', closingTime: '23:00', status: 'ACTIVE' },
      { id: 'c-102', name: 'Badminton Court 2 (BWF Mat)', sport: 'Badminton', pricePerHour: 450, openingTime: '06:00', closingTime: '23:00', status: 'ACTIVE' },
      { id: 'c-103', name: 'Pro Tennis Court (Hard)', sport: 'Tennis', pricePerHour: 800, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE' },
      { id: 'c-104', name: '5v5 Artificial Turf Ground', sport: 'Football', pricePerHour: 1400, openingTime: '05:00', closingTime: '00:00', status: 'ACTIVE' },
      { id: 'c-105', name: 'FIBA Wooden Basketball Court', sport: 'Basketball', pricePerHour: 900, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r1', userName: 'Rahul Sharma', rating: 5, comment: 'Top notch badminton mats and great lighting! Friendly staff.', date: '2026-08-15' },
      { id: 'r2', userName: 'Priya Verma', rating: 4.5, comment: 'Clean changing rooms and great coffee at the cafe. Loved playing here.', date: '2026-08-10' },
    ],
    contactPhone: '+91 98765 43210',
    contactEmail: 'contact@apexsports.com',
  },
  {
    id: 'v-2',
    name: 'Smash & Spike Badminton Hub',
    tagline: 'Dedicated 8-court badminton sanctuary',
    description: 'High-ceiling air-conditioned indoor facility equipped with 8 Yonex professional mats, LED non-glare lighting, and certified coaches available on request.',
    city: 'Bengaluru',
    area: 'Indiranagar',
    fullAddress: '100 Feet Rd, Indiranagar, Bengaluru, Karnataka 560038',
    latitude: 12.9784,
    longitude: 77.6408,
    sports: ['Badminton', 'Table Tennis'],
    venueType: 'INDOOR',
    startingPrice: 350,
    rating: 4.9,
    reviewCount: 215,
    images: [
      'https://images.unsplash.com/photo-1521537634581-0dced2efa2a3?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1626225967045-9440882269ab?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: true,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a2', name: 'Changing Rooms', icon: '👕' },
      { id: 'a4', name: 'Cafeteria', icon: '☕' },
      { id: 'a7', name: 'Equipment Rental', icon: '🏸' },
      { id: 'a8', name: 'Air Conditioned', icon: '❄️' },
    ],
    courts: [
      { id: 'c-201', name: 'Court A1 (Yonex Mat)', sport: 'Badminton', pricePerHour: 350, openingTime: '05:00', closingTime: '23:00', status: 'ACTIVE' },
      { id: 'c-202', name: 'Court A2 (Yonex Mat)', sport: 'Badminton', pricePerHour: 350, openingTime: '05:00', closingTime: '23:00', status: 'ACTIVE' },
      { id: 'c-203', name: 'Stiga TT Table 1', sport: 'Table Tennis', pricePerHour: 200, openingTime: '08:00', closingTime: '22:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r3', userName: 'Ananya Roy', rating: 5, comment: 'Best badminton mats in Indiranagar. Non-glare lights are fantastic.', date: '2026-08-20' }
    ],
    contactPhone: '+91 91234 56789',
    contactEmail: 'smashhub@gmail.com',
  },
  {
    id: 'v-3',
    name: 'Turf Park Arena & Cricket Nets',
    tagline: 'All-weather FIFA approved turf & box cricket',
    description: 'Experience 7v7 and 5v5 football turf alongside enclosed high-tension box cricket nets. Perfect for night games under high-power LED floodlights.',
    city: 'Mumbai',
    area: 'Andheri West',
    fullAddress: 'Link Road, Opposite Infinity Mall, Andheri West, Mumbai 400053',
    latitude: 19.1363,
    longitude: 72.8277,
    sports: ['Football', 'Cricket'],
    venueType: 'OUTDOOR',
    startingPrice: 1200,
    rating: 4.7,
    reviewCount: 98,
    images: [
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: true,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a5', name: 'Floodlights', icon: '💡' },
      { id: 'a6', name: 'First Aid', icon: '🩹' },
      { id: 'a9', name: 'CCTV Security', icon: '📹' },
    ],
    courts: [
      { id: 'c-301', name: 'Main FIFA Turf (7v7)', sport: 'Football', pricePerHour: 1800, openingTime: '06:00', closingTime: '02:00', status: 'ACTIVE' },
      { id: 'c-302', name: 'Mini Turf (5v5)', sport: 'Football', pricePerHour: 1200, openingTime: '06:00', closingTime: '02:00', status: 'ACTIVE' },
      { id: 'c-303', name: 'Box Cricket Arena 1', sport: 'Cricket', pricePerHour: 1500, openingTime: '06:00', closingTime: '02:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r4', userName: 'Karan Patel', rating: 4.7, comment: 'Superb grass turf quality! Late night slots available till 2 AM.', date: '2026-08-18' }
    ],
    contactPhone: '+91 99887 76655',
  },
  {
    id: 'v-4',
    name: 'Grand Slam Tennis Club',
    tagline: 'Synthetic hard & clay tennis courts with floodlights',
    description: 'Professional ITF standard tennis courts with night lighting, ball machine rental, and trained ball-boys. Ideal for beginner to professional play.',
    city: 'Delhi NCR',
    area: 'Vasant Kunj, New Delhi',
    fullAddress: 'Nelson Mandela Marg, Vasant Kunj, New Delhi 110070',
    latitude: 28.5273,
    longitude: 77.1517,
    sports: ['Tennis'],
    venueType: 'OUTDOOR',
    startingPrice: 700,
    rating: 4.6,
    reviewCount: 84,
    images: [
      'https://images.unsplash.com/photo-1554068865-24cecd4e34b8?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: false,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a2', name: 'Changing Rooms', icon: '👕' },
      { id: 'a3', name: 'Showers', icon: '🚿' },
      { id: 'a5', name: 'Floodlights', icon: '💡' },
    ],
    courts: [
      { id: 'c-401', name: 'Clay Court 1', sport: 'Tennis', pricePerHour: 700, openingTime: '06:00', closingTime: '21:00', status: 'ACTIVE' },
      { id: 'c-402', name: 'Hard Synthetic Court 2', sport: 'Tennis', pricePerHour: 850, openingTime: '06:00', closingTime: '21:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r5', userName: 'Vikram Singh', rating: 4.5, comment: 'Clay courts are well maintained daily. Great atmosphere.', date: '2026-08-05' }
    ],
    contactPhone: '+91 98111 22334',
  },
  {
    id: 'v-5',
    name: 'Hoops & Nets Basketball Arena',
    tagline: 'Indoor cushioned wooden floor basketball arena',
    description: 'Full FIBA regulation wooden floor court with break-away rims, scoreboard, and seating bleachers for up to 100 spectators.',
    city: 'Pune',
    area: 'Koregaon Park',
    fullAddress: 'North Main Road, Koregaon Park, Pune, Maharashtra 411001',
    latitude: 18.5362,
    longitude: 73.8940,
    sports: ['Basketball'],
    venueType: 'INDOOR',
    startingPrice: 850,
    rating: 4.8,
    reviewCount: 67,
    images: [
      'https://images.unsplash.com/photo-1546519638-68e109498ffc?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: false,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a2', name: 'Changing Rooms', icon: '👕' },
      { id: 'a4', name: 'Cafeteria', icon: '☕' },
      { id: 'a8', name: 'Air Conditioned', icon: '❄️' },
    ],
    courts: [
      { id: 'c-501', name: 'FIBA Main Wooden Court', sport: 'Basketball', pricePerHour: 850, openingTime: '07:00', closingTime: '23:00', status: 'ACTIVE' },
      { id: 'c-502', name: 'Half Court A', sport: 'Basketball', pricePerHour: 450, openingTime: '07:00', closingTime: '23:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r6', userName: 'Siddharth Joshi', rating: 5, comment: 'Cushioned wooden floor saves knees during pick up games!', date: '2026-08-14' }
    ],
    contactPhone: '+91 97654 32109',
  },
  {
    id: 'v-6',
    name: 'Decathlon Sports Village',
    tagline: 'Multi-sport experience center & public turfs',
    description: 'Huge multi-sport park featuring badminton, football, basketball, and table tennis. Fun, family-friendly environment with sports gear rental.',
    city: 'Bengaluru',
    area: 'Sarjapur Road',
    fullAddress: 'Sarjapur Main Rd, Carmelaram, Bengaluru 560035',
    latitude: 12.9116,
    longitude: 77.6946,
    sports: ['Badminton', 'Football', 'Basketball', 'Table Tennis'],
    venueType: 'BOTH',
    startingPrice: 300,
    rating: 4.7,
    reviewCount: 310,
    images: [
      'https://images.unsplash.com/photo-1526676037777-05a232554f77?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: true,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a2', name: 'Changing Rooms', icon: '👕' },
      { id: 'a4', name: 'Cafeteria', icon: '☕' },
      { id: 'a7', name: 'Equipment Rental', icon: '🏸' },
    ],
    courts: [
      { id: 'c-601', name: 'Badminton Court 1', sport: 'Badminton', pricePerHour: 300, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE' },
      { id: 'c-602', name: 'Outdoor Basketball Court', sport: 'Basketball', pricePerHour: 500, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE' },
      { id: 'c-603', name: 'Mini Turf Football', sport: 'Football', pricePerHour: 1000, openingTime: '06:00', closingTime: '22:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r7', userName: 'Deepak Nair', rating: 4.6, comment: 'Great multi-sport complex. Easy booking process.', date: '2026-08-22' }
    ],
    contactPhone: '+91 80123 45678',
  },
  {
    id: 'v-7',
    name: 'Chennai Super Turf & Nets',
    tagline: 'Coastal turf for box cricket & 5v5 soccer',
    description: 'High elasticity synthetic grass turf engineered for low joint impact. Surrounded by high safety nets and energy-efficient LED lights.',
    city: 'Chennai',
    area: 'ECR, Neelankarai',
    fullAddress: 'East Coast Road, Neelankarai, Chennai, Tamil Nadu 600115',
    latitude: 12.9493,
    longitude: 80.2588,
    sports: ['Football', 'Cricket'],
    venueType: 'OUTDOOR',
    startingPrice: 1100,
    rating: 4.6,
    reviewCount: 76,
    images: [
      'https://images.unsplash.com/photo-1531415074968-036ba1b575da?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: false,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a5', name: 'Floodlights', icon: '💡' },
      { id: 'a6', name: 'First Aid', icon: '🩹' },
    ],
    courts: [
      { id: 'c-701', name: '5v5 Soccer Turf', sport: 'Football', pricePerHour: 1100, openingTime: '06:00', closingTime: '01:00', status: 'ACTIVE' },
      { id: 'c-702', name: 'Box Cricket Arena', sport: 'Cricket', pricePerHour: 1200, openingTime: '06:00', closingTime: '01:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r8', userName: 'Karthik Subramanian', rating: 4.6, comment: 'Sea breeze and great turf. Loved playing evening football here.', date: '2026-08-11' }
    ],
  },
  {
    id: 'v-8',
    name: 'Spin & Smash Table Tennis Academy',
    tagline: 'Professional TT tables & robot training ground',
    description: 'Air-conditioned room featuring 6 ITTF approved Butterfly and Stiga competition tables, wooden flooring, and automatic ball throwing machines.',
    city: 'Hyderabad',
    area: 'Hitec City',
    fullAddress: 'Mindspace Road, Hitec City, Hyderabad, Telangana 500081',
    latitude: 17.4435,
    longitude: 78.3772,
    sports: ['Table Tennis'],
    venueType: 'INDOOR',
    startingPrice: 250,
    rating: 4.9,
    reviewCount: 52,
    images: [
      'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=1200&q=80'
    ],
    isFeatured: false,
    amenities: [
      { id: 'a1', name: 'Parking', icon: '🅿️' },
      { id: 'a4', name: 'Cafeteria', icon: '☕' },
      { id: 'a7', name: 'Equipment Rental', icon: '🏸' },
      { id: 'a8', name: 'Air Conditioned', icon: '❄️' },
    ],
    courts: [
      { id: 'c-801', name: 'Butterfly Centrefold 25 Table', sport: 'Table Tennis', pricePerHour: 250, openingTime: '07:00', closingTime: '22:00', status: 'ACTIVE' },
      { id: 'c-802', name: 'Stiga Expert Roller Table', sport: 'Table Tennis', pricePerHour: 250, openingTime: '07:00', closingTime: '22:00', status: 'ACTIVE' },
    ],
    reviews: [
      { id: 'r9', userName: 'Venkat Rao', rating: 5, comment: 'Robot ball thrower is super helpful for practice. Excellent AC.', date: '2026-08-19' }
    ],
  }
];
