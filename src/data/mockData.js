// Mock data for the Loyalty Rewards App
// This file contains mock data for development and testing

// Mock Business Information
export const mockBusiness = {
  id: "business_1",
  name: "Coffee & Co.",
  description: "Artisan coffee shop serving specialty coffee and pastries",
  contactEmail: "contact@coffeeandco.example",
  contactPhone: "(555) 123-4567",
  address: "123 Main Street, Downtown",
  logo_url: "", // No actual image in the prototype
  primaryColor: "#4F46E5", // Indigo
  secondaryColor: "#10B981", // Emerald
  settings: {
    enableSMS: true,
    enableEmail: true,
    welcomeMessage: "Welcome to Coffee & Co. Rewards! Earn points with every purchase and unlock exciting rewards.",
    requireStaffPINForRedemption: true,
    staffPIN: "1234"
  },
  createdAt: "2023-01-01T08:00:00Z",
  updatedAt: "2023-06-01T10:30:00Z"
};

// Mock Customers
export const mockCustomers = [
  {
    id: "customer_001",
    status: "ACTIVE",
    firstName: "John",
    lastName: "Smith",
    phone: "(555) 111-2222",
    email: "john.smith@example.com",
    birthdate: "1985-06-15",
    availablePoints: 450,
    lifetimePoints: 1200,
    visits: 24,
    lastVisitDate: "2023-06-05T09:15:00Z",
    registrationDate: "2022-03-10T14:30:00Z",
    createdAt: "2022-03-10T14:30:00Z",
    updatedAt: "2023-06-05T09:15:00Z"
  },
  {
    id: "customer_002",
    status: "ACTIVE",
    firstName: "Emma",
    lastName: "Johnson",
    phone: "(555) 222-3333",
    email: "emma.j@example.com",
    birthdate: "1990-11-22",
    availablePoints: 180,
    lifetimePoints: 560,
    visits: 12,
    lastVisitDate: "2023-06-04T16:45:00Z",
    registrationDate: "2022-09-15T10:20:00Z",
    createdAt: "2022-09-15T10:20:00Z",
    updatedAt: "2023-06-04T16:45:00Z"
  },
  {
    id: "customer_003",
    status: "ACTIVE",
    firstName: "Michael",
    lastName: "Davis",
    phone: "(555) 333-4444",
    email: "michael.davis@example.com",
    birthdate: "1978-03-04",
    availablePoints: 650,
    lifetimePoints: 1800,
    visits: 36,
    lastVisitDate: "2023-06-06T08:30:00Z",
    registrationDate: "2022-01-05T11:45:00Z",
    createdAt: "2022-01-05T11:45:00Z",
    updatedAt: "2023-06-06T08:30:00Z"
  },
  {
    id: "customer_004",
    status: "ACTIVE",
    firstName: "Sarah",
    lastName: "Wilson",
    phone: "(555) 444-5555",
    email: "sarah.w@example.com",
    birthdate: "1995-08-30",
    availablePoints: 80,
    lifetimePoints: 380,
    visits: 8,
    lastVisitDate: "2023-05-28T12:15:00Z",
    registrationDate: "2023-01-20T09:30:00Z",
    createdAt: "2023-01-20T09:30:00Z",
    updatedAt: "2023-05-28T12:15:00Z"
  },
  {
    id: "customer_005",
    status: "ACTIVE",
    firstName: "David",
    lastName: "Brown",
    phone: "(555) 555-6666",
    email: "david.brown@example.com",
    birthdate: "1982-12-10",
    availablePoints: 320,
    lifetimePoints: 920,
    visits: 18,
    lastVisitDate: "2023-06-02T17:20:00Z",
    registrationDate: "2022-06-12T14:00:00Z",
    createdAt: "2022-06-12T14:00:00Z",
    updatedAt: "2023-06-02T17:20:00Z"
  },
  {
    id: "customer_006",
    status: "INACTIVE",
    firstName: "Jennifer",
    lastName: "Miller",
    phone: "(555) 666-7777",
    email: "jennifer.m@example.com",
    birthdate: "1988-05-16",
    availablePoints: 90,
    lifetimePoints: 490,
    visits: 10,
    lastVisitDate: "2023-02-15T10:45:00Z",
    registrationDate: "2022-05-20T13:30:00Z",
    createdAt: "2022-05-20T13:30:00Z",
    updatedAt: "2023-02-15T10:45:00Z"
  },
  {
    id: "customer_007",
    status: "ACTIVE",
    firstName: "Robert",
    lastName: "Taylor",
    phone: "(555) 777-8888",
    email: "robert.t@example.com",
    birthdate: "1975-09-08",
    availablePoints: 520,
    lifetimePoints: 1480,
    visits: 30,
    lastVisitDate: "2023-06-05T16:10:00Z",
    registrationDate: "2022-02-08T09:15:00Z",
    createdAt: "2022-02-08T09:15:00Z",
    updatedAt: "2023-06-05T16:10:00Z"
  },
  {
    id: "customer_008",
    status: "ACTIVE",
    firstName: "Lisa",
    lastName: "Anderson",
    phone: "(555) 888-9999",
    email: "lisa.anderson@example.com",
    birthdate: "1992-07-19",
    availablePoints: 210,
    lifetimePoints: 610,
    visits: 13,
    lastVisitDate: "2023-06-03T14:25:00Z",
    registrationDate: "2022-10-30T11:50:00Z",
    createdAt: "2022-10-30T11:50:00Z",
    updatedAt: "2023-06-03T14:25:00Z"
  },
  {
    id: "customer_009",
    status: "ACTIVE",
    firstName: "Thomas",
    lastName: "Moore",
    phone: "(555) 999-0000",
    email: "thomas.moore@example.com",
    birthdate: "1980-01-25",
    availablePoints: 370,
    lifetimePoints: 870,
    visits: 17,
    lastVisitDate: "2023-05-30T09:40:00Z",
    registrationDate: "2022-07-22T15:30:00Z",
    createdAt: "2022-07-22T15:30:00Z",
    updatedAt: "2023-05-30T09:40:00Z"
  },
  {
    id: "customer_010",
    status: "ACTIVE",
    firstName: "Amanda",
    lastName: "Clark",
    phone: "(555) 000-1111",
    email: "amanda.c@example.com",
    birthdate: "1993-04-12",
    availablePoints: 140,
    lifetimePoints: 440,
    visits: 9,
    lastVisitDate: "2023-06-01T12:50:00Z",
    registrationDate: "2022-11-15T10:10:00Z",
    createdAt: "2022-11-15T10:10:00Z",
    updatedAt: "2023-06-01T12:50:00Z"
  }
];

