
<template>
  <ion-page>
    <ion-content class="page" :fullscreen="true">


      <!-- Gradient Topbar -->
<div class="topbar" ref="topbarRef">
  <div v-if="supportOpen" class="support-backdrop" @click="closeSupport" />
 <!-- Merchant selector, now styled to sit inside the topbar -->
  <div class="merchant-wrap-top">
    <div class="merchant-btn-top" @click="toggleMerchantDropdown">
     
      <span class="merchant-btn-label-top">{{ activeMerchantLabel }}</span>
      <ion-icon
        :icon="chevronDownOutline"
        style="font-size:12px;color:white;transition:transform .2s"
        :style="{ transform: merchantDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
      />
    </div>

    <div v-if="merchantDropdownOpen" class="dropdown-overlay" @click="merchantDropdownOpen = false" />

    <transition name="dropdown">
      <div v-if="merchantDropdownOpen" class="dropdown-menu merchant-menu-top">
        <div
          v-for="m in merchantOptions"
          :key="m.id"
          class="dropdown-item"
          :class="{ active: m.id === auth.merchantId }"
          @click="selectMerchant(m.id)"
        >
          
          <span class="merchant-item-label">{{ m.label }}</span>
          <ion-icon
            v-if="m.id === auth.merchantId"
            :icon="checkmarkOutline"
            style="margin-left:auto;color:var(--cm-purple,#5a6fff)"
          />
        </div>
      </div>
    </transition>
  </div>
  <div class="topbar-inner">
    
    <div class="user-chip">
      <div class="ph-ava">{{ userInitials }}</div>
      <div class="username">{{ greeting }}, {{ firstName }} 👋</div>
    </div>

    <div class="topbar-right">
      <div class="icon-btn notif-btn">
        <ion-icon :icon="notificationsOutline" style="font-size:16px; color:white" />
      </div>

      <!-- Support button -->
      <div class="icon-btn support-btn-top" @click="toggleSupport">
        <ion-icon :icon="supportOpen ? closeOutline : chatbubbleEllipsesOutline" style="font-size:16px; color:white" />
      </div>

      <!-- Support dropdown -->
      <transition name="fab-menu">
        <div v-if="supportOpen" class="support-menu-top">
          <button class="support-option-top" @click="openWhatsApp">
            <span class="option-icon-top option-wa">
              <ion-icon :icon="logoWhatsapp" style="font-size:14px" />
            </span>
            WhatsApp
          </button>
          <button class="support-option-top" @click="openEmail">
            <span class="option-icon-top option-mail">
              <ion-icon :icon="mailOutline" style="font-size:14px" />
            </span>
            Email support
          </button>
        </div>
      </transition>
    </div>
  </div>

 
