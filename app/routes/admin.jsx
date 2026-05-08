
import { useLoaderData} from "react-router";
import {verifySessionToken} from "../utils/verifySessionToken"
import { useState } from "react";
import AdminLayout from"../components/AdminLayout";
import prisma from "../db.server";

    
export async function loader({ request }) {
 const url = new URL(request.url);
 const token = url.searchParams.get("token");

try {
  const payload = verifySessionToken(token);
  const shop = payload.dest?.replace("https://", "") || payload.iss?.replace("https://", "");

  const session = await prisma.session.findFirst({
    where: { shop }
  });
  
  console.log("session found:", session?.id);
  console.log("access token:", session?.accessToken);
  console.log("looking for shop:", shop);
  const accessToken = session?.accessToken;

  const query = `
  {
    products(first: 50) {
      edges {
        node {
          id
          title
          featuredImage {
            url
          }
          metafield(namespace: "reviews", key: "list") {
            value
          }
        }
      }
    }
  }
`;

const graphqlRes = await fetch(
  `https://${shop}/admin/api/2026-07/graphql.json`,
  {
    method: "POST",
    headers: {
      "X-Shopify-Access-Token": accessToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query }),
  }
);

const graphqlData = await graphqlRes.json();
const products = graphqlData.data.products.edges.map(e => e.node);

const allReviews = [];
products.forEach((product) => {
  if (product.metafield) {
    const reviews = JSON.parse(product.metafield.value);
    reviews.forEach((review) => {
      allReviews.push({
        ...review,
        productTitle: product.title,
        productImage: product.featuredImage?.url || null,
      });
    });
  }
});

return { shop, reviews: allReviews };

} catch (error) {
  console.log(error);
  return { shop: "", reviews: [] };
}


}


export default function AdminPanel() {
    const { shop , reviews } = useLoaderData();
  return <AdminLayout shop={shop} reviews={reviews}/>
}