// Mock Rewards
export const mockRewards = [
  {
    id: "reward_001",
    businessId: "business_1",
    name: "Free Coffee",
    description: "Redeem for a free coffee of your choice",
    pointCost: 100,
    type: "ITEM",
    status: "ACTIVE",
    expiryDate: null,
    currentRedemptions: 63,
    maxRedemptions: null,
    image_url: "", // No actual image in the prototype
    createdAt: "2022-01-01T09:00:00Z",
    updatedAt: "2023-05-15T11:30:00Z"
  },
  {
    id: "reward_002",
    businessId: "business_1",
    name: "50% Off Pastry",
    description: "Get any pastry for half price",
    pointCost: 75,
    type: "DISCOUNT",
    status: "ACTIVE",
    expiryDate: null,
    currentRedemptions: 47,
    maxRedemptions: null,
    image_url: "", // No actual image in the prototype
    createdAt: "2022-01-01T09:00:00Z",
    updatedAt: "2023-05-20T14:15:00Z"
  },
  {
    id: "reward_003",
    businessId: "business_1",
    name: "Free Bakery Item",
    description: "Choose any bakery item for free",
    pointCost: 150,
    type: "ITEM",
    status: "ACTIVE",
    expiryDate: null,
    currentRedemptions: 29,
    maxRedemptions: null,
    image_url: "", // No actual image in the prototype
    createdAt: "2022-01-01T09:00:00Z",
    updatedAt: "2023-05-18T10:45:00Z"
  },
  {
    id: "reward_004",
    businessId: "business_1",
    name: "Summer Special: Iced Drink",
    description: "Redeem for a free iced drink of your choice",
    pointCost: 125,
    type: "ITEM",
    status: "ACTIVE",
    expiryDate: "2023-09-30T23:59:59Z",
    currentRedemptions: 38,
    maxRedemptions: 200,
    image_url: "", // No actual image in the prototype
    createdAt: "2023-06-01T08:00:00Z",
    updatedAt: "2023-06-05T16:30:00Z"
  },
  {
    id: "reward_005",
    businessId: "business_1",
    name: "Buy One Get One Free",
    description: "Buy any drink and get one free",
    pointCost: 200,
    type: "BOGO",
    status: "ACTIVE",
    expiryDate: null,
    currentRedemptions: 15,
    maxRedemptions: null,
    image_url: "", // No actual image in the prototype
    createdAt: "2022-01-01T09:00:00Z",
    updatedAt: "2023-05-25T09:20:00Z"
  },
  {
    id: "reward_006",
    businessId: "business_1",
    name: "Exclusive Coffee Tasting Event",
    description: "Access to our exclusive monthly coffee tasting event",
    pointCost: 300,
    type: "EVENT",
    status: "ACTIVE",
    expiryDate: null,
    currentRedemptions: 8,
    maxRedemptions: 20,
    image_url: "", // No actual image in the prototype
    createdAt: "2022-03-15T14:00:00Z",
    updatedAt: "2023-05-30T11:10:00Z"
  }
];

