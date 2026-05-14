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

// function to check  if defintion exists
const checkDefinitionExists = async (admin) => {
  try {
    const response = await admin.graphql(
      `#graphql
      query CheckDefinition($type: String!) {
        metaobjectDefinitionByType(type: $type) {
          id
          type
          name
        }
      }`,
      {
        variables: {
          type: "$app:product_review",
        },
      }
    );

    const data = await response.json();

    console.log("=== Check Definition ===", JSON.stringify(data, null, 2));

    return data.data?.metaobjectDefinitionByType ?? null;
  } catch (error) {
    console.log("=== Check Definition Error ===", error);
    return null;
  }
};

// checks if the definition exists or not
const ensureDefinitionExist = async (admin)=>{
  
  try {
    const existing = await checkDefinitionExists(admin);

    if(existing){
      console.log("definition exists" , existing.type);
      return existing
    }
    console.log("ensureDefinitionExist : definition doesnt exist , Creating new Definition");
    return await createProductReviewDefinition(admin);
  } catch (error) {
    console.log("=== ensureDefinitionExist Error ===", error);
  }
}

// creates a new definitions
const createProductReviewDefinition = async (admin) => {
  try {

const response = await admin.graphql(`
  #graphql 
  mutation CreateMetaobjectDefinition($definition : MetaobjectDefinitionCreateInput!){
  metaobjectDefinitionCreate(definition : $definition){
  metaobjectDefinition{
  id
  type
  name
  }
  userErrors{
  field
  message
  }
  }
  }
  `,{
    variables:{
      definition:{
        type:"$app:product_review",
        name : "Product Reviews",
        access :  {storefront : "PUBLIC_READ"},
        fieldDefinitions: [
          {  key: "review_product_id",
            name: "Product ID",
            type: "single_line_text_field",
                },
          { key: "review_author",      name: "Author",     type: "single_line_text_field" },
          { key: "review_text_content", name: "Review",     type: "multi_line_text_field"  },
          { key: "review_rating",      name: "Rating",     type: "number_integer"         },
          { key: "review_date",        name: "Date",       type: "single_line_text_field" },
        ],
      }
    }
  })

    // const response = await fetch(
    //   `https://${shop}/admin/api/2026-04/graphql.json`,
    //   {
    //     method: "POST",
    //     headers: {
    //       "X-Shopify-Access-Token": accessToken,
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       query: `
    //       mutation CreateDefinition($definition: MetaobjectDefinitionCreateInput!) {
    //         metaobjectDefinitionCreate(definition: $definition) {
    //           metaobjectDefinition {
    //             id
    //             type
    //             name
    //           }
    //           userErrors {
    //             field
    //             message
    //           }
    //         }
    //       }
    //     `,
    //       variables: {
    //         definition: {
    //           type: "$app:product_review", 
    //           name: "Product Review",
    //           access: { storefront: "PUBLIC_READ" },
    //           fieldDefinitions: [
    //             {  key: "review_product_id",
    //               name: "Product ID",
    //               type: "single_line_text_field",
    //                   },
    //             { key: "review_author",      name: "Author",     type: "single_line_text_field" },
    //             { key: "review_text_content", name: "Review",     type: "multi_line_text_field"  },
    //             { key: "review_rating",      name: "Rating",     type: "number_integer"         },
    //             { key: "review_date",        name: "Date",       type: "single_line_text_field" },
    //           ],
    //         }
    //       }
    //     }),
    //   }
    // );
    const {data} = await response.json();
    console.log("=== Create Definition ===", JSON.stringify(data, null, 2));
    const errors = data.metaobjectDefinitionCreate?.userErrors;
    if (errors?.length > 0) {
      throw new Error(`Definition error: ${JSON.stringify(errors)}`);
    }
    return data.metaobjectDefinitionCreate?.metaobjectDefinition;
  } catch (error) {
    console.log("=== Create Definition Error ===", error);
  console.log("=== Create Definition Error Message ===", error.message);
  throw error;  
  }
};
// create a new review object
const createReviewMetaobject = async (admin,  { productId, text, rating, date, author }) => {
  try {
    const response = await admin.graphql(
      `#graphql
      mutation CreateMetaobject($metaobject : MetaobjectCreateInput!){
        metaobjectCreate(metaobject : $metaobject){
          metaobject{
            id
            handle
            review_product_id : field(key:"review_product_id") {value}
            review_author: field(key : "review_author") {value}
            review_text_content : field(key : "review_text_content"){value}
            review_rating : field(key: "review_rating") {value}
            review_date : field(key:"review_date") {value}
          }
          userErrors{
            field
            message
          }
        }
      }`,{
        variables : {
          metaobject:{
            type:"$app:product_review",
            fields:[
              {key : "review_product_id", value :String(productId)},
              {key:"review_author" , value: author},
              {key:"review_text_content" , value : text},
              {key:"review_rating" , value : String(rating)},
              {key : "review_date" , value : date},
            ]
          }
        }
      }
    )

    const {data} = await response.json();
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
const getReviewsByProduct = async (admin, productId, after = null) => {
  try {
    const response = await admin.graphql(
      `#graphql
      query GetReviews($first: Int!, $after: String) {
        metaobjects(
          type: "$app:product_review"
          first: $first
          after: $after
        ) {
          edges {
            cursor
            node {
              fields { key value }
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }`,
      {
        variables: {
          first: 5,
          after,
        },
      }
    );

    const { data } = await response.json();
    const metaobjects = data?.metaobjects;

    const reviews = (metaobjects?.edges || [])
      .map(({ node }) => {
        const fields = {};
        node.fields.forEach((f) => (fields[f.key] = f.value));
        return fields;
      })
      .filter((f) => String(f.review_product_id) === String(productId)) 
      .map((f) => ({
        product_id: f.review_product_id,
        author:     f.review_author,
        text:       f.review_text_content,
        rating:     Number(f.review_rating),
        date:       f.review_date,
      }));

    return {
      reviews,
      pageInfo: metaobjects?.pageInfo,
    };

  } catch (error) {
    console.error("getReviewsByProduct error:", error);
    return {
      reviews: [],
      pageInfo: { hasNextPage: false, endCursor: null },
    };
  }
};



export async function loader({ request }) {
  const { admin,  session } = await authenticate.public.appProxy(request);

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
    const result = await getReviewsByProduct(
      admin,
      productId,
      null
    );

    return new Response(
      JSON.stringify({
        reviews: result.reviews,
        pageInfo: result.pageInfo
      }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (err) {
    console.error(err);

    return new Response(JSON.stringify({ reviews: [] }), {
      headers: { "Content-Type": "application/json" },
    });
  }
}




export async function action({ request }) {
  const { admin ,session } = await authenticate.public.appProxy(request);
  const shop = session.shop; 
  const body = await request.json();
  const { productId, text, rating, date, author , after } = body;
  // get all reviews  , i am fetching all reviews using POST request in action function because ngrok doesnt allow us to call GET Requests
   // GET REVIEWS (pagination supported)
   if (body.intent === "GetReviews" && body.productId) {
    try {
      const result = await getReviewsByProduct(
        admin,
        productId,
        after || null
      );

      return new Response(JSON.stringify(result), {
        headers: { "Content-Type": "application/json" },
      });
    } catch (err) {
      console.error(err);

      return new Response(JSON.stringify({ reviews: [] }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  }



  try {
   
   await ensureDefinitionExist(admin)
    const newReview = await createReviewMetaobject(admin , {productId , text, rating , date , author});
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