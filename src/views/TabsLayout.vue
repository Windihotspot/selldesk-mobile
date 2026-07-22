<template>
  <ion-page>
    <ion-tabs>
      <ion-router-outlet />
      <ion-tab-bar slot="bottom">
        <ion-tab-button tab="dashboard" href="/tabs/dashboard">
          <ion-icon :icon="activeTab === 'dashboard' ? home : homeOutline" />
          <ion-label>Home</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="repayments" href="/tabs/repayments">
          <ion-icon :icon="activeTab === 'repayments' ? receipt : receiptOutline" />
          <ion-label>Invoices</ion-label>
        </ion-tab-button>

        <!-- Center FAB -->
        <ion-tab-button tab="apply" @click.prevent="$router.push('/apply')" class="fab-tab">
          <div class="tab-center-fab">
            <ion-icon :icon="addOutline" />
          </div>
        </ion-tab-button>

        <ion-tab-button tab="history" href="/tabs/history">
          <ion-icon :icon="activeTab === 'history' ? wallet : walletOutline" />
          <ion-label>Payments</ion-label>
        </ion-tab-button>

        <ion-tab-button tab="profile" href="/tabs/profile">
          <ion-icon :icon="activeTab === 'profile' ? qrCode : qrCodeOutline" />
          <ion-label>Pay Wt Split</ion-label>
        </ion-tab-button>
      </ion-tab-bar>
    </ion-tabs>
  </ion-page>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import {
  IonPage, IonTabs, IonTabBar, IonTabButton, IonRouterOutlet, IonIcon, IonLabel
} from '@ionic/vue'
import {
  home, homeOutline,
  swapHorizontal, swapHorizontalOutline,
  addOutline,
  documentText, documentTextOutline,
  person, personOutline, receipt, wallet,qrCode,receiptOutline, walletOutline, qrCodeOutline
} from 'ionicons/icons'

const route = useRoute()
const activeTab = ref('dashboard')

watch(
  () => route.path,
  (path) => {
    if (path.includes('dashboard')) activeTab.value = 'dashboard'
    else if (path.includes('repayments')) activeTab.value = 'repayments'
    else if (path.includes('history')) activeTab.value = 'history'
    else if (path.includes('profile')) activeTab.value = 'profile'
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
ion-tab-bar {
  --background: #fff;
  height: 88px;
  padding-bottom: env(safe-area-inset-bottom);
  padding-top: 10px;
  overflow: visible;
  position: relative;
  border-top: 1px solid var(--cm-gray-100, #f1f1f1);
}

ion-tab-button {
  --color: var(--cm-text-muted, #9ca3af);
  --color-selected: #7283FF;
  flex-direction: column;
  gap: 4px;

  ion-icon {
    font-size: 26px;
    transition: transform 0.15s ease;
  }

  ion-label {
    font-size: 0.65rem;
    font-weight: 600;
    text-transform: none;
  }

  &.tab-selected {
    ion-icon {
      transform: translateY(-1px) scale(1.05);
    }
  }
}

.fab-tab {
  --padding-start: 0;
  --padding-end: 0;
  --ripple-color: transparent;
}

.tab-center-fab {
  width: 54px;
  height: 54px;
  border-radius: 50%;
  background: #7283FF;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: -28px;
  

  ion-icon {
    font-size: 28px;
    color: #fff;
  }
}
</style>