// Mock Customer Segments
export const mockSegments = [
  {
    id: "segment_001",
    businessId: "business_1",
    name: "All Customers",
    description: "All active customers",
    rules: { status: "ACTIVE" },
    customerCount: 9,
    createdAt: "2022-01-01T09:00:00Z",
    updatedAt: "2023-06-06T10:00:00Z"
  },
  {
    id: "segment_002",
    businessId: "business_1",
    name: "High Value",
    description: "Customers with 400+ points",
    rules: { minPoints: 400 },
    customerCount: 3,
    createdAt: "2022-01-15T14:30:00Z",
    updatedAt: "2023-06-06T10:00:00Z"
  },
  {
    id: "segment_003",
    businessId: "business_1",
    name: "New Customers",
    description: "Customers registered in the last 90 days",
    rules: { registeredAfter: "90days" },
    customerCount: 2,
    createdAt: "2022-02-10T11:15:00Z",
    updatedAt: "2023-06-06T10:00:00Z"
  },
  {
    id: "segment_004",
    businessId: "business_1",
    name: "At Risk",
    description: "Customers who haven't visited in 30+ days",
    rules: { lastVisitBefore: "30days" },
    customerCount: 1,
    createdAt: "2022-03-05T09:45:00Z",
    updatedAt: "2023-06-06T10:00:00Z"
  },
  {
    id: "segment_005",
    businessId: "business_1",
    name: "Birthday This Month",
    description: "Customers with birthdays this month",
    rules: { birthdayInCurrentMonth: true },
    customerCount: 1,
    createdAt: "2022-04-20T13:20:00Z",
    updatedAt: "2023-06-06T10:00:00Z"
  }
];

// Mock Campaigns
export const mockCampaigns = [
  {
    id: "campaign_001",
    businessId: "business_1",
    name: "Welcome Campaign",
    description: "Sent to new customers after registration",
    type: "SMS",
    segmentId: "segment_003",
    messageTemplate: "Welcome to Coffee & Co, {{firstName}}! Show this message for 10% off your next purchase.",
    status: "ACTIVE",
    scheduledDate: null,
    recipientCount: 2,
    sentCount: 2,
    deliveredCount: 2,
    openedCount: 2,
    clickedCount: 1,
    rewardId: null,
    createdAt: "2023-01-10T09:30:00Z",
    updatedAt: "2023-06-05T14:15:00Z"
  },
  {
    id: "campaign_002",
    businessId: "business_1",
    name: "June Special - Iced Coffee",
    description: "Promotion for our summer specials",
    type: "SMS",
    segmentId: "segment_001",
    messageTemplate: "Hi {{firstName}}! Beat the heat with our new iced coffee specials. Show this message to get double points this weekend!",
    status: "SCHEDULED",
    scheduledDate: "2023-06-15T08:00:00Z",
    recipientCount: 9,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    rewardId: "reward_004",
    createdAt: "2023-06-01T11:45:00Z",
    updatedAt: "2023-06-01T11:45:00Z"
  },
  {
    id: "campaign_003",
    businessId: "business_1",
    name: "High Value Thank You",
    description: "Appreciation message for our best customers",
    type: "SMS",
    segmentId: "segment_002",
    messageTemplate: "{{firstName}}, thank you for being one of our most valued customers! Enjoy a free coffee on us - just show this message.",
    status: "COMPLETED",
    scheduledDate: "2023-05-20T09:00:00Z",
    recipientCount: 3,
    sentCount: 3,
    deliveredCount: 3,
    openedCount: 2,
    clickedCount: 2,
    rewardId: "reward_001",
    createdAt: "2023-05-15T10:30:00Z",
    updatedAt: "2023-05-20T09:15:00Z"
  },
  {
    id: "campaign_004",
    businessId: "business_1",
    name: "We Miss You",
    description: "Re-engagement campaign for at-risk customers",
    type: "SMS",
    segmentId: "segment_004",
    messageTemplate: "We miss you, {{firstName}}! It's been a while since your last visit. Come back and enjoy 50 bonus points with any purchase!",
    status: "DRAFT",
    scheduledDate: null,
    recipientCount: 1,
    sentCount: 0,
    deliveredCount: 0,
    openedCount: 0,
    clickedCount: 0,
    rewardId: null,
    createdAt: "2023-06-03T15:20:00Z",
    updatedAt: "2023-06-03T15:20:00Z"
  },
  {
    id: "campaign_005",
    businessId: "business_1",
    name: "Birthday Reward",
    description: "Special offer for customers' birthdays",
    type: "SMS",
    segmentId: "segment_005",
    messageTemplate: "Happy Birthday, {{firstName}}! 🎂 Celebrate with a free item of your choice. Valid during your birthday month.",
    status: "ACTIVE",
    scheduledDate: "2023-06-01T08:00:00Z",
    recipientCount: 1,
    sentCount: 1,
    deliveredCount: 1,
    openedCount: 1,
    clickedCount: 1,
    rewardId: "reward_003",
    createdAt: "2023-05-25T14:00:00Z",
    updatedAt: "2023-06-01T08:05:00Z"
  }
];