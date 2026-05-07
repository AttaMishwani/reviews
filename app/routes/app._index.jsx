import { useAppBridge } from "@shopify/app-bridge-react";

export default function AppIndex() {
const shopify = useAppBridge();


const handleOpenDashboard = async () => {
  console.log("🚀 handleOpenDashboard triggered");

  try {
    console.log("Requesting Shopify session token...");

    const token = await shopify.idToken();
    console.log("Token received:", token);

    const appUrl = window.location.origin;
    console.log("App URL (origin):", appUrl);

    const finalUrl = `${appUrl}/admin?token=${token}`;
    console.log("Opening new tab with URL:", finalUrl);

    window.open(finalUrl, "_blank");

    console.log("New tab opened successfully");
  } catch (error) {
    console.error("Failed to get session token:", error);
  }
};

  return (
    <s-page heading="Product Reviews">

      <s-section heading="Manage Reviews">
        <s-stack gap="600">
          <s-text tone="subdued">
            View, manage and respond to all customer reviews from your dedicated admin dashboard.
          </s-text>
          <s-box padding-block-start="400">
            <s-button variant="primary" size="large" onClick={handleOpenDashboard}>
              Open Reviews Dashboard →
            </s-button>
          </s-box>
        </s-stack>
      </s-section>

      <s-section heading="Theme Extension">
        <s-stack gap="600">
          <s-text tone="subdued">
            Add the review form block to your product pages using the Shopify theme editor.
          </s-text>
          <s-box padding-block-start="400">
            <s-button
              href="https://new-store-232122222222222223014.myshopify.com/admin/themes/142181466160/editor"
              target="_blank"
            >
              Open Theme Editor →
            </s-button>
          </s-box>
        </s-stack>
      </s-section>

    </s-page>
  );
}