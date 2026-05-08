import prisma from "../db.server";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, ngrok-skip-browser-warning",
};


// Get offline access token 
async function getAccessToken(shop) {
  const session = await prisma.session.findFirst({
    where: { shop },
  });

  if (!session || !session.accessToken) {
    throw new Error(`No session found for shop: ${shop}`);
  }

  return session.accessToken;
}

//  Get existing reviews from metafield 
async function getExistingReviews(shop, accessToken, productId) {
  const response = await fetch(
    `https://${shop}/admin/api/2026-07/products/${productId}/metafields.json?namespace=reviews&key=list`,
    {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    }
  );

  const data = await response.json();
  const metafield = data.metafields?.[0];

  if (!metafield) return { reviews: [], metafieldId: null };

  return {
    reviews: JSON.parse(metafield.value),
    metafieldId: metafield.id,
  };
}

//  Save reviews to metafield 
async function saveReviews(shop, accessToken, productId, reviews, metafieldId) {
  const url = metafieldId
    ? `https://${shop}/admin/api/2026-07/metafields/${metafieldId}.json`
    : `https://${shop}/admin/api/2026-07/products/${productId}/metafields.json`;

  const method = metafieldId ? "PUT" : "POST";

  const body = metafieldId
    ? { metafield: { id: metafieldId, value: JSON.stringify(reviews), type: "json" } }
    : { metafield: { namespace: "reviews", key: "list", type: "json", value: JSON.stringify(reviews) } };

  const response = await fetch(url, {
    method,
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(`Metafield save failed: ${JSON.stringify(err)}`);
  }

  return await response.json();
}


export async function loader({ request }) {
  // handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  const url = new URL(request.url);
  const shop = url.searchParams.get("shop");
  const productId = url.searchParams.get("productId");

  if (!productId || !shop) {
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const accessToken = await getAccessToken(shop);
    const { reviews } = await getExistingReviews(shop, accessToken, productId);

    return new Response(JSON.stringify({ reviews }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("GET reviews error:", error);
    return new Response(JSON.stringify({ reviews: [] }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}


export async function action({ request }) {
  // handle OPTIONS preflight
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const body = await request.json();
    console.log("Review received:", body);

    const { productId, shop, text, rating, date, author } = body;

    if (!productId || !author || !rating || !text || !shop) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = await getAccessToken(shop);
    const { reviews, metafieldId } = await getExistingReviews(shop, accessToken, productId);

    const newReview = { author, rating, text, date, productId };
    const updatedReviews = [newReview, ...reviews];

    await saveReviews(shop, accessToken, productId, updatedReviews, metafieldId);

    console.log("Review saved to metafield successfully");

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("POST review error:", error);
    return new Response(JSON.stringify({ error: "Something went wrong" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
}