</div>
      <!-- Main layout: stat cards | chart -->
      <div class="dash-body">

        <!-- STAT CARDS -->
        <div class="stats-col">
          <div class="stat-card">
            <p class="stat-label">INVOICES SENT</p>
            <h2 class="stat-value" :class="{ shimmer: loading }">
              {{ loading ? '' : stats.invoiceCount }}
            </h2>
          </div>
          <div class="stat-card">
            <p class="stat-label">PAYMENTS</p>
            <h2 class="stat-value" :class="{ shimmer: loading }">
              {{ loading ? '' : stats.paymentCount }}
            </h2>
          </div>
          <div class="stat-card accent">
            <p class="stat-label">REVENUE</p>
            <h2 class="stat-value sm" :class="{ shimmer: loading }">
              {{ loading ? '' : '₦' + fmtRevenue(stats.totalRevenue) }}
            </h2>
          </div>
        </div>

       

        <!-- QUICK ACTIONS -->
        <div class="quick-actions">
          <div class="qa-item" @click="$router.push('/invoices/create')">
            <div class="qa-icon purple">
              <ion-icon :icon="addOutline" style="font-size:18px; color:#5a6fff" />
            </div>
            <div class="qa-label">Create Invoice</div>
          </div>
          <div class="qa-item" @click="$router.push('/tabs/payments')">
            <div class="qa-icon pink">
              <ion-icon :icon="walletOutline" style="font-size:18px; color:#ed017f" />
            </div>
            <div class="qa-label">Payments</div>
          </div>
          <div class="qa-item" @click="$router.push('/tabs/profile')">
            <div class="qa-icon green">
              <ion-icon :icon="qrCodeOutline" style="font-size:18px; color:#2ecc71" />
            </div>
            <div class="qa-label">Pay Wt split</div>
          </div>
        </div>

         <!-- Period selector -->
        <div class="filter-wrap">
          <div class="filter-btn" @click="toggleDropdown" ref="filterBtnRef">
            <ion-icon :icon="filterOutline" style="font-size:15px;color:var(--cm-purple, #5a6fff)" />
            {{ activeFilterLabel }}
            <ion-icon
              :icon="chevronDownOutline"
              style="font-size:13px;color:var(--cm-purple, #5a6fff);transition:transform 0.2s"
              :style="{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)' }"
            />
          </div>

          <!-- Dropdown overlay -->
          <div v-if="dropdownOpen" class="dropdown-overlay" @click="dropdownOpen = false" />

          <!-- Dropdown menu -->
          <transition name="dropdown">
            <div v-if="dropdownOpen" class="dropdown-menu">
              <div
                v-for="f in periodOptions"
                :key="f.value"
                class="dropdown-item"
                :class="{ active: period === f.value }"
                @click="selectPeriod(f.value)"
              >
                <ion-icon :icon="f.icon" style="font-size:15px" />
                {{ f.label }}
                <ion-icon
                  v-if="period === f.value"
                  :icon="checkmarkOutline"
                  style="font-size:14px;margin-left:auto;color:var(--cm-purple, #5a6fff)"
                />
              </div>
            </div>
          </transition>
        </div>
        <!-- CHART -->
        <div class="chart-col">
          <div class="chart-period-label">{{ periodLabel }}</div>

          <div v-if="loading" class="chart-loading">
            <ion-spinner name="crescent"></ion-spinner>
          </div>

          <div v-else class="chart-area">
            <VueApexCharts
              type="bar"
              height="220"
              :options="chartOptions"
              :series="chartSeries"
            />
          </div>
        </div>
        <!-- RECENT INVOICES (filtered by the same period dropdown) -->
        <div class="invoices-section">
          <div class="section-hdr">
            <h3>Recent Invoices</h3>
            <a @click="$router.push('/tabs/invoices')">View all</a>
          </div>

          <div class="invoices-card">
            <template v-if="loading">
              <div class="inv-loading">
                <ion-spinner name="crescent"></ion-spinner>
              </div>
            </template>

            <template v-else-if="recentInvoices.length === 0">
              <div class="inv-empty">
                <ion-icon :icon="documentOutline" style="font-size:36px;color:#dcdce6" />
                <p>No invoices found for {{ periodLabel.toLowerCase() }}.</p>
              </div>
            </template>

            <template v-else>
             <div
  v-for="inv in recentInvoices"
  :key="inv.invoiceid"
  class="inv-row"
  @click="openInvoiceModal(inv)"
>
  <div class="inv-icon" :class="invMeta(inv.status).iconBg">
    <ion-icon
      :icon="invMeta(inv.status).icon"
      style="font-size:18px"
      :style="{ color: invMeta(inv.status).iconColor }"
    />
  </div>

  <div class="inv-info">
    <div class="inv-amount-main">₦{{ fmtAmount(inv.amount) }}</div>
    <div class="inv-date">
      {{ fmtDate(inv.entrydt) }}
      <template v-if="(inv as any).due_date"> · Due: {{ fmtDate((inv as any).due_date) }}</template>
    </div>
  </div>

  <div class="inv-right">
    <div class="inv-status" :class="invMeta(inv.status).dotClass">
      ● {{ invMeta(inv.status).label }}
    </div>
  </div>

  <!-- view arrow -->
  <ion-icon
    :icon="chevronForwardOutline"
    class="inv-arrow"
  />
</div>
            </template>
          </div>
        </div>

      </div>

      <!-- INVOICE DETAIL MODAL -->
<ion-modal
  :is-open="invoiceModalOpen"
  :initial-breakpoint="0.75"
  :breakpoints="[0, 0.55, 0.9]"
  handle="true"
  @didDismiss="closeInvoiceModal"
