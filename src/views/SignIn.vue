<template>
  <ion-page>
    <ion-content :fullscreen="true" :scroll-y="true">
      <div class="auth-screen">

        <!-- HERO -->
        <div class="auth-hero" ref="heroRef">
          <div class="auth-logo-mark hero-anim">
            <ion-icon :icon="checkmarkCircleOutline" style="font-size:24px; color:#fff" />
          </div>
          <h1 class="hero-anim">Welcome Back!</h1>
          <p class="hero-anim">Log into your Selldesk account with your credentials</p>
        </div>

        <!-- CARD -->
        <div class="auth-card" ref="cardRef">
          <h2 class="section-title card-anim">Sign In</h2>
          <p class="section-sub card-anim">Enter your credentials to continue</p>

          <!-- ERROR BANNER -->
          <div v-if="error" class="error-banner">
            <ion-icon :icon="alertCircleOutline" style="font-size:16px; flex-shrink:0;" />
            {{ error }}
          </div>

          <!-- EMAIL -->
          <div class="card-anim field-group">
            <label class="field-label">Email</label>
            <v-text-field
              v-model="form.email"
              variant="solo"
              flat
              color="blue"
              type="email"
              placeholder="Enter your email address.."
              :error-messages="form.email && !isEmailValid ? 'Enter a valid email address' : ''"
              autocomplete="email"
              class="carbon-field"
              hide-details="auto"
            />
          </div>

          <!-- PASSWORD -->
          <div class="card-anim field-group mt-3">
            <label class="field-label">Password</label>
            <v-text-field
              v-model="form.password"
              variant="solo"
              flat
              color="blue"
              :type="showPw ? 'text' : 'password'"
              placeholder="Enter your password.."
              class="carbon-field"
              hide-details="auto"
            >
              <template #append-inner>
                <ion-icon
                  :icon="showPw ? eyeOffOutline : eyeOutline"
                  class="eye-icon"
                  @click="showPw = !showPw"
                />
              </template>
            </v-text-field>
          </div>

          <!-- FORGOT PASSWORD -->
          <div class="forgot-row card-anim">
            <router-link class="forgot-link" to="">Forgot password?</router-link>
          </div>

          <!-- SIGN IN BUTTON -->
          <button
            class="btn-grad card-anim"
            :class="{ disabled: isSubmitting || !isFormValid }"
            :disabled="isSubmitting || !isFormValid"
            @click="handleSignIn"
          >
            <span v-if="isSubmitting" class="btn-inner">
              <span class="spinner" />
              Signing in...
            </span>
            <span v-else class="btn-inner">
              Sign In
              <ion-icon :icon="arrowForwardOutline" style="font-size:16px" />
            </span>
          </button>

          <!-- DIVIDER -->
          <div class="divider card-anim">
            <div class="divider-line" />
            <span class="divider-text">OR</span>
            <div class="divider-line" />
          </div>

          <!-- FOOTER -->
          <p class="auth-switch card-anim">
            Don't have any account?
            <router-link to="">Sign Up with Quidly</router-link>
          </p>
        </div>

      </div>
    </ion-content>

    <ion-toast
      :is-open="showToast"
      :message="toastMessage"
      :color="toastColor"
      :duration="2500"
      @didDismiss="showToast = false"
    />
  </ion-page>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { IonPage, IonContent, IonIcon, IonToast } from '@ionic/vue'
import {
  checkmarkCircleOutline,
  eyeOutline,
  eyeOffOutline,
  arrowForwardOutline,
  alertCircleOutline,
} from 'ionicons/icons'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import gsap from 'gsap'

const router = useRouter()
const authStore = useAuthStore()

// ─── Refs ─────────────────────────────────────────────────────
const heroRef = ref<HTMLElement | null>(null)
const cardRef = ref<HTMLElement | null>(null)

// ─── State ────────────────────────────────────────────────────
const showPw = ref(false)
const error = ref('')
const form = ref({ email: '', password: '' })

const isSubmitting = ref(false)
const showToast = ref(false)
const toastMessage = ref('')
const toastColor = ref('danger')

// ─── Validation ───────────────────────────────────────────────
const isEmailValid = computed(() =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.value.email)
)
const isPasswordValid = computed(() =>
  form.value.password.length >= 4
)
const isFormValid = computed(() =>
  form.value.email && form.value.password && isEmailValid.value && isPasswordValid.value
)

watch([() => form.value.email, () => form.value.password], () => {
  error.value = ''
})

// ─── GSAP entrance animation ──────────────────────────────────
onMounted(() => {
  const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

  // 1. Hero items stagger down from above
  tl.fromTo(
    '.hero-anim',
    { y: -24, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55, stagger: 0.12 }
  )

  // 2. Card slides up from below
  .fromTo(
    cardRef.value,
    { y: 60, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.55 },
    '-=0.25'
  )

  // 3. Card internals stagger in
  .fromTo(
    '.card-anim',
    { y: 18, opacity: 0 },
    { y: 0, opacity: 1, duration: 0.4, stagger: 0.07 },
    '-=0.3'
  )
})

// ─── Sign in ──────────────────────────────────────────────────
const handleSignIn = async () => {
  error.value = ''

  if (!isFormValid.value) {
    error.value = 'Please enter a valid email and password'
    return
  }

  isSubmitting.value = true

  const payload = {
    email: form.value.email,
    password: form.value.password,
  }

  const success = await authStore.emailLogin(payload)
  isSubmitting.value = false

  if (success) {
    toastMessage.value = 'You have successfully logged in!'
    toastColor.value = 'success'
    showToast.value = true
    router.replace({ name: 'Dashboard' })
    return
  }

  const errs = Object.values(authStore.errors || {})
  const message = (errs[0] as string) || 'Invalid email or password'
  error.value = message
  toastMessage.value = message
  toastColor.value = 'danger'
  showToast.value = true
}
</script>

