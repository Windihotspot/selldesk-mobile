// src/services/api.ts
import axios from "axios";
import { getToken } from "@/auth/keycloak";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL as string,
  headers: { "Content-Type": "application/json" },
});

// Attach Bearer token to every request
api.interceptors.request.use(async (config) => {
  const t = await getToken(30);
  if (t) {
    config.headers["Authorization"] = `Bearer ${t}`;
  }
  return config;
});

// ── TYPES ─────────────────────────────────────────────────────────────────────

export interface InvoicePayment {
  paymentid: string;
  entrydt: string;
  status: number;
  amount: number;
  invoiceid: string;
}

export interface Invoice {
  invoiceid: string;
  merchantid: string;
  userid: string;
  merchant_reference: string;
  amount: number;
  summary: string;
  entrydt: string;
  status: number;
  customeremail: string;
  customermobileno: string;
  invoice_detail: string;
  Payments: InvoicePayment[] | null;
}

export interface PagedInvoicesResponse {
  TotalPages: number;
  InvoicesData: Invoice[];
}

export interface Transaction {
  paymentid: string;
  merchantid: string;
  amount: number;
  paymentreference: string;
  txid: string;
  channelid: string;
  entrydt: string;
  status: number;
  payment_status: number;
  [key: string]: any;
}

// ── INVOICES ──────────────────────────────────────────────────────────────────

/**
 * Quick invoice (simple textarea detail)
 * POST /txdb/procedure/InsertIntoInvoices_v3
 */
export async function createQuickInvoice(payload: {
  p_merchantid: string;
  p_amount: number;
  p_userID: string;
  p_summary: string;
  p_invoice_detail: string;
  p_merchant_reference: string;
  p_customeremail: string;
  p_customermobileno: string;
  p_customername: string;
}) {
  const res = await api.post("/txdb/procedure/InsertIntoInvoices_v3", payload);
  return res.data;
}

/**
 * Full invoice with structured line items
 * POST /api/add_full_invoice_with_details
 */
export async function createFullInvoice(payload: any) {
  const res = await api.post("/api/add_full_invoice_with_details", payload);
  return res.data;
}

/**
 * Get paged invoices by period
 * POST /txdb/procedure/GetPagedInvoicesByPeriod
 *
 * @param merchantid
 * @param period  '1d' | '7d' | '1w' | '1m' | '3m' | '6m' | '1y' | '30d'
 * @param page    1-based page number
 * @param limit   rows per page (default 15)
 */
export async function getInvoicesByPeriod(
  merchantid: string,
  period: string = "1m",
  page: number = 1,
  limit: number = 15
): Promise<PagedInvoicesResponse> {
  try {
    const payload = {
      p_merchantid: merchantid,
      p_page_limit: limit,
      p_page_no: page,
      p_period: period,
    };
    console.log("getInvoicesByPeriod payload →", payload);
    const res = await api.post("/txdb/procedure/GetPagedInvoicesByPeriod", payload);
    console.log("getInvoicesByPeriod response →", res.data);

    const jsresult = res.data?.jsresult;
    if (!jsresult) return { TotalPages: 0, InvoicesData: [] };
    return {
      TotalPages: jsresult.TotalPages ?? 0,
      InvoicesData: jsresult.InvoicesData ?? [],
    };
  } catch (err: any) {
    if (err?.response?.status === 500) {
      console.error("getInvoicesByPeriod 500 response body →", err.response.data);
      return { TotalPages: 0, InvoicesData: [] };
    }
    console.error("getInvoicesByPeriod error", err);
    return { TotalPages: 0, InvoicesData: [] };
  }
}

/**
 * Get paged invoices by date range
 * POST /txdb/procedure/GetPagedInvoicesByDate
 */
export async function getInvoicesByDate(
  merchantid: string,
  startDate: string,     // ISO string e.g. "2025-01-01"
  endDate: string,       // ISO string e.g. "2025-12-31"
  page: number = 1,
  limit: number = 15
): Promise<PagedInvoicesResponse> {
  try {
    const res = await api.post("/txdb/procedure/GetPagedInvoicesByDate", {
      p_merchantid: merchantid,
      p_page_limit: limit,
      p_page_no: page,
      p_start_date: startDate,
      p_end_date: endDate,
    });

    const jsresult = res.data?.jsresult;
    if (!jsresult) return { TotalPages: 0, InvoicesData: [] };
    return {
      TotalPages: jsresult.TotalPages ?? 0,
      InvoicesData: jsresult.InvoicesData ?? [],
    };
  } catch (err) {
    console.error("getInvoicesByDate error", err);
    return { TotalPages: 0, InvoicesData: [] };
  }
}

/**
 * Get invoice detail with payment status and line items
 * POST /txdb/procedure/GetInvoiceWithPaymentStatus
 */
export async function getInvoiceDetail(
  merchantid: string,
  invoiceid: string
) {
  try {
    const res = await api.post(
      "/txdb/procedure/GetInvoiceWithPaymentStatus",
      { p_merchantid: merchantid, p_invoiceid: invoiceid }
    );
    return res.data?.jsresult?.[0] ?? null;
  } catch (err) {
    console.error("getInvoiceDetail error", err);
    return null;
  }
}

// ── PAYMENTS / TRANSACTIONS ───────────────────────────────────────────────────

/**
 * Get successful transactions (payments) for a merchant
 * POST /txdb/procedure/getSuccessfulTransactions
 */
export async function getSuccessfulTransactions(
  merchantid: string,
  period: string = "1m",
  page: number = 1,
  limit: number = 15
): Promise<{ TotalPages: number; TransactionsData: Transaction[] }> {
  try {
    const payload = {
      p_merchantid: merchantid,
      p_page_limit: limit,
      p_page_no:    page,
      p_period:     period,
    };
    console.log("getSuccessfulTransactions_Paged payload →", payload);
    const res = await api.post("/txdb/procedure/getSuccessfulTransactions_Paged", payload);
    console.log("getSuccessfulTransactions_Paged response →", res.data);

    // API unwraps JSONData — response is { status, jsresult: { TotalPages, TransactionsData } }
    const jsresult = res.data?.jsresult;
    if (!jsresult) return { TotalPages: 0, TransactionsData: [] };

    // jsresult may be the object directly or wrapped in [0]
    const data = Array.isArray(jsresult) ? jsresult[0] : jsresult;
    if (!data) return { TotalPages: 0, TransactionsData: [] };

    return {
      TotalPages:       data.TotalPages       ?? 0,
      TransactionsData: data.TransactionsData ?? [],
    };
  } catch (err: any) {
    if (err?.response?.status === 500) {
      console.warn("getSuccessfulTransactions_Paged 500 →", err.response.data);
      return { TotalPages: 0, TransactionsData: [] };
    }
    console.error("getSuccessfulTransactions error", err);
    return { TotalPages: 0, TransactionsData: [] };
  }
}

export default api;