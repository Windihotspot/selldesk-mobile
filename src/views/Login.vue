<!-- src/views/LoginPage.vue -->
<!--
  Enhanced login page for the Ionic Vue app.
  Follows the same visual language as SplashScreen.vue:
  - drifting gradient orbs
  - staggered entrance choreography
  - logo / tagline / feature pills
  - CBN PSP footer
  Adds: animated card entrance, hover/press states, inline error with
  shake feedback, retry affordance, and a "connecting…" sub-state.
-->
<template>
  <ion-page>
    <ion-content :fullscreen="true" class="login-content">
      <div class="login-root">

        <!-- Background gradient orbs -->
        <div class="grad-orb orb1"></div>
        <div class="grad-orb orb2"></div>
        <div class="grad-orb orb3"></div>

        <div class="login-card" :class="{ 'is-in': show.card }">

          <!-- LEFT PANEL -->
          <div class="left-panel">
            <div class="left-inner">

              <!-- Logo -->
              <div class="logo-block" :class="{ 'is-in': show.logo }">
                <img src="@/assets/images/selldesk-logo.png" alt="SellDesk" class="logo-img" />
              </div>

              <!-- Tagline -->
              <p class="tagline" :class="{ 'is-in': show.tagline }">
                Invoice smarter.<br />Get paid faster.
              </p>

              <!-- Login button -->
              <button
                class="login-btn"
                :class="{ 'is-in': show.button, 'is-shake': shake }"
                @click="doLogin"
                :disabled="loading"
              >
                <span v-if="loading" class="btn-spinner"></span>
                <span v-else>Click to Login</span>
              </button>

              <p class="status-msg" :class="{ 'is-in': loading }">
                {{ statusText }}
              </p>

              <transition name="err-pop">
                <p v-if="error" class="err-msg">
                  {{ error }}
                  <button class="retry-link" @click="doLogin">Try again</button>
                </p>
              </transition>
            </div>
          </div>

          <!-- RIGHT PANEL -->
          <div class="right-panel">
            <div class="grad-orb-inner orb-a"></div>
            <div class="grad-orb-inner orb-b"></div>
            <div class="grad-orb-inner orb-c"></div>
            <div class="right-content">
              <div class="feature-pills" :class="{ 'is-in': show.pills }">
                <span class="pill" style="--d:0s">Instant Invoices</span>
                <span class="pill" style="--d:0.12s">Payment Tracking</span>
                <span class="pill" style="--d:0.24s">Live Analytics</span>
              </div>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="login-footer" :class="{ 'is-in': show.footer }">
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
import { onMounted, reactive, ref } from "vue";
import { login } from "@/auth/keycloak";

const loading = ref(false);
const error = ref("");
const shake = ref(false);
const statusText = ref("Connecting to secure login…");

const show = reactive({
  card: false,
  logo: false,
  tagline: false,
  button: false,
  pills: false,
  footer: false,
});

onMounted(() => {
  // Staggered entrance, same rhythm as the splash screen
  setTimeout(() => (show.card = true), 60);
  setTimeout(() => (show.logo = true), 200);
  setTimeout(() => (show.tagline = true), 420);
  setTimeout(() => (show.button = true), 600);
  setTimeout(() => (show.pills = true), 500);
  setTimeout(() => (show.footer = true), 700);
});

async function doLogin() {
  if (loading.value) return;
  loading.value = true;
  error.value = "";

  try {
    await login("/invoices");
  } catch (e) {
    error.value = "Login failed — please try again.";
    loading.value = false;
    shake.value = true;
    setTimeout(() => (shake.value = false), 500);
  }
}
</script>

<style scoped>
.login-content {
  --background: #f0f2fa;
}