>
  <div class="invoice-modal" v-if="selectedInvoice">
    <div class="im-header">
      <div class="im-icon" :class="invMeta(selectedInvoice.status).iconBg">
        <ion-icon
          :icon="invMeta(selectedInvoice.status).icon"
          style="font-size:26px"
          :style="{ color: invMeta(selectedInvoice.status).iconColor }"
        />
      </div>
      <div class="im-header-text">
        <div class="im-amount">₦{{ fmtAmount(selectedInvoice.amount) }}</div>
        <div class="im-status" :class="invMeta(selectedInvoice.status).dotClass">
          ● {{ invMeta(selectedInvoice.status).label }}
        </div>
      </div>
      <ion-icon
        :icon="closeOutline"
        class="im-close"
        @click="closeInvoiceModal"
      />
    </div>

    <div class="im-list">
      <div class="im-row">
        <ion-icon :icon="receiptOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Invoice ID</div>
          <div class="im-row-value">{{ selectedInvoice.invoiceid }}</div>
        </div>
      </div>

      <div class="im-row">
        <ion-icon :icon="calendarOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Date</div>
          <div class="im-row-value">{{ fmtDate(selectedInvoice.entrydt) }}</div>
        </div>
      </div>

      <div class="im-row" v-if="selectedInvoice.invoice_detail">
        <ion-icon :icon="documentTextOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Detail</div>
          <div class="im-row-value">{{ selectedInvoice.invoice_detail }}</div>
        </div>
      </div>

      <div class="im-row" v-if="selectedInvoice.summary">
        <ion-icon :icon="documentOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Summary</div>
          <div class="im-row-value">{{ selectedInvoice.summary }}</div>
        </div>
      </div>

      <div class="im-row" v-if="selectedInvoice.customeremail">
        <ion-icon :icon="mailOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Customer Email</div>
          <div class="im-row-value">{{ selectedInvoice.customeremail }}</div>
        </div>
      </div>

      <div class="im-row" v-if="selectedInvoice.customermobileno">
        <ion-icon :icon="callOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Customer Mobile</div>
          <div class="im-row-value">{{ selectedInvoice.customermobileno }}</div>
        </div>
      </div>

      <div class="im-row" v-if="(selectedInvoice as any).merchant_reference">
        <ion-icon :icon="pricetagOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Merchant Reference</div>
          <div class="im-row-value">{{ (selectedInvoice as any).merchant_reference }}</div>
        </div>
      </div>

      <div class="im-row" v-if="(selectedInvoice as any).merchantid">
        <ion-icon :icon="businessOutline" class="im-row-icon" />
        <div class="im-row-body">
          <div class="im-row-label">Merchant ID</div>
          <div class="im-row-value">{{ (selectedInvoice as any).merchantid }}</div>
        </div>
      </div>
    </div>
  </div>
</ion-modal>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from "vue";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonIcon,
  IonSpinner,
  IonModal,
} from "@ionic/vue";
import {
    chevronForwardOutline,
  filterOutline,
  chevronDownOutline,
  checkmarkOutline,
  calendarNumberOutline,
  calendarOutline,
  calendarClearOutline,
  addOutline,
  swapHorizontalOutline,
  personOutline,
  checkmarkCircleOutline,
  closeCircleOutline,
  timeOutline,
  documentOutline,
  businessOutline,
  closeOutline,        // ← modal close button
  cashOutline,          // ← amount
  receiptOutline,       // ← invoice id
  pricetagOutline,      // ← merchant reference
  mailOutline,          // ← customer email
  callOutline,          // ← customer mobile
  documentTextOutline,
  qrCodeOutline,
  walletOutline, 
    notificationsOutline,       // ← new
  chatbubbleEllipsesOutline,  // ← new
  logoWhatsapp,               // ← new
} from "ionicons/icons";
import { useAuthStore } from "@/stores/auth";
import {
  getInvoicesByPeriod,
  getSuccessfulTransactions,
  type Invoice,
  type Transaction,
} from "@/services/api";

// Imported components are auto-registered in <script setup> — no need to
// add `apexchart` globally in main.ts. If you'd rather register it globally
// instead, remove this import and revert the template tag to <apexchart>.
import VueApexCharts from "vue3-apexcharts";

const auth = useAuthStore();
const period = ref<"7d" | "1w" | "1m">("7d");
const loading = ref(false);

// ── Greeting & avatar ──────────────────────────────────────
const firstName = computed(() => auth.user?.fname || "User");

const userInitials = computed(() => {
  const f = auth.user?.fname?.[0] || "";
  const l = auth.user?.lname?.[0] || "";
  return (f + l).toUpperCase() || "U";
});

const greeting = computed(() => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 16) return "Good afternoon";
  return "Good evening";
});

// ── Support dropdown ───────────────────────────────────────
const supportOpen = ref(false);
const toggleSupport = () => { supportOpen.value = !supportOpen.value; };
const closeSupport = () => { supportOpen.value = false; };

const openWhatsApp = async () => {
  closeSupport();
  if (!Capacitor.isNativePlatform()) {
    window.open("https://wa.me/+2348084107354", "_blank");
    return;
  }
  try {
    await Share.share({
      title: "Support",
      text: "Hi, I need help with my invoice dashboard.",
      dialogTitle: "Contact Support",
    });
  } catch (err) {
    console.log("Share cancelled", err);
  }
};

