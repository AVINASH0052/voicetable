import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const sampleOrders = [
  {
    orderId: "ORD-1001",
    customerName: "Rahul Sharma",
    customerPhone: "+919876543210",
    items: JSON.stringify([
      { name: "Butter Chicken", quantity: 2, price: 350 },
      { name: "Garlic Naan", quantity: 4, price: 60 },
      { name: "Jeera Rice", quantity: 1, price: 180 },
    ]),
    deliveryAddress: "42, Sector 15, Gurugram, Haryana",
    paymentMethod: "COD",
    estimatedDelivery: "35 mins",
    totalAmount: 1120,
    status: "confirmed",
    specialInstructions: "Extra spicy butter chicken",
  },
  {
    orderId: "ORD-1002",
    customerName: "Priya Patel",
    customerPhone: "+919876543211",
    items: JSON.stringify([
      { name: "Paneer Tikka", quantity: 1, price: 280 },
      { name: "Dal Makhani", quantity: 1, price: 220 },
      { name: "Butter Naan", quantity: 3, price: 50 },
    ]),
    deliveryAddress: "B-12, Koramangala 5th Block, Bengaluru",
    paymentMethod: "prepaid",
    estimatedDelivery: "40 mins",
    totalAmount: 650,
    status: "confirmed",
  },
  {
    orderId: "ORD-1003",
    customerName: "Amit Kumar",
    customerPhone: "+919876543212",
    items: JSON.stringify([
      { name: "Chicken Biryani", quantity: 1, price: 320 },
      { name: "Raita", quantity: 1, price: 60 },
    ]),
    deliveryAddress: "23, MG Road, Pune",
    paymentMethod: "COD",
    estimatedDelivery: "30 mins",
    totalAmount: 380,
    status: "cancelled",
    specialInstructions: null,
  },
  {
    orderId: "ORD-1004",
    customerName: "Sneha Reddy",
    customerPhone: "+919876543213",
    items: JSON.stringify([
      { name: "Masala Dosa", quantity: 2, price: 150 },
      { name: "Filter Coffee", quantity: 2, price: 80 },
      { name: "Vada", quantity: 4, price: 40 },
    ]),
    deliveryAddress: "14, Jubilee Hills, Hyderabad",
    paymentMethod: "prepaid",
    estimatedDelivery: "25 mins",
    totalAmount: 620,
    status: "confirmed",
  },
  {
    orderId: "ORD-1005",
    customerName: "Vikram Singh",
    customerPhone: "+919876543214",
    items: JSON.stringify([
      { name: "Tandoori Chicken", quantity: 1, price: 450 },
      { name: "Roomali Roti", quantity: 4, price: 40 },
      { name: "Green Salad", quantity: 1, price: 120 },
    ]),
    deliveryAddress: "7, Connaught Place, New Delhi",
    paymentMethod: "COD",
    estimatedDelivery: "45 mins",
    totalAmount: 730,
    status: "pending",
  },
  {
    orderId: "ORD-1006",
    customerName: "Meera Joshi",
    customerPhone: "+919876543215",
    items: JSON.stringify([
      { name: "Chole Bhature", quantity: 2, price: 180 },
      { name: "Lassi", quantity: 2, price: 90 },
    ]),
    deliveryAddress: "56, Andheri West, Mumbai",
    paymentMethod: "COD",
    estimatedDelivery: "35 mins",
    totalAmount: 540,
    status: "pending",
  },
  {
    orderId: "ORD-1007",
    customerName: "Arjun Nair",
    customerPhone: "+919876543216",
    items: JSON.stringify([
      { name: "Fish Curry", quantity: 1, price: 380 },
      { name: "Appam", quantity: 4, price: 45 },
      { name: "Coconut Chutney", quantity: 1, price: 50 },
    ]),
    deliveryAddress: "18, MG Road, Kochi",
    paymentMethod: "prepaid",
    estimatedDelivery: "30 mins",
    totalAmount: 610,
    status: "confirmed",
  },
  {
    orderId: "ORD-1008",
    customerName: "Kavita Gupta",
    customerPhone: "+919876543217",
    items: JSON.stringify([
      { name: "Rajma Chawal", quantity: 2, price: 200 },
      { name: "Papad", quantity: 2, price: 30 },
    ]),
    deliveryAddress: "34, Vaishali Nagar, Jaipur",
    paymentMethod: "COD",
    estimatedDelivery: "40 mins",
    totalAmount: 460,
    status: "pending",
  },
  {
    orderId: "ORD-1009",
    customerName: "Rohan Deshmukh",
    customerPhone: "+919876543218",
    items: JSON.stringify([
      { name: "Mutton Rogan Josh", quantity: 1, price: 520 },
      { name: "Sheermal", quantity: 2, price: 70 },
      { name: "Phirni", quantity: 2, price: 120 },
    ]),
    deliveryAddress: "9, Park Street, Kolkata",
    paymentMethod: "COD",
    estimatedDelivery: "50 mins",
    totalAmount: 900,
    status: "modified",
    specialInstructions: "Less oil, extra raita on the side",
  },
  {
    orderId: "ORD-1010",
    customerName: "Deepa Iyer",
    customerPhone: "+919876543219",
    items: JSON.stringify([
      { name: "Veg Thali", quantity: 1, price: 350 },
      { name: "Gulab Jamun", quantity: 2, price: 60 },
    ]),
    deliveryAddress: "22, T Nagar, Chennai",
    paymentMethod: "prepaid",
    estimatedDelivery: "30 mins",
    totalAmount: 470,
    status: "confirmed",
  },
  {
    orderId: "ORD-1011",
    customerName: "Sanjay Mehta",
    customerPhone: "+919876543220",
    items: JSON.stringify([
      { name: "Pav Bhaji", quantity: 3, price: 160 },
      { name: "Masala Chai", quantity: 3, price: 50 },
    ]),
    deliveryAddress: "8, Bandra West, Mumbai",
    paymentMethod: "COD",
    estimatedDelivery: "25 mins",
    totalAmount: 630,
    status: "pending",
  },
  {
    orderId: "ORD-1012",
    customerName: "Ananya Bose",
    customerPhone: "+919876543221",
    items: JSON.stringify([
      { name: "Chicken Momos", quantity: 3, price: 180 },
      { name: "Thukpa", quantity: 1, price: 220 },
    ]),
    deliveryAddress: "15, Salt Lake, Kolkata",
    paymentMethod: "prepaid",
    estimatedDelivery: "35 mins",
    totalAmount: 760,
    status: "confirmed",
  },
];

