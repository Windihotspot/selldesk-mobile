<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="signin-wrapper">
        <div class="ion-margin-bottom">
          <h1 class="welcome-title">Welcome Back!</h1>
          <p class="welcome-subtitle">Log into your Selldesk account with your credentials</p>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmitLogin">
          <label class="field-label">Email</label>
          <v-text-field
            v-model="email"
            placeholder="Enter your email address.."
            type="email"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            autocomplete="off"
            :rules="emailRules"
            class="custom-field"
          />

          <label class="field-label">Password</label>
          <v-text-field
            v-model="password"
            placeholder="Enter your password.."
            :type="showPassword ? 'text' : 'password'"
            variant="outlined"
            density="comfortable"
            rounded="lg"
            autocomplete="off"
            :rules="passwordRules"
            class="custom-field"
          >
            <template #append-inner>
              <ion-icon
                :icon="showPassword ? eyeOffOutline : eyeOutline"
                class="toggle-icon"
                @click="showPassword = !showPassword"
              />
            </template>
          </v-text-field>

          <div class="ion-text-end forgot-link">
            <router-link to="/password-reset">Forgot password?</router-link>
          </div>

          <v-btn
            block
            type="submit"
            size="large"
            rounded="pill"
            class="signin-btn"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Sign In
          </v-btn>
        </v-form>

        <div class="signup-row">
          Don't have any account?
          <router-link to="/sign-up" class="signup-link">Sign Up</router-link>
        </div>
      </div>

      <ion-toast
        :is-open="showToast"
        :message="toastMessage"
        :color="toastColor"
        :duration="2500"
        @didDismiss="showToast = false"
      />
    </ion-content>
  </ion-page>
</template>

<script lang="ts" setup>
import { ref } from "vue";
import { IonPage, IonContent, IonToast, IonIcon } from "@ionic/vue";
import { eyeOutline, eyeOffOutline } from "ionicons/icons";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const store = useAuthStore();
const router = useRouter();

const formRef = ref();
const isFormValid = ref(false);

const email = ref("");
const password = ref("");
const showPassword = ref(false);

const isSubmitting = ref(false);
const showToast = ref(false);
const toastMessage = ref("");
const toastColor = ref("danger");

const emailRules = [
  (v: string) => !!v || "Email is required",
  (v: string) => /.+@.+\..+/.test(v) || "Enter a valid email",
];

const passwordRules = [
  (v: string) => !!v || "Password is required",
  (v: string) => (v && v.length >= 4) || "Password must be at least 4 characters",
];

async function onSubmitLogin() {
  const { valid } = await formRef.value.validate();
  if (!valid) return;
  isSubmitting.value = true;
  const payload = {
    email: email.value,
    password: password.value,
  };

  console.log("login payload:", payload);
  const success = await store.emailLogin(payload);
  isSubmitting.value = false;

  if (success) {
    toastMessage.value = "You have successfully logged in!";
    toastColor.value = "success";
    showToast.value = true;
    router.replace({ name: "dashboard" });
  } else {
    const errs = Object.values(store.errors);
    toastMessage.value =
      (errs[0] as string) || "Login failed, please try again.";
    toastColor.value = "danger";
    showToast.value = true;
  }
}
</script>

<style scoped>
.signin-wrapper {
  max-width: 420px;
  margin: 0 auto;
  padding-top: 6vh;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 4px;
}

.welcome-subtitle {
  font-size: 0.85rem;
  color: #6b6b6b;
  margin-bottom: 20px;
}

.field-label {
  display: block;
  font-size: 0.85rem;
  font-weight: 500;
  margin-bottom: 6px;
  margin-top: 4px;
}

.custom-field {
  margin-bottom: 4px;
}

.custom-field :deep(.v-field) {
  background-color: #f6f6f8;
}


.toggle-icon {
  font-size: 1.2rem;
  color: #9a9a9a;
  cursor: pointer;
}

.forgot-link {
  margin-bottom: 20px;
  font-size: 0.85rem;
}

.forgot-link a {
  color: #7c6ff0;
  text-decoration: none;
  font-weight: 500;
}

.signin-btn {
  background-color: #7c6ff0 !important;
  color: #fff !important;
  text-transform: none;
  font-weight: 600;
  font-size: 1rem;
  letter-spacing: 0;
}

.signup-row {
  text-align: center;
  margin-top: 28px;
  font-size: 0.85rem;
  color: #444;
}

.signup-link {
  color: #7c6ff0;
  font-weight: 600;
  text-decoration: none;
  margin-left: 4px;
}
</style>