const openEmail = async () => {
  closeSupport();
  try {
    await Share.share({
      title: "Support Request",
      text: "Hi, I need help with my invoice dashboard.",
      dialogTitle: "Contact Support",
    });
  } catch (err) {
    console.log("Share cancelled or unavailable", err);
    window.open("mailto:support@getcredmate.co?subject=Support Request", "_self");
  }
};

// ── Animation ref for topbar (optional, matches CredMate pattern) ──
const topbarRef = ref<HTMLElement | null>(null);

// ── PERIOD DROPDOWN (matches the Loan History filter dropdown) ──
const dropdownOpen = ref(false);
const filterBtnRef = ref<HTMLElement | null>(null);

const periodOptions = [
  { value: "7d" as const, label: "Last 7 Days", icon: calendarNumberOutline },
  { value: "1w" as const, label: "This Week", icon: calendarOutline },
  { value: "1m" as const, label: "This Month", icon: calendarClearOutline },
];

const activeFilterLabel = computed(
  () => periodOptions.find((p) => p.value === period.value)?.label ?? "Last 7 Days"
);

const toggleDropdown = () => {
  merchantDropdownOpen.value = false; // only one dropdown open at a time
  dropdownOpen.value = !dropdownOpen.value;
};

const selectPeriod = (value: "7d" | "1w" | "1m") => {
  period.value = value;
  dropdownOpen.value = false;
  load();
};

// ── MERCHANT DROPDOWN ─────────────────────────────────────
// Your auth payload exposes `merchantids: string[]` — no display names —
// so we fall back to showing the raw ID. If your store later adds merchant
// names (e.g. `auth.merchants` as [{ merchantid, merchantname }]), this
// picks those up automatically instead.
const merchantDropdownOpen = ref(false);

const merchantOptions = computed(() => {
  console.log("merchantIds:", auth.user?.merchantids);

  const result = auth.user?.merchantids.map(id => ({
    id,
    label: id
  })) ?? [];

  console.log("result:", result);

  return result;
});

// ── INVOICE DETAIL MODAL ──────────────────────────────────
const invoiceModalOpen = ref(false);
const selectedInvoice = ref<Invoice | null>(null);

function openInvoiceModal(inv: Invoice) {
  selectedInvoice.value = inv;
  invoiceModalOpen.value = true;
}

function closeInvoiceModal() {
  invoiceModalOpen.value = false;
  // small delay so the modal's exit transition doesn't visibly clear content
  setTimeout(() => (selectedInvoice.value = null), 300);
}

const activeMerchantLabel = computed(() => {
  const current = merchantOptions.value.find((m: any) => m.id === auth.merchantId);
  return current?.label || auth.merchantId || "Select merchant";
});

const toggleMerchantDropdown = () => {
  dropdownOpen.value = false; // only one dropdown open at a time
  merchantDropdownOpen.value = !merchantDropdownOpen.value;
};

const selectMerchant = (id: string) => {
  const a = auth as any;
  if (typeof a.selectMerchant === "function") {
    a.selectMerchant(id);
  } else {
    a.merchantId = id;
  }
  merchantDropdownOpen.value = false;
  // `load()` also fires from the `watch(() => auth.merchantId, ...)` below —
  // this direct call just makes the refresh feel instant on tap.
  load();
};

const stats = reactive({ invoiceCount: 0, paymentCount: 0, totalRevenue: 0 });
const invoices = ref<Invoice[]>([]);
const transactions = ref<Transaction[]>([]);

// ── PERIOD LABEL ──────────────────────────────────────────
const periodLabel = computed(() => {
  if (period.value === "7d") return "Last 7 Days";
  if (period.value === "1w") return "This Week (Sun – Sat)";
  return "This Month by Week";
});

// ── BUCKETS ───────────────────────────────────────────────
interface Bucket {
  label: string;
  invoices: number;
  payments: number;
  revenue: number;
}