const sampleCalls = [
  {
    executionId: "exec-001",
    orderId: null as string | null,
    agentType: "confirmation",
    status: "completed",
    duration: 45,
    transcript: JSON.stringify([
      { role: "agent", text: "Hello Rahul! This is calling from Spice Route Kitchen. I'm reaching out about your order #ORD-1001." },
      { role: "customer", text: "Haan, boliye" },
      { role: "agent", text: "Your order has 2 Butter Chicken, 4 Garlic Naan, and 1 Jeera Rice. Is that correct?" },
      { role: "customer", text: "Yes, that's correct. Extra spicy butter chicken please." },
      { role: "agent", text: "Noted! Your order is confirmed for delivery at 42, Sector 15, Gurugram. COD amount is ₹1120. Thank you!" },
    ]),
    extractedData: JSON.stringify({
      confirmation_status: "confirmed",
      special_instructions: "Extra spicy butter chicken",
      customer_sentiment: "positive",
    }),
    summary: "Order confirmed. Customer requested extra spicy butter chicken.",
    cost: 2.5,
    customerPhone: "+919876543210",
    customerName: "Rahul Sharma",
  },
  {
    executionId: "exec-002",
    orderId: null as string | null,
    agentType: "confirmation",
    status: "completed",
    duration: 72,
    transcript: JSON.stringify([
      { role: "agent", text: "Hello Amit! Calling from Spice Route Kitchen about order #ORD-1003." },
      { role: "customer", text: "Actually, I want to cancel this order." },
      { role: "agent", text: "I understand. May I ask the reason for cancellation?" },
      { role: "customer", text: "I already ate outside, not hungry anymore." },
      { role: "agent", text: "No problem at all. Your order has been cancelled. Thank you!" },
    ]),
    extractedData: JSON.stringify({
      confirmation_status: "cancelled",
      cancellation_reason: "Already ate outside",
      customer_sentiment: "neutral",
    }),
    summary: "Order cancelled. Customer already ate outside.",
    cost: 3.1,
    customerPhone: "+919876543212",
    customerName: "Amit Kumar",
  },
  {
    executionId: "exec-003",
    orderId: null as string | null,
    agentType: "confirmation",
    status: "completed",
    duration: 88,
    transcript: JSON.stringify([
      { role: "agent", text: "Hello Rohan! This is Spice Route Kitchen calling about your order #ORD-1009." },
      { role: "customer", text: "Yes, I want to change something in my order." },
      { role: "agent", text: "Sure, what would you like to modify?" },
      { role: "customer", text: "Can you make the Rogan Josh less oily? And add extra raita." },
      { role: "agent", text: "Absolutely! I'll update that — less oil for Rogan Josh and extra raita on the side. Everything else stays the same?" },
      { role: "customer", text: "Yes, perfect." },
    ]),
    extractedData: JSON.stringify({
      confirmation_status: "modified",
      special_instructions: "Less oil, extra raita on the side",
      customer_sentiment: "positive",
    }),
    summary: "Order modified. Customer requested less oil and extra raita.",
    cost: 3.8,
    customerPhone: "+919876543218",
    customerName: "Rohan Deshmukh",
  },
  {
    executionId: "exec-004",
    orderId: null as string | null,
    agentType: "feedback",
    status: "completed",
    duration: 110,
    transcript: JSON.stringify([
      { role: "agent", text: "Hi Priya! This is Spice Route Kitchen. We hope you enjoyed your meal! Do you have 2 minutes for quick feedback?" },
      { role: "customer", text: "Sure, go ahead." },
      { role: "agent", text: "On a scale of 1 to 5, how would you rate the food quality?" },
      { role: "customer", text: "I'd say 4. The paneer tikka was amazing!" },
      { role: "agent", text: "Great! How was the delivery experience?" },
      { role: "customer", text: "Delivery was on time, food was hot. 5 out of 5!" },
      { role: "agent", text: "Would you recommend us to friends?" },
      { role: "customer", text: "Definitely! Already told my colleagues about you." },
    ]),
    extractedData: JSON.stringify({
      food_rating: 4,
      delivery_rating: 5,
      favorite_dish: "Paneer Tikka",
      would_recommend: true,
      overall_sentiment: "positive",
    }),
    summary: "Positive feedback. Food rating 4/5, delivery 5/5. Loved paneer tikka.",
    cost: 4.2,
    customerPhone: "+919876543211",
    customerName: "Priya Patel",
  },
  {
    executionId: "exec-005",
    orderId: null as string | null,
    agentType: "feedback",
    status: "completed",
    duration: 95,
    transcript: JSON.stringify([
      { role: "agent", text: "Hi Sneha! Calling from Spice Route Kitchen. Quick feedback on your recent order?" },
      { role: "customer", text: "Haan, sure." },
      { role: "agent", text: "How would you rate the food quality, 1 to 5?" },
      { role: "customer", text: "3. The dosa was okay but the coffee was cold." },
      { role: "agent", text: "I'm sorry about the coffee. How was the delivery?" },
      { role: "customer", text: "Delivery was fine, on time. 4 out of 5." },
      { role: "agent", text: "Any suggestions for improvement?" },
      { role: "customer", text: "Please pack hot beverages better. Use thermal packaging." },
    ]),
    extractedData: JSON.stringify({
      food_rating: 3,
      delivery_rating: 4,
      complaints: "Coffee was cold",
      would_recommend: true,
      overall_sentiment: "neutral",
      verbatim_feedback: "Please pack hot beverages better. Use thermal packaging.",
    }),
    summary: "Mixed feedback. Food 3/5 (cold coffee), delivery 4/5. Suggested better beverage packaging.",
    cost: 3.6,
    customerPhone: "+919876543213",
    customerName: "Sneha Reddy",
  },
  {
    executionId: "exec-006",
    orderId: null as string | null,
    agentType: "feedback",
    status: "completed",
    duration: 130,
    transcript: JSON.stringify([
      { role: "agent", text: "Hi Deepa! Spice Route Kitchen here. Got a minute for feedback?" },
      { role: "customer", text: "Yes, I actually wanted to share something." },
      { role: "agent", text: "Please go ahead! How would you rate the food?" },
      { role: "customer", text: "5 out of 5! The thali was incredible. Reminded me of home cooking." },
      { role: "agent", text: "That's wonderful to hear! And the delivery?" },
      { role: "customer", text: "5 stars. Came hot, well-packed, even the gulab jamun was perfect." },
    ]),
    extractedData: JSON.stringify({
      food_rating: 5,
      delivery_rating: 5,
      favorite_dish: "Veg Thali",
      would_recommend: true,
      overall_sentiment: "positive",
      verbatim_feedback: "The thali was incredible. Reminded me of home cooking.",
    }),
    summary: "Excellent feedback. 5/5 on both food and delivery. Loved the Veg Thali.",
    cost: 4.8,
    customerPhone: "+919876543219",
    customerName: "Deepa Iyer",
  },
];

