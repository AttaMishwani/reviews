
import { useLoaderData} from "react-router";
import {verifySessionToken} from "../utils/verifySessionToken"
import { useState } from "react";
import AdminLayout from"../components/AdminLayout";

// ─── Loader: verify JWT ───────────────────────────────────────────────────────
export async function loader({ request }) {
  const url = new URL(request.url);
  const token = url.searchParams.get("token");

try {
    const payload = verifySessionToken(token);
    const shop  = payload.dest?.replace("https://" , "") ||  payload.iss?.replace("https://" , "");

    return {shop , token}
} catch (error) {
    throw new Error(error)
}
}


export default function AdminPanel() {
    const { shop } = useLoaderData();
  return <AdminLayout shop={shop}/>
}