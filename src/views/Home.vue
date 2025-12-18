<script setup>
import TheRightBar from '../components/TheRightBar.vue'
</script>

<template>
    <!-- On Home Page, the Left Content is just a placeholder for the cloned CV in original -->
    <!-- But in Vue, since we have the RightBar on the right (Desktop) or bottom (Mobile),
         the Left Content on Home Page acts as a "spacer" or effectively empty in full width mode? 
         
         Wait, index.html has:
         <div class="mil-left-part">
            <div class="transition-fade" id="swupMain">
                 <div class="mil-cv-clone-here"></div>
            </div>
         </div>
         
         The body.mil-fw-page likely expands the layout or specific elements.
         If we don't need to clone anything, maybe Home.vue can be empty or 
         just contain the "mil-cv-clone-here" div if CSS depends on it?
    -->
    <div class="transition-fade">
         <!-- This div might be needed for consistency or transition targets -->
           <TheRightBar />
    </div>
</template>
