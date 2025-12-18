<script setup>
import { onMounted, onUnmounted, ref, watch, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useMarkdown } from '@/composables/useMarkdown'

const typingElement = ref(null)
const { getProfile } = useMarkdown()
const profile = getProfile() // Returns a computed ref

const typeSpeed = 70
const backSpeed = 20
const backDelay = 1500

let timeoutId = null

function typeText(element, strings) {
    if (!strings || !strings.length) return;

    let currentStringIndex = 0
    let currentCharIndex = 0
    let isDeleting = false

    const loop = () => {
         if (!element) return;
         
         const currentString = strings[currentStringIndex]
         
         if (isDeleting) {
             currentCharIndex--
         } else {
             currentCharIndex++
         }
         
         element.textContent = currentString.substring(0, currentCharIndex)
         
         let nextDelay = typeSpeed
         if (isDeleting) nextDelay = backSpeed
         
         if (!isDeleting && currentCharIndex === currentString.length) {
             nextDelay = backDelay
             isDeleting = true
         } else if (isDeleting && currentCharIndex === 0) {
             isDeleting = false
             currentStringIndex = (currentStringIndex + 1) % strings.length
             nextDelay = 500
         }
         
         timeoutId = setTimeout(loop, nextDelay)
    }
    loop()
}

// Start typing when both profile and element are ready
const startTyping = () => {
    if (profile.value && profile.value.roles && typingElement.value) {
        if (timeoutId) clearTimeout(timeoutId);
        typeText(typingElement.value, profile.value.roles);
    }
}

// Watch for changes (Data loaded or HMR)
watch(() => profile.value, startTyping);

// Also start on mount (Component render)
onMounted(() => {
    startTyping();

    // Init Swiper (Keep existing swiper logic if it was there, though I might have overwritten it, let's check)
})

onUnmounted(() => {
    if (timeoutId) clearTimeout(timeoutId)
})
</script>

<template>
  <div class="mil-content-frame mil-cloned">
    <div class="mil-scroll mil-half-2">
      <div class="mil-main-content">
        <div class="mil-banner" v-if="profile">
          <div class="mil-bg-frame">
            <img :src="profile.banner" alt="banner" class="mil-banner-bg mil-scale-img" data-value-1="1"
              data-value-2="1.3">
          </div>
          <div class="mil-banner-overlay"></div>
          <div class="mil-banner-content">
            <div class="mil-avatar mil-mb-30">
              <img :src="profile.avatar" alt="avatar">
            </div>
            <h1 class="mil-mb-15">{{ profile.name }}</h1>
            <div class="mil-link">I'm a <span class="mil-typing" ref="typingElement"></span></div>
          </div>
        </div>
        <div class="mil-space-90 mil-p-0-75" v-if="profile">
          <div class="mil-title-line mil-mb-60 mil-up">
            <h2>Services</h2>
            <div class="mil-line"></div>
            <div class="mil-h2 mil-number">01</div>
          </div>
          <div class="row mil-mb-75">
            <div class="col-xs-12 col-sm-6 mil-mb-15" v-for="(service, index) in profile.services" :key="index">
              <div class="mil-service-card mil-up">
                <h3 class="mil-mb-20"><span class="mil-accent">{{ String(index + 1).padStart(2, '0') }}.</span> {{ service.title }}
                </h3>
                <p class="mil-mb-20-plus">{{ service.description }}</p>
                <router-link :to="service.link" class="mil-link mil-hover-link">Order
                  service</router-link>
              </div>
            </div>
          </div>
          <div class="mil-title-line mil-mb-60 mil-up">
            <h2>Language</h2>
            <div class="mil-line"></div>
            <div class="mil-h2 mil-number">02</div>
          </div>
          <div class="row mil-mb-60">
            <div class="col-xs-12 col-sm-6 mil-mb-30" v-for="(lang, index) in profile.languages" :key="index">
              <div class="mil-skill-item mil-up">
                <div class="mil-top">
                  <span class="mil-link">{{ lang.name }}</span>
                  <span>{{ lang.level }}</span>
                </div>
                <div class="mil-progress">
                  <div class="mil-progress-prog mil-add-class" :style="{ width: lang.percent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>
          <div class="mil-title-line mil-mb-60 mil-up">
            <h2>Skills</h2>
            <div class="mil-line"></div>
            <div class="mil-h2 mil-number">03</div>
          </div>
          <div class="row mil-mb-60">
             <div class="col-xs-12 col-sm-6 mil-mb-30" v-for="(skill, index) in profile.skills" :key="index">
              <div class="mil-skill-item mil-up">
                <div class="mil-top">
                  <span class="mil-link">{{ skill.name }}</span>
                  <span>{{ skill.percent }}%</span>
                </div>
                <div class="mil-progress">
                  <div class="mil-progress-prog mil-add-class" :style="{ width: skill.percent + '%' }"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="mil-title-line mil-mb-60 mil-up">
              <h2>Education</h2>
              <div class="mil-line"></div>
              <div class="mil-h2 mil-number">04</div>
          </div>
          <ul class="mil-timeline mil-mb-75">
              <li class="mil-mb-15 mil-up" v-for="(edu, index) in profile.education" :key="index">
                  <div class="mil-timeline-card">
                      <div class="mil-left">
                          <h3 class="mil-line-height mil-mb-20"><span
                                  class="mil-accent">{{ String(index + 1).padStart(2, '0') }}.</span> {{ edu.title }}</h3>
                          <div class="mil-badge mil-dark mil-mb-20-plus">{{ edu.year }}</div>
                          <a v-if="edu.certificate" :href="edu.certificate"
                               class="mil-link mil-hover-link" data-fancybox="certificate"
                               data-no-swup>Certificate</a>
                      </div>
                      <div class="mil-right">
                          <p class="">{{ edu.description }}</p>
                      </div>
                  </div>
              </li>
          </ul>
          <div class="mil-title-line mil-mb-60 mil-up">
              <h2>Work</h2>
              <div class="mil-line"></div>
              <div class="mil-h2 mil-number">05</div>
          </div>
          <ul class="mil-timeline mil-mb-75">
              <li class="mil-mb-15 mil-up" v-for="(job, index) in profile.work" :key="index">
                  <div class="mil-timeline-card">
                      <div class="mil-left">
                          <h3 class="mil-line-height mil-mb-20"><span
                                  class="mil-accent">{{ String(index + 1).padStart(2, '0') }}.</span> {{ job.title }}</h3>
                          <div class="mil-badge mil-dark mil-mb-20-plus">{{ job.year }}</div>
                      </div>
                      <div class="mil-right">
                          <p class="">{{ job.description }}</p>
                      </div>
                  </div>
              </li>
          </ul>
          <div class="mil-divider mil-mb-60 mil-up"></div>
          <div class="mil-mb-30 mil-up" v-html="profile.body"></div>
          <ul class="mil-social mil-up">
            <li v-for="(social, index) in profile.social" :key="index">
                <a :href="social.link" target="_blank"><i :class="social.icon"></i></a>
            </li>
          </ul>
        </div>
      </div>
      <footer>
        <div class="mil-space-90 mil-jcb" v-if="profile && profile.footer">
          <p>{{ profile.footer.copyright }}</p>
          <p>Design by: <a :href="profile.footer.designer_url" class="mil-text-link" target="_blank">{{ profile.footer.designer }}</a></p>
        </div>
      </footer>
    </div>
  </div>
</template>

<style scoped>
/* Any component specific overrides */
</style>
