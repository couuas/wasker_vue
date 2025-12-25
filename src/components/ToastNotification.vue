<script setup>
import { ref } from 'vue';

const isVisible = ref(false);
const message = ref('');
const type = ref('success'); // 'success' or 'error'

const show = (msg, msgType = 'success') => {
    message.value = msg;
    type.value = msgType;
    isVisible.value = true;

    // Auto hide after 5 seconds
    setTimeout(() => {
        isVisible.value = false;
    }, 5000);
};

const close = () => {
    isVisible.value = false;
};

defineExpose({ show });
</script>

<template>
    <Transition name="toast">
        <div v-if="isVisible" class="mil-toast" :class="type">
            <div class="mil-toast-icon">
                <i v-if="type === 'success'" class="fal fa-check-circle"></i>
                <i v-else class="fal fa-exclamation-circle"></i>
            </div>
            <div class="mil-toast-content">
                <div class="mil-toast-title">{{ type === 'success' ? 'Success' : 'Error' }}</div>
                <div class="mil-toast-message" v-html="message"></div>
            </div>
            <div class="mil-toast-close" @click="close">
                <i class="fal fa-times"></i>
            </div>
        </div>
    </Transition>
</template>

<style scoped>
.mil-toast {
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #1e1e24; /* Dark background matching the theme */
    padding: 20px 25px;
    border-radius: 12px;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: flex-start;
    gap: 15px;
    z-index: 9999;
    max-width: 400px;
    border: 1px solid rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
}

.mil-toast.success {
    border-left: 4px solid #55e6a5; /* Theme accent color */
}

.mil-toast.error {
    border-left: 4px solid #ff4d4d;
}

.mil-toast-icon {
    font-size: 24px;
    margin-top: -2px;
}

.mil-toast.success .mil-toast-icon {
    color: #55e6a5;
}

.mil-toast.error .mil-toast-icon {
    color: #ff4d4d;
}

.mil-toast-content {
    flex: 1;
}

.mil-toast-title {
    font-weight: 700;
    color: #fff;
    margin-bottom: 5px;
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.mil-toast-message {
    color: #a4a4b1;
    font-size: 14px;
    line-height: 1.5;
}

.mil-toast-close {
    cursor: pointer;
    color: #666;
    transition: 0.3s;
}

.mil-toast-close:hover {
    color: #fff;
}

/* Animations */
.toast-enter-active,
.toast-leave-active {
    transition: all 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55);
}

.toast-enter-from,
.toast-leave-to {
    opacity: 0;
    transform: translateX(100px) scale(0.9);
}

/* Mobile Responsive */
@media (max-width: 768px) {
    .mil-toast {
        bottom: 20px;
        left: 20px;
        right: 20px;
        max-width: none;
        padding: 15px 20px;
    }
    
    .toast-enter-from,
    .toast-leave-to {
        transform: translateY(20px) scale(0.9);
    }
}
</style>
