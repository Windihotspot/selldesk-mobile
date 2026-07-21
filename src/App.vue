<template>
  <v-app>
    <ion-app>
      <ion-router-outlet />
    </ion-app>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { IonApp, IonRouterOutlet } from '@ionic/vue'

</script>

<style>
ion-content::part(scroll) {
  contain: none !important;
}
.custom-toast {
  position: fixed;
  top: 20px;
  left: 16px;
  right: 16px;
  z-index: 99999;

  display: flex;
  align-items: center;
  gap: 12px;

  padding: 16px 18px;
  border-radius: 12px;

  color: #fff;
  font-size: 15px;
  font-weight: 600;

  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

/* SUCCESS */
.custom-toast.success {
  background: #16a34a;
}

/* ERROR */
.custom-toast.error {
  background: #dc2626;
}

.toast-icon-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.toast-icon {
  font-size: 24px;
  color: #fff;
}

.toast-text {
  flex: 1;
}

.toast-message {
  color: #fff;
  font-size: 15px;
  font-weight: 300;
  line-height: 1.3;
}

.toast-close {
  display: none;
}

</style>