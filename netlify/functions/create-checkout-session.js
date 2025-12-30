const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { priceId, customerName, customerEmail, customerPhone, plan, marketingOptIn } = JSON.parse(event.body);

    // Validate required fields
    if (!priceId || !customerEmail) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing required fields' }),
      };
    }

    // Get your site URL from environment variable or default
    const siteUrl = process.env.URL || 'https://yourdomain.com';
    
    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${siteUrl}/greengloclub.html?success=true&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/greengloclub.html?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        customer_name: customerName,
        customer_phone: customerPhone,
        plan: plan,
        marketing_opt_in: marketingOptIn,
        signup_date: new Date().toISOString(),
      },
      subscription_data: {
        metadata: {
          customer_name: customerName,
          customer_phone: customerPhone,
          plan: plan,
        },
      },
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: error.message,
        type: error.type,
      }),
    };
  }
};