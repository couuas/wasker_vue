<script setup>
const onSubmit = () => {
  alert('Thank you for your message! This is a demo form.')
}
</script>

<template>
    <div class="mil-content-frame mil-contact-frame">
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
                    </div>
                </div>
                <div class="mil-space-90 mil-p-0-75">
                    <form @submit.prevent="onSubmit">
                        <div class="row mil-aic">
                            <div class="col-sm-6 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="text" placeholder="Your Name" name="name">
                                    <i class="fal fa-user"></i>
                                </div>
                            </div>
                            <div class="col-sm-6 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="email" placeholder="Email" name="email">
                                    <i class="fal fa-at"></i>
                                </div>
                            </div>
                            <div class="col-lg-12 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <input type="text" placeholder="Subject" name="subject">
                                    <i class="fal fa-lightbulb"></i>
                                </div>
                            </div>
                            <div class="col-lg-12 mil-mb-15">
                                <div class="mil-input-frame mil-up">
                                    <textarea placeholder="Your message" name="message"></textarea>
                                    <i class="fal fa-user"></i>
                                </div>
                            </div>
                            <div class="col-12 col-sm-8 col-md-8 mil-mb-15">
                                <label class="custom-checkbox mil-up">
                                    <input type="checkbox">
                                    <span class="checkmark"></span>
                                    I consent to the processing of my personal data
                                </label>
                            </div>
                            <div class="col-12 col-sm-4 mil-mb-15 mil-jce mil-xs-jcs mil-up">
                                <button type="submit" class="mil-btn-sm">Send</button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        <div class="mil-bottom-panel">
            <div class="mil-space-90">
                <div class="mil-jcb mil-w-100">
                    <a href="#" class="mil-icon-text" target="_blank">
                        <i class="fab fa-whatsapp"></i>
                        <div class="mil-link">+38 (088) 133 XX 49</div>
                    </a>
                    <a href="mailto:archer@mail.com" class="mil-icon-text" target="_blank">
                        <i class="fal fa-at"></i>
                        <div class="mil-link">archer@mail.com</div>
                    </a>
                </div>
            </div>
        </div>
    </div>
</template>
