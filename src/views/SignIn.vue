<template>
  <ion-page>
    <ion-content class="ion-padding">
      <div class="signin-wrapper">
        <div class="ion-text-center ion-margin-bottom">
          <h1>Sign In</h1>
          <p>
            New here?
            <router-link to="/sign-up">Create an account</router-link>
          </p>
        </div>

        <v-form ref="formRef" v-model="isFormValid" @submit.prevent="onSubmitLogin">
          <v-text-field
            v-model="email"
            label="Email"
            type="email"
            variant="outlined"
            autocomplete="off"
            :rules="emailRules"
          />

          <v-text-field
            v-model="password"
            label="Password"
            type="password"
            variant="outlined"
            autocomplete="off"
            class="mt-2"
            :rules="passwordRules"
          />

          <div class="ion-text-end mb-2">
            <router-link to="/password-reset">Forgot password?</router-link>
          </div>

          <v-btn
            block
            type="submit"
            color="primary"
            size="large"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Continue
          </v-btn>
        </v-form>
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
import { IonPage, IonContent, IonToast } from "@ionic/vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const store = useAuthStore();
const router = useRouter();

const formRef = ref();
const isFormValid = ref(false);

const email = ref("");
const password = ref("");

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

  console.log("login payload:", payload)
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
  padding-top: 8vh;
}
.error-text {
  color: var(--ion-color-danger);
  font-size: 0.8rem;
  margin: 4px 0 0 12px;
}
</style>