const sampleFeedbacks = [
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Priya Patel",
    customerPhone: "+919876543211",
    foodRating: 4,
    deliveryRating: 5,
    favoriteDish: "Paneer Tikka",
    complaints: null,
    wouldRecommend: true,
    overallSentiment: "positive",
    verbatimFeedback: "Paneer Tikka was amazing! Already told my colleagues about you.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Sneha Reddy",
    customerPhone: "+919876543213",
    foodRating: 3,
    deliveryRating: 4,
    favoriteDish: null,
    complaints: "Coffee was cold",
    wouldRecommend: true,
    overallSentiment: "neutral",
    verbatimFeedback: "Please pack hot beverages better. Use thermal packaging.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Deepa Iyer",
    customerPhone: "+919876543219",
    foodRating: 5,
    deliveryRating: 5,
    favoriteDish: "Veg Thali",
    complaints: null,
    wouldRecommend: true,
    overallSentiment: "positive",
    verbatimFeedback: "The thali was incredible. Reminded me of home cooking.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Rahul Sharma",
    customerPhone: "+919876543210",
    foodRating: 4,
    deliveryRating: 4,
    favoriteDish: "Butter Chicken",
    complaints: null,
    wouldRecommend: true,
    overallSentiment: "positive",
    verbatimFeedback: "Butter chicken was perfect. Naan was fresh and soft.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Arjun Nair",
    customerPhone: "+919876543216",
    foodRating: 5,
    deliveryRating: 3,
    favoriteDish: "Fish Curry",
    complaints: "Delivery was slightly delayed",
    wouldRecommend: true,
    overallSentiment: "positive",
    verbatimFeedback: "Fish Curry was outstanding! But delivery took longer than expected.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Ananya Bose",
    customerPhone: "+919876543221",
    foodRating: 2,
    deliveryRating: 4,
    favoriteDish: null,
    complaints: "Momos were not steamed properly, felt soggy",
    wouldRecommend: false,
    overallSentiment: "negative",
    verbatimFeedback: "The momos were disappointing. They were soggy and the filling was bland.",
  },
  {
    callId: "",
    orderId: null as string | null,
    customerName: "Vikram Singh",
    customerPhone: "+919876543214",
    foodRating: 4,
    deliveryRating: 5,
    favoriteDish: "Tandoori Chicken",
    complaints: null,
    wouldRecommend: true,
    overallSentiment: "positive",
    verbatimFeedback: "Tandoori chicken was juicy and well-marinated. Great experience!",
  },
];