.login-root {
  min-height: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  background: linear-gradient(160deg, #f7fbff 0%, #f0f2fa 55%, #eef7f0 100%);
  padding: 20px;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ── Background gradient orbs ─────────────────────────────── */
.grad-orb {
  position: absolute;
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.45;
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
  top: 60%; left: 80%;
  transform: translate(-50%, -50%);
  animation-duration: 8s;
}
@keyframes drift {
  from { transform: translate(0, 0) scale(1); }
  to   { transform: translate(16px, -20px) scale(1.08); }
}

/* ── CARD ──────────────────────────────────────────────────── */
.login-card {
  position: relative;
  z-index: 1;
  display: flex;
  width: 100%;
  max-width: 860px;
  min-height: 420px;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(90, 111, 255, 0.12), 0 4px 16px rgba(0,0,0,0.06);
  background: white;
  opacity: 0;
  transform: translateY(24px) scale(0.98);
  transition: opacity 0.6s cubic-bezier(.2,.8,.2,1), transform 0.6s cubic-bezier(.2,.8,.2,1);
}
.login-card.is-in {
  opacity: 1;
  transform: translateY(0) scale(1);
}

/* ── LEFT PANEL ────────────────────────────────────────────── */
.left-panel {
  flex: 0 0 340px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 44px;
  background: white;
}

.left-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  width: 100%;
}

/* Logo */
.logo-block {
  margin-bottom: 6px;
  opacity: 0;
  transform: scale(0.75) translateY(8px);
  transition: opacity 0.55s cubic-bezier(.2,.8,.2,1), transform 0.55s cubic-bezier(.2,.8,.2,1);
}
.logo-block.is-in { opacity: 1; transform: scale(1) translateY(0); }

.logo-img {
  width: 180px;
  height: auto;
  display: block;
}

/* Tagline */
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

/* Button */
.login-btn {
  background: #4b9fd5;
  color: white;
  border: none;
  border-radius: 50px;
  padding: 13px 32px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  cursor: pointer;
  align-self: center;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s, opacity 0.5s ease;
  box-shadow: 0 4px 14px rgba(75, 159, 213, 0.35);
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 160px;
  justify-content: center;
  opacity: 0;
  transform: translateY(10px);
}
.login-btn.is-in { opacity: 1; transform: translateY(0); }
.login-btn:hover:not(:disabled) {
  background: #3a8ec4;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(75, 159, 213, 0.45);
}
.login-btn:active:not(:disabled) { transform: translateY(0); }
.login-btn:disabled { opacity: 0.85; cursor: not-allowed; }

.login-btn.is-shake { animation: shake 0.5s ease; }
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  20%      { transform: translateX(-6px); }
  40%      { transform: translateX(5px); }
  60%      { transform: translateX(-4px); }
  80%      { transform: translateX(3px); }
}

.btn-spinner {
  width: 16px; height: 16px;
  border: 2px solid rgba(255,255,255,0.4);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  display: inline-block;
}
@keyframes spin { to { transform: rotate(360deg); } }

/* Status text while logging in */
.status-msg {
  font-size: 11px;
  color: #a8a8bc;
  margin-top: 10px;
  height: 0;
  opacity: 0;
  overflow: hidden;
  transition: opacity 0.3s ease, height 0.3s ease, margin 0.3s ease;
}
.status-msg.is-in {
  opacity: 1;
  height: 14px;
  margin-top: 10px;
}

/* Error */
.err-msg {
  font-size: 11px;
  color: #e05252;
  margin-top: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}
.retry-link {
  background: none;
  border: none;
  color: #4b9fd5;
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  padding: 0;
  text-decoration: underline;
}
.err-pop-enter-active { transition: opacity 0.3s ease, transform 0.3s ease; }
.err-pop-enter-from { opacity: 0; transform: translateY(-4px); }

/* ── RIGHT PANEL ──────────────────────────────────────────── */
.right-panel {
  flex: 1;
  position: relative;
  overflow: hidden;
  background: linear-gradient(135deg, #e8f4fd 0%, #d6eaf8 40%, #e8f5e9 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}

.grad-orb-inner {
  position: absolute;
  border-radius: 50%;
  filter: blur(40px);
  opacity: 0.55;
  animation: drift 8s ease-in-out infinite alternate;
}
.orb-a {
  width: 260px; height: 260px;
  background: radial-gradient(circle, #a8d8f0, transparent);
  top: -60px; right: -40px;
  animation-duration: 9s;
}
.orb-b {
  width: 200px; height: 200px;
  background: radial-gradient(circle, #b8e8c8, transparent);
  bottom: -40px; left: 20px;
  animation-duration: 11s;
}
.orb-c {
  width: 140px; height: 140px;
  background: radial-gradient(circle, #c8d8f8, transparent);
  top: 50%; left: 50%;
  transform: translate(-50%, -50%);
  animation-duration: 7s;
}

.right-content {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.feature-pills {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}
.pill {
  background: rgba(255,255,255,0.75);
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

/* ── FOOTER ───────────────────────────────────────────────── */
.login-footer {
  position: relative;
  z-index: 1;
  margin-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 0.5s ease, transform 0.5s ease;
}
.login-footer.is-in { opacity: 1; transform: translateY(0); }

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

/* ── RESPONSIVE ───────────────────────────────────────────── */
@media (max-width: 640px) {
  .login-card { flex-direction: column; min-height: unset; }
  .left-panel { flex: none; padding: 36px 28px 24px; }
  .right-panel { min-height: 180px; }
  .login-btn { align-self: stretch; }
  .login-footer { font-size: 10px; }
}
</style>