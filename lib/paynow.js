import crypto from "crypto";

// Paynow Zimbabwe integration.
// Set these in your environment / Vercel project:
//   PAYNOW_INTEGRATION_ID   — from your Paynow merchant dashboard
//   PAYNOW_INTEGRATION_KEY  — from your Paynow merchant dashboard
//   PAYNOW_RESULT_URL       — https://your-site.vercel.app/api/paynow/callback
//   PAYNOW_RETURN_URL       — https://your-site.vercel.app/tutoring/return
//
// Docs: https://developers.paynow.co.zw
// This implements both the standard web redirect flow and the "Express Checkout"
// mobile-money flow (EcoCash / InnBucks / OMari) which charges the phone directly.

const INIT_URL = "https://www.paynow.co.zw/interface/initiatetransaction";
const REMOTE_URL = "https://www.paynow.co.zw/interface/remotetransaction";

function cfg() {
  return {
    id: process.env.PAYNOW_INTEGRATION_ID,
    key: process.env.PAYNOW_INTEGRATION_KEY,
    resultUrl: process.env.PAYNOW_RESULT_URL,
    returnUrl: process.env.PAYNOW_RETURN_URL,
  };
}

export function paynowConfigured() {
  const c = cfg();
  return Boolean(c.id && c.key);
}

// Paynow signs every request/response with a SHA512 hash of the concatenated
// values (excluding "hash") followed by the integration key, upper-cased.
function generateHash(values, integrationKey) {
  let concat = "";
  for (const [k, v] of Object.entries(values)) {
    if (k.toLowerCase() === "hash") continue;
    concat += String(v);
  }
  concat += integrationKey;
  return crypto.createHash("sha512").update(concat, "utf8").digest("hex").toUpperCase();
}

function verifyHash(values, integrationKey) {
  const received = values.hash || values.Hash;
  if (!received) return false;
  const expected = generateHash(values, integrationKey);
  return received.toUpperCase() === expected;
}

function toFormBody(obj) {
  return Object.entries(obj)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
    .join("&");
}

function parsePaynowResponse(text) {
  // Paynow returns URL-encoded key=value&key=value
  const out = {};
  for (const pair of text.split("&")) {
    const idx = pair.indexOf("=");
    if (idx === -1) continue;
    const k = decodeURIComponent(pair.slice(0, idx));
    const v = decodeURIComponent(pair.slice(idx + 1).replace(/\+/g, " "));
    out[k.toLowerCase()] = v;
  }
  return out;
}

// Standard web checkout: returns a browserurl to redirect the customer to.
export async function createWebPayment({ reference, email, amount, itemName }) {
  const c = cfg();
  const values = {
    id: c.id,
    reference,
    amount: Number(amount).toFixed(2),
    additionalinfo: itemName,
    returnurl: c.returnUrl,
    resulturl: c.resultUrl,
    authemail: email || "",
    status: "Message",
  };
  values.hash = generateHash(values, c.key);

  const res = await fetch(INIT_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toFormBody(values),
  });
  const data = parsePaynowResponse(await res.text());

  if (data.status && data.status.toLowerCase() === "ok") {
    return {
      ok: true,
      redirectUrl: data.browserurl,
      pollUrl: data.pollurl,
    };
  }
  return { ok: false, error: data.error || "Paynow initiation failed" };
}

// Express Checkout for mobile money — charges the phone directly.
// method must be one of: ecocash | innbucks | omari
export async function createMobilePayment({ reference, email, phone, amount, itemName, method }) {
  const c = cfg();
  const values = {
    id: c.id,
    reference,
    amount: Number(amount).toFixed(2),
    additionalinfo: itemName,
    returnurl: c.returnUrl,
    resulturl: c.resultUrl,
    authemail: email || "",
    phone,
    method, // ecocash | innbucks | omari
    status: "Message",
  };
  values.hash = generateHash(values, c.key);

  const res = await fetch(REMOTE_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: toFormBody(values),
  });
  const data = parsePaynowResponse(await res.text());

  if (data.status && data.status.toLowerCase() === "ok") {
    return {
      ok: true,
      pollUrl: data.pollurl,
      // instructions is shown to the user (e.g. "Dial *151# to approve")
      instructions: data.instructions || "Check your phone to approve the payment.",
    };
  }
  return { ok: false, error: data.error || "Mobile payment failed. Check the number and try again." };
}

// Poll a transaction's status using its poll URL.
export async function checkPaymentStatus(pollUrl) {
  const c = cfg();
  const res = await fetch(pollUrl, { method: "POST" });
  const data = parsePaynowResponse(await res.text());
  const paid = (data.status || "").toLowerCase() === "paid";
  return {
    paid,
    status: (data.status || "unknown").toLowerCase(),
    reference: data.reference,
    amount: data.amount,
    verified: verifyHash(data, c.key),
    raw: data,
  };
}

// Validate an incoming callback from Paynow (server-to-server result URL).
export function validateCallback(values) {
  const c = cfg();
  return {
    valid: verifyHash(values, c.key),
    paid: (values.status || "").toLowerCase() === "paid",
    reference: values.reference,
    pollUrl: values.pollurl,
    status: (values.status || "unknown").toLowerCase(),
  };
}