const chartBuckets = computed<Bucket[]>(() => {
  const now = new Date();

  if (period.value === "7d") {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      return {
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        invoices: countIn(invoices.value, d, next),
        payments: countIn(transactions.value, d, next),
        revenue: sumIn(transactions.value, d, next),
      };
    });
  }

  if (period.value === "1w") {
    const sun = new Date(now);
    sun.setDate(now.getDate() - now.getDay());
    sun.setHours(0, 0, 0, 0);
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(sun);
      d.setDate(sun.getDate() + i);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      return {
        label: d.toLocaleDateString("en-GB", { weekday: "short" }),
        invoices: countIn(invoices.value, d, next),
        payments: countIn(transactions.value, d, next),
        revenue: sumIn(transactions.value, d, next),
      };
    });
  }

  // Month — calendar weeks
  const first = new Date(now.getFullYear(), now.getMonth(), 1);
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const weeks: Bucket[] = [];
  let ws = new Date(first);
  let wk = 1;
  while (ws <= last && wk <= 6) {
    const we = new Date(ws);
    we.setDate(ws.getDate() + 7);
    if (we > last) we.setTime(last.getTime() + 86400000);
    weeks.push({
      label: `Wk ${wk}`,
      invoices: countIn(invoices.value, ws, we),
      payments: countIn(transactions.value, ws, we),
      revenue: sumIn(transactions.value, ws, we),
    });
    ws = new Date(we);
    wk++;
  }
  return weeks;
});

function countIn<T extends { entrydt: string }>(
  arr: T[],
  from: Date,
  to: Date
): number {
  return arr.filter((x) => {
    const d = new Date(x.entrydt);
    return d >= from && d < to;
  }).length;
}

function sumIn(arr: Transaction[], from: Date, to: Date): number {
  return arr
    .filter((x) => {
      const d = new Date(x.entrydt);
      return d >= from && d < to;
    })
    .reduce((s, x) => s + (x.amount || 0), 0);
}

function fmtRevenue(kobo: number): string {
  const n = kobo / 100;
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "k";
  return n.toLocaleString("en-NG", { maximumFractionDigits: 0 });
}

// ── RECENT INVOICES (filtered by the same period as the chart) ──
function fmtDate(dt: string): string {
  return dt
    ? new Date(dt).toLocaleDateString("en-GB", { day: "numeric", month: "numeric", year: "numeric" })
    : "—";
}

function fmtAmount(kobo: number): string {
  return (kobo / 100).toLocaleString("en-NG", { minimumFractionDigits: 0 });
}

// Maps an invoice's numeric status (0 = unpaid, 1 = paid, 2 = partial) to the
// icon/colors used in the row. Adjust the codes here if your API uses
// different status values.
function invMeta(status: number) {
  if (status === 1) {
    return {
      label: "Paid",
      icon: checkmarkCircleOutline,
      iconBg: "iv-purple",
      iconColor: "#5a6fff",
      amountClass: "iv-amt-purple",
      dotClass: "iv-dot-green",
    };
  }
  if (status === 2) {
    return {
      label: "Partial",
      icon: timeOutline,
      iconBg: "iv-amber",
      iconColor: "#c98a00",
      amountClass: "iv-amt-amber",
      dotClass: "iv-dot-amber",
    };
  }
  return {
    label: "Unpaid",
    icon: closeCircleOutline,
    iconBg: "iv-red",
    iconColor: "#e5484d",
    amountClass: "iv-amt-red",
    dotClass: "iv-dot-red",
  };
}

// Most-recent-first, capped to keep the dashboard card compact.
const recentInvoices = computed(() =>
  [...invoices.value]
    .sort((a, b) => new Date(b.entrydt).getTime() - new Date(a.entrydt).getTime())
    .slice(0, 6)
);

// ── APEXCHARTS CONFIG ─────────────────────────────────────
const chartSeries = computed(() => [
  {
    name: "Invoices",
    data: chartBuckets.value.map((b) => b.invoices),
  },
  {
    name: "Payments",
    data: chartBuckets.value.map((b) => b.payments),
  },
]);

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false },
    fontFamily: "inherit",
    animations: { easing: "easeinout", speed: 450 },
  },
  colors: ["#5a6fff", "#ff9f43"],
  plotOptions: {
    bar: {
      columnWidth: "55%",
      borderRadius: 6,
      borderRadiusApplication: "end",
    },
  },
  dataLabels: { enabled: false },
  stroke: { show: false },
  grid: {
    show: true,
    borderColor: "#f0f1ff",
    strokeDashArray: 4,
    yaxis: { lines: { show: true } },
    xaxis: { lines: { show: false } },
  },
  xaxis: {
    categories: chartBuckets.value.map((b) => b.label),
    labels: {
      style: { fontSize: "10px", fontWeight: 600, colors: "#444" },
    },
    axisBorder: { show: false },
    axisTicks: { show: false },
  },
  yaxis: {
    labels: {
      style: { fontSize: "10px", colors: "#aaa" },
      formatter: (val: number) => Math.round(val).toString(),
    },
  },
  legend: {
    show: true,
    position: "bottom",
    fontSize: "10px",
    labels: { colors: "#aaa" },
    markers: { radius: 12 },
  },
  tooltip: {
    y: {
      formatter: (val: number, opts: any) => {
        // add revenue context under the Payments series tooltip
        const idx = opts.dataPointIndex;
        const bucket = chartBuckets.value[idx];
        if (opts.seriesIndex === 1 && bucket) {
          return `${val} payments (₦${fmtRevenue(bucket.revenue)})`;
        }
        return `${val}`;
      },
    },
  },
}));

