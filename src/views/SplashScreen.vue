<!-- src/views/SplashScreen.vue -->
<!--
  Animated splash screen for an Ionic Vue mobile app.
  - Logo scales/fades in
  - Tagline fades up shortly after
  - Gradient orbs drift continuously in the background
  - Progress dots pulse while "loading"
  - Auto-navigates to /login (or wherever you want) after ~2.4s,
    or immediately if the user taps the screen
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="splash-content" @click="skip">
      <div class="splash-root">

        <!-- Background gradient orbs -->
        <div class="grad-orb orb1"></div>
        <div class="grad-orb orb2"></div>
        <div class="grad-orb orb3"></div>

        <div class="splash-center">
          <!-- Logo -->
          <div class="logo-block" :class="{ 'is-in': show.logo }">
            <img src="../assets/images/selldesk-logo.png" alt="SellDesk" class="logo-img" />
          </div>

          <!-- Tagline -->
          <p class="tagline" :class="{ 'is-in': show.tagline }">
            Invoice smarter.<br />Get paid faster.
          </p>

          <!-- Feature pills -->
          <div class="feature-pills" :class="{ 'is-in': show.pills }">
            <span class="pill" style="--d:0s">Instant Invoices</span>
            <span class="pill" style="--d:0.12s">Payment Tracking</span>
            <span class="pill" style="--d:0.24s">Live Analytics</span>
          </div>

          <!-- Loading dots -->
          <div class="loading-dots" :class="{ 'is-in': show.dots }">
            <span></span><span></span><span></span>
          </div>
        </div>

        <!-- Footer -->
        <div class="splash-footer" :class="{ 'is-in': show.footer }">
          <img src="@/assets/images/teinnovate-logo-clear.png" class="footer-logo" />
          <p class="footer-text">
            <strong>CBN licensed Payment Service Provider</strong><br />
            www.quidly.ng | admin@quidly.ng
          </p>
        </div>

      </div>
    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import { IonPage, IonContent } from "@ionic/vue";
import { onMounted, onBeforeUnmount, reactive } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Where the splash should send the user once it's done.
const NEXT_ROUTE = "/signin";
// Total time (ms) the splash stays up before auto-navigating.
const AUTO_ADVANCE_MS = 2400;

const show = reactive({
  logo: false,
  tagline: false,
  pills: false,
  dots: false,
  footer: false,
});

let advanceTimer: ReturnType<typeof setTimeout> | null = null;
let navigated = false;

function goNext() {
  if (navigated) return;
  navigated = true;
  router.replace(NEXT_ROUTE);
}

// Tapping the splash skips straight to the next screen.
function skip() {
  goNext();
}

onMounted(() => {
  // Staggered entrance choreography
  setTimeout(() => (show.logo = true), 80);
  setTimeout(() => (show.tagline = true), 380);
  setTimeout(() => (show.pills = true), 620);
  setTimeout(() => (show.dots = true), 900);
  setTimeout(() => (show.footer = true), 700);

  advanceTimer = setTimeout(goNext, AUTO_ADVANCE_MS);
});

onBeforeUnmount(() => {
  if (advanceTimer) clearTimeout(advanceTimer);
});
</script>

<style scoped>
.splash-content {
  --background: #f0f2fa;
}

.splash-root {
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  font-family: 'Segoe UI', system-ui, sans-serif;
  padding: 24px;
  background: linear-gradient(160deg, #f7fbff 0%, #f0f2fa 55%, #eef7f0 100%);
}

/* ── Floating gradient orbs (background) ─────────────────── */
.grad-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.5;
  animation: drift 9s ease-in-out infinite alternate;
  pointer-events: none;
}
.orb1 {
  width: 280px; height: 280px;
  background: radial-gradient(circle, #a8d8f0, transparent);
  top: -80px; right: -60px;
  animation-duration: 10s;
}
.orb2 {
  width: 220px; height: 220px;
  background: radial-gradient(circle, #b8e8c8, transparent);
  bottom: -60px; left: -30px;
  animation-duration: 12s;
}
.orb3 {
  width: 160px; height: 160px;
  background: radial-gradient(circle, #c8d8f8, transparent);
  top: 60%; left: 70%;
  transform: translate(-50%, -50%);
  animation-duration: 8s;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(16px, -20px) scale(1.08); }
}

/* ── Center content ───────────────────────────────────────── */
.splash-center {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0;
}

/* Logo entrance */
.logo-block {
  margin-bottom: 6px;
  opacity: 0;
  transform: scale(0.7) translateY(10px);
  transition: opacity 0.6s cubic-bezier(.2,.8,.2,1), transform 0.6s cubic-bezier(.2,.8,.2,1);
}
.logo-block.is-in {
  opacity: 1;
  transform: scale(1) translateY(0);
  animation: logo-pulse 2.6s ease-in-out 0.6s infinite;
}
@keyframes logo-pulse {
  0%, 100% { transform: scale(1); }
  50%      { transform: scale(1.035); }
}
.logo-img {
  width: 180px;
  height: auto;
  display: block;
}

/* Tagline entrance */
.tagline {
  font-size: 13px;
  color: #9090a8;
  margin: 14px 0 28px;
  line-height: 1.6;
  text-align: center;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.tagline.is-in { opacity: 1; transform: translateY(0); }

/* Feature pills */
.feature-pills {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
  margin-bottom: 32px;
}
.pill {
  background: rgba(255,255,255,0.8);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255,255,255,0.9);
  border-radius: 50px;
  padding: 9px 20px;
  font-size: 13px;
  font-weight: 600;
  color: #2a3a5a;
  box-shadow: 0 2px 10px rgba(90,111,255,0.08);
  white-space: nowrap;
  opacity: 0;
  transform: translateY(10px);
  transition: opacity 0.45s ease, transform 0.45s ease;
  transition-delay: var(--d, 0s);
}
.feature-pills.is-in .pill { opacity: 1; transform: translateY(0); }

/* Loading dots */
.loading-dots {
  display: flex;
  gap: 6px;
  opacity: 0;
  transition: opacity 0.4s ease;
}
.loading-dots.is-in { opacity: 1; }
.loading-dots span {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #4b9fd5;
  animation: dot-bounce 1.1s ease-in-out infinite;
}
.loading-dots span:nth-child(2) { animation-delay: 0.15s; }
.loading-dots span:nth-child(3) { animation-delay: 0.3s; }
@keyframes dot-bounce {
  0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
  40%           { transform: translateY(-6px); opacity: 1; }
}

/* ── Footer ───────────────────────────────────────────────── */
.splash-footer {
  position: absolute;
  bottom: env(safe-area-inset-bottom, 20px);
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
  z-index: 1;
}
.splash-footer.is-in { opacity: 1; transform: translateY(0); }

.footer-logo {
  height: 22px;
  width: auto;
}

.footer-text {
  font-size: 11px;
  color: #7a7a7a;
  text-align: center;
  margin: 0;
  line-height: 1.6;
}
</style>