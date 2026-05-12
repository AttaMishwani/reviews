import { authenticate } from "../shopify.server";
import prisma from "../db.server";



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


// create a new review object
const createReviewMetaobject = async (shop, accessToken, { productId, text, rating, date, author }) => {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `
            mutation CreateReview($metaobject: MetaobjectCreateInput!) {
              metaobjectCreate(metaobject: $metaobject) {
                metaobject {
                  id
                  handle
                }
                userErrors {
                  field
                  message
                }
              }
            }
          `,
          variables: {
            metaobject: {
              type: "$app:product_review",
              fields: [
                { key: "product_id", value: String(productId) },
                { key: "author", value: String(author) },
                { key: "review_text", value: String(text) },
                { key: "rating", value: String(rating) },
                { key: "date", value: String(date) },
              ],
            },
          },
        }),
      }
    );

    const data = await response.json();
    console.log("=== GraphQL Response ===", JSON.stringify(data, null, 2));

    const errors = data.data?.metaobjectCreate?.userErrors;
    if (errors?.length > 0) {
      throw new Error(`Metaobject error: ${JSON.stringify(errors)}`);
    }

    return data.data?.metaobjectCreate?.metaobject;

  } catch (error) {
    console.log("=== GraphQL Error ===", error);
  }
};

// get reviews for a single product  to pass to the reviews-list.js
const getReviewsByProduct = async (shop, accessToken, productId) => {
  try {
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          query: `{
            metaobjects(type: "$app:product_review", first: 250) {
              edges {
                node {
                  fields {
                    key
                    value
                  }
                }
              }
            }
          }`,
        }),
      }
    );
  
    const data = await response.json();
    console.log("=== Get Reviews Response ===", JSON.stringify(data, null, 2));

    const allEntries = data.data?.metaobjects?.edges || [];

    const reviews = allEntries
    .map(({ node }) => {
      const fields = {};
      node.fields.forEach((f) => {
        fields[f.key] = f.value;
      });
      return fields;
    })
    .filter((r) => r.product_id === String(productId))
    .map((r) => ({
      author: r.author,
      rating: parseInt(r.rating),
      text: r.review_text,
      date: r.date,
    }));

    return reviews
  } catch (error) {
    console.log("error in getReviewsByProduct" , error);
  }
};

export async function loader({ request }) {
  const { session } = await authenticate.public.appProxy(request);

  const url = new URL(request.url);
  const productId = url.searchParams.get("productId");
console.log("session scopes from loader:" , session.scope)
  const shop = session?.shop; 

  if (!productId || !shop) {
    return new Response(JSON.stringify({ reviews: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const accessToken = await getAccessToken(shop);

    const { reviews } = await getExistingReviews(shop, accessToken, productId);

    return new Response(JSON.stringify({ reviews }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify({ reviews: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}




export async function action({ request }) {
  const { session } = await authenticate.public.appProxy(request);
  const shop = session.shop; 
  const body = await request.json();

  // get all reviews  , i am fetching all reviews using POST request in action function because ngrok doesnt allow us to call GET Requests
  if (body.intent && body.intent === "GetReviews" && body.productId) {
    try {
      const accessToken = await getAccessToken(shop);
      const reviews = await getReviewsByProduct(shop, accessToken, body.productId);
  
      return new Response(JSON.stringify({ reviews }), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);
      return new Response(JSON.stringify({ reviews: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }

  const { productId, text, rating, date, author } = body;

  try {
    const accessToken = await getAccessToken(shop);

    const newReview = await createReviewMetaobject(shop , accessToken , {productId , text, rating , date , author});
    return new Response(JSON.stringify({ success: true , NewReview : newReview}), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }






 
}