// ── LOAD ──────────────────────────────────────────────────
async function load() {
  console.log("========== LOAD ==========");
  console.log("Merchant:", auth.merchantId);
  console.log("Period:", period.value);

  if (!auth.merchantId) return;

  loading.value = true;

  try {
    const [invRes, payRes] = await Promise.all([
      getInvoicesByPeriod(auth.merchantId, period.value, 1, 100),
      getSuccessfulTransactions(auth.merchantId, period.value, 1, 100),
    ]);

    console.log("Invoices Response:", invRes);
    console.log("Transactions Response:", payRes);

    invoices.value = invRes.InvoicesData || [];
    transactions.value = payRes.TransactionsData || [];

    console.log("Invoices Count:", invoices.value.length);
    console.log("Invoices:", invoices.value);

    console.log("Transactions Count:", transactions.value.length);
    console.log("Transactions:", transactions.value);
  } catch (err) {
    console.error("LOAD ERROR:", err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  load();
});
watch(
  () => auth.merchantId,
  (id) => {
    if (id) load();
  },
  { immediate: false }
);
</script>

<style scoped>
.page {
  --padding-start: 12px;
  --padding-end: 12px;
  --padding-top: 4px;
}

/* Header */
.dash-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
  flex-wrap: wrap;
  gap: 8px;
}
.section-title {
  /* Unused now that the "Overview" heading was replaced by the merchant
     dropdown — safe to delete, kept only as a placeholder in case you
     reintroduce a plain heading elsewhere. */
  display: none;
}