<style scoped lang="scss">
/* ── Selldesk brand gradient ──────────────────────────────
   Built from the Selldesk primary blue (#4b9fd5), deepened
   at one end and lifted toward a cool cyan at the other so
   it reads as a single deliberate brand gradient rather than
   a plain flat fill. */
.auth-hero,
.btn-grad {
  --sd-grad: linear-gradient(135deg, #5a6fff, #7d8aff);
}

/* ── Carbon-style field labels & inputs ──────────────────── */
.field-group {
  margin-bottom: 4px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 600;
  color: #17324a;
  margin-bottom: 8px;
}

.carbon-field {
  :deep(.v-field) {
    background-color: #eaf3fa; // light blue fill
    border-radius: 10px;
    box-shadow: none !important;
  }

  :deep(.v-field__overlay) {
    background-color: transparent;
  }

  :deep(.v-field__input) {
    padding-top: 14px;
    padding-bottom: 14px;
    min-height: 52px;
    font-size: 0.9rem;
    color: #17324a;
  }

  :deep(input::placeholder) {
    color: #9db8cb;
    opacity: 1;
  }

  :deep(.v-field--focused) {
    .v-field__overlay {
      background-color: transparent;
    }
  }

  :deep(.v-field__outline) {
    display: none;
  }
}

.auth-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* ── Hero ─────────────────────────────────────────────── */
.auth-hero {
  padding: 60px 28px 32px;
  position: relative;
  overflow: hidden;
  background: var(--sd-grad);

  h1 {
    font-size: 1.8rem; font-weight: 800; color: white;
    letter-spacing: -0.03em; margin-bottom: 8px;
    position: relative; z-index: 1;
  }
  p {
    font-size: 0.85rem; color: rgba(255,255,255,.7);
    line-height: 1.6; position: relative; z-index: 1;
  }
}

.auth-logo-mark {
  width: 48px; height: 48px; border-radius: 15px;
  background: rgba(255,255,255,.15);
  border: 1.5px solid rgba(255,255,255,.25);
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 20px; position: relative; z-index: 1;
}

/* ── Card ─────────────────────────────────────────────── */
.auth-card {
  background: white;
  border-radius: 28px 28px 0 0;
  flex: 1;
  padding: 32px 24px 48px;
  margin-top: -24px;
  position: relative;
  z-index: 10;
}

.section-title {
  font-size: 1.2rem; font-weight: 800;
  color: #17324a; margin-bottom: 4px;
}
.section-sub {
  font-size: 0.83rem; color: #5d7a90;
  margin-bottom: 24px; line-height: 1.5;
}

/* ── Error banner ─────────────────────────────────────── */
.error-banner {
  display: flex; align-items: center; gap: 8px;
  font-size: 13px; color: #b91c1c;
  background: #fef2f2; border: 1px solid #fecaca;
  border-radius: 8px; padding: 10px 12px;
  margin-bottom: 16px; line-height: 1.4;
}

/* ── Vuetify overrides ────────────────────────────────── */
:deep(.v-field__outline) {
  --v-field-border-color: #bcd6e8;
}
:deep(.v-label) {
  color: #5d7a90 !important;
}
:deep(.v-field--focused .v-label) {
  color: #2b7cb8 !important;
}

.mt-3 { margin-top: 12px; }

/* ── Eye icon ─────────────────────────────────────────── */
.eye-icon {
  font-size: 18px; color: #5d7a90; cursor: pointer;
  &:hover { color: #2b7cb8; }
}

/* ── Forgot ───────────────────────────────────────────── */
.forgot-row {
  text-align: right; margin: 8px 0 20px;
}
.forgot-link {
  font-size: 0.8rem; color: #5a6fff;
  font-weight: 600; cursor: pointer;
  text-decoration: none;
  &:hover { text-decoration: underline; }
}

/* ── Buttons ──────────────────────────────────────────── */
.btn-grad {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: var(--sd-grad);
  color: white;
  font-size: 14px;
  font-weight: 700;
  box-shadow: 0 8px 28px rgba(43,124,184,.3);
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
    box-shadow: none;
  }
}
.btn-grad.disabled {
  opacity: 0.4 !important;
  box-shadow: none !important;
  cursor: not-allowed !important;
}

.btn-inner { display: flex; align-items: center; gap: 8px; }

/* ── Spinner ──────────────────────────────────────────── */
.spinner {
  width: 16px; height: 16px; border-radius: 50%;
  border: 2px solid rgba(255,255,255,.35);
  border-top-color: white;
  animation: spin 0.7s linear infinite;
  flex-shrink: 0;
}
@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ── Divider ──────────────────────────────────────────── */
.divider {
  display: flex; align-items: center; gap: 12px;
  margin: 20px 0;
}
.divider-line { flex: 1; height: 1px; background: #e1ecf4; }
.divider-text { font-size: 12px; color: #5d7a90; }

/* ── Footer ───────────────────────────────────────────── */
.auth-switch {
  text-align: center; font-size: 0.83rem; color: #5d7a90; margin-top: 18px;
  a { color: #5a6fff; font-weight: 700; cursor: pointer; text-decoration: none;
    &:hover { text-decoration: underline; }
  }
}
</style>