import { useLoaderData } from "react-router";
import AdminLayout from "../components/AdminLayout";
import prisma from "../db.server";
import { verifySessionToken } from "../utils/verifySessionToken";


export async function loader({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

  if (!token) {
    return { shop: "", reviews: [] };
  }

  try {
   
    const payload = verifySessionToken(token);

    const shop =
      payload.dest?.replace("https://", "") ||
      payload.iss?.replace("https://", "");

    
    const session = await prisma.session.findFirst({
      where: { shop },
    });

    if (!session?.accessToken) {
      return { shop, reviews: [] };
    }

    
    const response = await fetch(
      `https://${shop}/admin/api/2026-04/graphql.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Shopify-Access-Token": session.accessToken,
        },
        body: JSON.stringify({
          query: `
            #graphql
            query {
              metaobjects(type: "$app:product_review", first: 250 , reverse:true ) {
                nodes {
                  id
                  handle
                  fields {
                    key
                    value
                  }
                }
              }
            }
          `,
        }),
      }
    );

    const json = await response.json();

    const nodes = json?.data?.metaobjects?.nodes || [];

    // 4. Normalize reviews
    const reviews = nodes.map((node) => {
      const fields = {};

      node.fields.forEach((f) => {
        fields[f.key] = f.value;
      });

      return {
        id: node.id,
        handle: node.handle,
        product_id: fields.review_product_id,
        author: fields.review_author,
        text: fields.review_text_content,
        rating: Number(fields.review_rating),
        date: fields.review_date,
      };
    });

    return {
      shop,
      reviews,
    };
  } catch (error) {
    console.error("Loader Error:", error);
    return { shop: "", reviews: [] };
  }
}


export default function AdminPanel() {
  const { shop, reviews } = useLoaderData();

  return <AdminLayout shop={shop} reviews={reviews} />;
}