/* ── Filter dropdown (same pattern as Loan History) ─────── */
.filter-wrap {
  position: relative;
  width: 150px;
  align-self: flex-end; 
}
.filter-btn {
  display: flex; align-items: center; gap: 5px;
  padding: 6px 12px; border-radius: 8px;
  background: var(--cm-purple-50, #eef0ff);
  border: 1px solid rgba(90, 111, 255, 0.15);
  font-size: 0.75rem; font-weight: 600;
  color: var(--cm-purple, #5a6fff); cursor: pointer;
  position: relative; z-index: 1001; user-select: none;
}

/* ── Merchant dropdown (mirrors the filter dropdown) ────── */
.filter-wrap {
  position: relative;
  z-index: 1002;
}
.merchant-btn {
  display: flex; align-items: center; gap: 6px;
  padding: 6px 10px; border-radius: 8px;
  background: white;
  border: 1px solid #e4e6f7;
  font-size: 0.75rem; font-weight: 700;
  color: #2d2d2d; cursor: pointer;
  position: relative; z-index: 1001; user-select: none;
  max-width: 200px;
}
.merchant-btn-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.merchant-menu {
  left: 0;
  right: auto;
  min-width: 220px;
  max-height: 280px;
  overflow-y: auto;
}
.merchant-item-label {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
}
.dropdown-overlay {
  position: fixed; inset: 0; z-index: 999;
}
.dropdown-menu {
  position: absolute;
  top: 100%; right: 0; margin-top: 8px;
  z-index: 1000; background: white;
  border-radius: 12px; border: 1px solid var(--cm-gray-100, #f0f1ff);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  overflow: hidden; min-width: 160px;
}
.dropdown-item {
  display: flex; align-items: center; gap: 10px; padding: 13px 16px;
  font-size: 0.8rem; font-weight: 600;
  color: #555; cursor: pointer;
  border-bottom: 1px solid var(--cm-gray-100, #f0f1ff);
  transition: background 0.15s;
}
.dropdown-item:last-child { border-bottom: none; }
.dropdown-item:active { background: var(--cm-gray-100, #f4f5ff); }
.dropdown-item.active {
  color: var(--cm-purple, #5a6fff);
  background: var(--cm-purple-50, #eef0ff);
}
.dropdown-enter-active, .dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from, .dropdown-leave-to {
  opacity: 0; transform: translateY(-6px) scale(0.97);
}

/* ── MAIN LAYOUT (stacked for mobile) ───────────────────── */
.dash-body {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* ── STAT CARDS: row of 3 on mobile ──────────────────────── */
.stats-col {
  display: flex;
  flex-direction: row;
  gap: 8px;
}

.stat-card {
  background: #eef0ff;
  border-radius: 16px;
  padding: 10px 10px;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
}
.stat-card.accent {
  background: #fff4e6;
}

.stat-label {
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  color: #9a9ab0;
  margin: 0 0 4px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.stat-value {
  font-size: 20px;
  font-weight: 800;
  margin: 0;
  color: #2d2d2d;
  line-height: 1;
}
.stat-value.sm {
  font-size: 14px;
}

/* shimmer loading placeholder */
.shimmer {
  background: linear-gradient(90deg, #e8eaff 25%, #f4f5ff 50%, #e8eaff 75%);
  background-size: 200% 100%;
  animation: shimmer 1.2s infinite;
  border-radius: 6px;
  color: transparent !important;
  min-height: 26px;
  min-width: 36px;
}
@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

/* ── CHART CARD ──────────────────────────────────────────── */
.chart-col {
  background: #fafaff;
  border-radius: 16px;
  padding: 14px 12px 6px;
}

.chart-period-label {
  font-size: 11px;
  font-weight: 700;
  color: #5a6fff;
  margin-bottom: 6px;
  letter-spacing: 0.03em;
}

.chart-loading {
  min-height: 220px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.chart-area {
  width: 100%;
}

/* ── QUICK ACTIONS ───────────────────────────────────────── */
.quick-actions {
  display: flex;
  gap: 10px;
}

.qa-item {
  flex: 1;
  background: white;
  border: 1px solid #eef0ff;
  border-radius: 16px;
  padding: 14px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  box-shadow: 0 2px 10px rgba(90, 111, 255, 0.06);
  transition: transform 0.15s;
}
.qa-item:active {
  transform: scale(0.97);
}

.qa-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.qa-icon.purple { background: #eef0ff; }
.qa-icon.pink   { background: #ffe6f3; }
.qa-icon.green  { background: #e6faf0; }

.qa-label {
  font-size: 10px;
  font-weight: 700;
  color: #555;
  text-align: center;
}

/* ── RECENT INVOICES ─────────────────────────────────────── */
.invoices-section {
  display: flex;
  flex-direction: column;
}

.section-hdr {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}
.section-hdr h3 {
  font-size: 13px;
  font-weight: 700;
  color: #2d2d2d;
  margin: 0;
}
.section-hdr a {
  font-size: 11px;
  font-weight: 600;
  color: #5a6fff;
  cursor: pointer;
}

.invoices-card {
  background: white;
  border-radius: 16px;
  border: 1px solid #f0f1ff;
  box-shadow: 0 2px 10px rgba(90, 111, 255, 0.05);
  overflow: hidden;
}

.inv-loading,
.inv-empty {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 30px 16px;
}
.inv-empty p {
  font-size: 12px;
  color: #999;
  margin: 0;
  text-align: center;
}

.inv-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-bottom: 1px solid #f4f4fb;
  cursor: pointer;
  transition: background 0.15s;
  position: relative;
  padding-right: 34px; /* room for arrow */
}
.inv-row:last-child { border-bottom: none; }
.inv-row:active { background: #fafbff; }

.inv-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}
.inv-icon.iv-purple { background: #eef0ff; }
.inv-icon.iv-red    { background: #fdecec; }
.inv-icon.iv-amber  { background: #fff6e0; }

.inv-info { flex: 1; min-width: 0; }
.inv-amount-main {
  font-size: 14px;
  font-weight: 700;
  color: #2d2d2d;
  text-decoration-color: #cfd2e6;
}
.inv-date {
  font-size: 11px;
  color: #9a9ab0;
  margin-top: 2px;
}

.inv-right { text-align: right; flex-shrink: 0; }
.inv-amount {
  font-size: 14px;
  font-weight: 800;
}
.inv-amount.iv-amt-purple { color: #5a6fff; text-decoration-color: #b9c1ff; }
.inv-amount.iv-amt-red    { color: #e5484d; text-decoration-color: #f3b3b5; }
.inv-amount.iv-amt-amber  { color: #c98a00; text-decoration-color: #f0d38f; }

.inv-status {
  font-size: 10px;
  font-weight: 700;
  margin-top: 3px;
  text-transform: capitalize;
}
.inv-status.iv-dot-green { color: #1a9e5c; }
.inv-status.iv-dot-red   { color: #e5484d; }
.inv-status.iv-dot-amber { color: #c98a00; }
.inv-arrow {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 16px;
  color: #c7c9de;
  flex-shrink: 0;
}

/* Modal */
.invoice-modal {
  padding: 8px 18px 24px;
  height: 100%;
  overflow-y: auto;
}
.im-header {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 0 18px;
  border-bottom: 1px solid #f0f1ff;
  position: relative;
}
.im-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}
.im-icon.iv-purple { background: #eef0ff; }
.im-icon.iv-red    { background: #fdecec; }
.im-icon.iv-amber  { background: #fff6e0; }

.im-header-text { flex: 1; min-width: 0; }
.im-amount {
  font-size: 20px;
  font-weight: 800;
  color: #2d2d2d;
}
.im-status {
  font-size: 11px;
  font-weight: 700;
  margin-top: 2px;
  text-transform: capitalize;
}
.im-status.iv-dot-green { color: #1a9e5c; }
.im-status.iv-dot-red   { color: #e5484d; }
.im-status.iv-dot-amber { color: #c98a00; }

.im-close {
  font-size: 22px;
  color: #b0b0c0;
  cursor: pointer;
  padding: 4px;
}

.im-list {
  display: flex;
  flex-direction: column;
  padding-top: 6px;
}
.im-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 12px 0;
  border-bottom: 1px solid #f7f7fb;
}
.im-row:last-child { border-bottom: none; }
.im-row-icon {
  font-size: 17px;
  color: #5a6fff;
  margin-top: 2px;
  flex-shrink: 0;
}
.im-row-body { flex: 1; min-width: 0; }
.im-row-label {
  font-size: 10.5px;
  font-weight: 700;
  color: #9a9ab0;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.im-row-value {
  font-size: 13.5px;
  font-weight: 600;
  color: #2d2d2d;
  margin-top: 2px;
  word-break: break-word;
}
.topbar {
    background: linear-gradient(135deg, #5a6fff, #7d8aff);
  padding: 46px 16px 16px;
  margin: -4px -12px 14px;
  position: relative;
  overflow: visible;
  z-index: 999;
}

.support-backdrop {
  position: fixed;
  inset: 0;
  z-index: 9998;
}

.topbar-inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  margin-top: 10px;
  position: relative;
  z-index: 1;
}

.user-chip { display: flex; align-items: center; gap: 8px; }
.ph-ava {
  width: 30px; height: 30px; border-radius: 50%;
  background: white; display: flex; align-items: center; justify-content: center;
  font-weight: 800; font-size: 0.7rem; color: #5a6fff;
  border: 2.5px solid rgba(255,255,255,.3); flex-shrink: 0;
}
.username {
  font-size: 0.9rem; font-weight: 700; color: white;
}

.topbar-right { display: flex; align-items: center; gap: 10px; position: relative; }

.icon-btn {
  width: 34px; height: 34px; border-radius: 50%;
  background: rgba(255,255,255,.15);
  display: flex; align-items: center; justify-content: center;
  cursor: pointer;
}

.support-btn-top { position: relative; }

.support-menu-top {
  position: absolute;
  top: 42px;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 10000;
  min-width: 160px;
}
.support-option-top {
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid rgba(0,0,0,.08);
  border-radius: 999px;
  padding: 8px 14px 8px 8px;
  font-size: 13px;
  font-weight: 500;
  color: #1a1a2e;
  cursor: pointer;
  white-space: nowrap;
  box-shadow: 0 2px 12px rgba(0,0,0,.12);
}
.option-icon-top {
  width: 26px; height: 26px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  color: white; flex-shrink: 0;
}
.option-wa   { background: #25d366; }
.option-mail { background: linear-gradient(135deg, #7c3aed, #ec4899); }

.fab-menu-enter-active, .fab-menu-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.fab-menu-enter-from, .fab-menu-leave-to {
  opacity: 0; transform: translateY(-6px);
}

/* Merchant selector inside topbar */
.merchant-wrap-top {
  position: relative;
  z-index: 2;
}
.merchant-btn-top {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 6px 12px;
  border-radius: 8px;
  background: rgba(255,255,255,.15);
  cursor: pointer;
  max-width: 100%;
}
.merchant-btn-label-top {
  font-size: 0.72rem;
  font-weight: 700;
  color: white;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  max-width: 160px;
}
.merchant-menu-top {
  left: 0; right: auto;
  min-width: 220px;
  max-height: 280px;
  overflow-y: auto;
}
.merchant-item-label {
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap; min-width: 0;
}
</style>