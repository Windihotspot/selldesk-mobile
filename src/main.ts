import '@/scss/style.scss'

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import { IonicVue } from '@ionic/vue'
import App from './App.vue'
import router from './router'
import vuetify from './plugins/vuetify' 
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import './assets/fonts.css'
import ApiService from "@/services/ApiService";

import '@ionic/vue/css/core.css'
import '@ionic/vue/css/normalize.css'
import '@ionic/vue/css/structure.css'
import '@ionic/vue/css/typography.css'
import '@ionic/vue/css/padding.css'
import '@ionic/vue/css/float-elements.css'
import '@ionic/vue/css/text-alignment.css'
import '@ionic/vue/css/text-transformation.css'
import '@ionic/vue/css/flex-utils.css'
import '@ionic/vue/css/display.css'

const app = createApp(App)
const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

app.use(pinia)
app.use(IonicVue, { mode: 'ios', animated: true, rippleEffect: false })
app.use(router)
app.use(vuetify)   
app.use(ElementPlus)  
ApiService.init(app);

router.isReady().then(() => app.mount('#app'))