async function main() {
  console.log("🌱 Seeding database...");

  // Clear existing data
  await prisma.feedback.deleteMany();
  await prisma.call.deleteMany();
  await prisma.order.deleteMany();
  await prisma.settings.deleteMany();

  // Seed orders
  const orders = [];
  for (const order of sampleOrders) {
    const created = await prisma.order.create({ data: order });
    orders.push(created);
  }
  console.log(`  ✅ Created ${orders.length} orders`);

  // Seed calls (link to orders)
  const calls = [];
  const orderMap: Record<string, string> = {};
  for (const o of orders) {
    orderMap[o.orderId] = o.id;
  }

  sampleCalls[0].orderId = orderMap["ORD-1001"];
  sampleCalls[1].orderId = orderMap["ORD-1003"];
  sampleCalls[2].orderId = orderMap["ORD-1009"];
  sampleCalls[3].orderId = orderMap["ORD-1002"];
  sampleCalls[4].orderId = orderMap["ORD-1004"];
  sampleCalls[5].orderId = orderMap["ORD-1010"];

  for (const call of sampleCalls) {
    const created = await prisma.call.create({ data: call });
    calls.push(created);
  }
  console.log(`  ✅ Created ${calls.length} calls`);

  // Seed feedbacks (link to calls)
  sampleFeedbacks[0].callId = calls[3].id;
  sampleFeedbacks[0].orderId = orderMap["ORD-1002"];
  sampleFeedbacks[1].callId = calls[4].id;
  sampleFeedbacks[1].orderId = orderMap["ORD-1004"];
  sampleFeedbacks[2].callId = calls[5].id;
  sampleFeedbacks[2].orderId = orderMap["ORD-1010"];
  sampleFeedbacks[3].callId = calls[0].id;
  sampleFeedbacks[3].orderId = orderMap["ORD-1001"];
  sampleFeedbacks[4].callId = calls[3].id;
  sampleFeedbacks[4].orderId = orderMap["ORD-1007"];
  sampleFeedbacks[5].callId = calls[4].id;
  sampleFeedbacks[5].orderId = orderMap["ORD-1012"];
  sampleFeedbacks[6].callId = calls[0].id;
  sampleFeedbacks[6].orderId = orderMap["ORD-1005"];

  for (const fb of sampleFeedbacks) {
    await prisma.feedback.create({ data: fb });
  }
  console.log(`  ✅ Created ${sampleFeedbacks.length} feedbacks`);

  // Seed settings
  await prisma.settings.create({
    data: {
      id: "default",
      bolnaApiKey: process.env.BOLNA_API_KEY || "",
      confirmationAgentId: process.env.CONFIRMATION_AGENT_ID || "",
      feedbackAgentId: process.env.FEEDBACK_AGENT_ID || "",
      restaurantName: "Spice Route Kitchen",
      restaurantPhone: "+911234567890",
    },
  });
  console.log("  ✅ Created settings");

  console.log("🎉 Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
