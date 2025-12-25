<script setup>
import { ref } from 'vue'
import ToastNotification from '../components/ToastNotification.vue'

const formData = ref({
  name: '',
  email: '',
  subject: '',
  message: '',
  consent: false
})

const isSending = ref(false)
const toast = ref(null)

const onSubmit = async () => {
    if (!formData.value.consent) {
        toast.value.show('Please consent to the processing of your personal data before sending.', 'error')
        return
    }

    const apiUrl = import.meta.env.VITE_API_URL

    if (!apiUrl || apiUrl.includes('your-worker-name')) {
        toast.value.show('System Configuration Error: API URL is missing.', 'error')
        return
    }

    isSending.value = true

    try {
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: formData.value.name,
                email: formData.value.email,
                subject: formData.value.subject,
                message: formData.value.message
            })
        })

        if (response.ok) {
            toast.value.show('Your message has been sent successfully! I will get back to you shortly.', 'success')
            formData.value = {
                name: '',
                email: '',
                subject: '',
                message: '',
                consent: false
            }
        } else {
            console.error('API Error:', await response.text())
            toast.value.show('Transmission failed. <br>Please email me directly at: <a href="mailto:couuas@gmail.com" style="color:#fff; text-decoration: underline;">couuas@gmail.com</a>', 'error')
        }
    } catch (error) {
        console.error('Network Error:', error)
        toast.value.show('Network error occurred. <br>Please try again or email: <a href="mailto:couuas@gmail.com" style="color:#fff; text-decoration: underline;">couuas@gmail.com</a>', 'error')
    } finally {
        isSending.value = false
    }
}
</script>

<template>
    <div class="mil-content-frame mil-contact-frame">
        <ToastNotification ref="toast" />
        <div class="mil-scroll mil-bp-fix-2 mil-half-1">
            <div class="mil-main-content">
                <div class="mil-banner">
                    <div class="mil-bg-frame">
                        <img src="/assets/img-dark/ui/banner2.jpg" alt="banner" class="mil-banner-bg mil-scale-img"
                            data-value-1="1" data-value-2="1.3">
                    </div>
                    <div class="mil-banner-overlay"></div>
                    <div class="mil-banner-content mil-type-2">
                        <div class="mil-link mil-mb-20">contact</div>
                        <h1>Get in touch</h1>
                        <p class="mil-light-soft mil-mb-40">Your message will be sent directly to my Telegram chat.</p>
                    </div>
                </div>
                <!-- ... rest of the form ... -->
                <div class="mil-space-90 mil-p-0-75">
                    <form @submit.prevent="onSubmit">
                        <div class="row mil-aic">
                            <div class="col-sm-6 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="text" placeholder="Your Name" name="name" v-model="formData.name" required>
                                    <i class="fal fa-user"></i>
                                </div>
                            </div>
                            <div class="col-sm-6 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="email" placeholder="Email" name="email" v-model="formData.email" required>
                                    <i class="fal fa-at"></i>
                                </div>
                            </div>
                            <div class="col-lg-12 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="text" placeholder="Subject" name="subject" v-model="formData.subject" required>
                                    <i class="fal fa-lightbulb"></i>
                                </div>
                            </div>
                            <div class="col-lg-12 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <textarea placeholder="Your message" name="message" v-model="formData.message" required></textarea>
                                    <i class="fal fa-user"></i>
                                </div>
                            </div>
                            <div class="col-12 col-sm-12 col-md-12 mil-mb-15">
                                <label class="custom-checkbox mil-up">
                                    <input type="checkbox" v-model="formData.consent">
                                    <span class="checkmark"></span>
                                    I consent to the processing of my personal data
                                </label>
                            </div>
                            <div class="col-lg-12 mil-mb-15 mil-up">
                                <button type="submit" class="mil-btn-sm" style="width: 100%; justify-content: center;" :disabled="isSending">{{ isSending ? 'Sending...' : 'Send' }}</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="mil-bottom-panel">
            <div class="mil-space-90">
                <div class="mil-jcb mil-w-100">
                    <a href="https://t.me/couuas" class="mil-icon-text" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        <div class="mil-link">+1 (919) 919 9996</div>
                    </a>
                    <a href="mailto:couuas@gmail.com" class="mil-icon-text" target="_blank">
                        <i class="fal fa-at"></i>
                        <div class="mil-link">couuas@gmail.com</div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
