<script setup>
import { ref, computed, watch } from 'vue'

const props = defineProps({
    activeDates: {
        type: Set,
        default: () => new Set()
    }
})

const emit = defineEmits(['select'])

const currentYear = ref(new Date().getFullYear())
const currentMonth = ref(new Date().getMonth())

const monthNames = ["January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
]

const displayedMonthLabel = computed(() => {
    return `${monthNames[currentMonth.value]} ${currentYear.value}`
})

const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

// Get today's date for highlight
const today = new Date()
const todayKey = computed(() => {
    return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`
})

// Calendar Logic
const daysInMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value + 1, 0).getDate()
})

const firstDayOfMonth = computed(() => {
    return new Date(currentYear.value, currentMonth.value, 1).getDay()
})

const calendarDays = computed(() => {
    const days = []
    
    // Fill empty slots for previous month
    for (let i = 0; i < firstDayOfMonth.value; i++) {
        days.push({ day: '', empty: true })
    }
    
    // Fill days
    for (let i = 1; i <= daysInMonth.value; i++) {
        // Format YYYY-MM-DD for matching
        // Note: Months are 0-indexed, so +1. Pad keys.
        const dateKey = `${currentYear.value}-${(currentMonth.value + 1).toString().padStart(2, '0')}-${i.toString().padStart(2, '0')}`
        const hasEntry = props.activeDates.has(dateKey)
        
        days.push({
            day: i,
            dateKey: dateKey,
            hasEntry: hasEntry,
            empty: false
        })
    }
    
    return days
})

const prevMonth = () => {
    if (currentMonth.value === 0) {
        currentMonth.value = 11
        currentYear.value--
    } else {
        currentMonth.value--
    }
}

const nextMonth = () => {
    if (currentMonth.value === 11) {
        currentMonth.value = 0
        currentYear.value++
    } else {
        currentMonth.value++
    }
}

const selectDate = (day) => {
    if (day.empty || !day.hasEntry) return
    emit('select', day.dateKey)
}

</script>

<template>
    <div class="mil-journal-cal">
        <div class="mil-cal-header">
            <div class="mil-cal-nav-btn" @click="prevMonth"><i class="fas fa-chevron-left"></i></div>
            <div class="mil-cal-title">{{ displayedMonthLabel }}</div>
            <div class="mil-cal-nav-btn" @click="nextMonth"><i class="fas fa-chevron-right"></i></div>
        </div>
        
        <div class="mil-cal-grid">
            <div class="mil-cal-head-cell" v-for="d in daysOfWeek" :key="d">{{ d }}</div>
            
            <div 
                v-for="(day, index) in calendarDays" 
                :key="index"
                class="mil-cal-cell"
                :class="{ 
                    'mil-empty': day.empty, 
                    'mil-has-entry': day.hasEntry,
                    'mil-today': day.dateKey === todayKey && !day.empty
                }"
                @click="selectDate(day)"
            >
                <span v-if="!day.empty">{{ day.day }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.mil-journal-cal {
    width: 100%;
    color: #fff;
}

.mil-cal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
}

.mil-cal-title {
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 1px;
}

.mil-cal-nav-btn {
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.mil-cal-nav-btn:hover {
    background: rgba(255, 255, 255, 0.1);
}

.mil-cal-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: 5px;
    text-align: center;
}

.mil-cal-head-cell {
    font-size: 12px;
    opacity: 0.5;
    margin-bottom: 10px;
}

.mil-cal-cell {
    aspect-ratio: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-size: 14px;
    position: relative;
    user-select: none;
}

.mil-cal-cell span {
    position: relative;
    z-index: 2;
}

.mil-has-entry {
    background: rgba(219, 169, 28, 0.2); /* Gold tint */
    color: #DBA91C;
    cursor: pointer;
    font-weight: 700;
    transition: all 0.3s ease;
}

.mil-has-entry:hover {
    background: #DBA91C;
    color: #000;
}

.mil-today {
    border: 2px solid rgba(255, 255, 255, 0.5);
    box-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.mil-today.mil-has-entry {
    border-color: #DBA91C;
    box-shadow: 0 0 10px rgba(219, 169, 28, 0.5);
}

/* Optional: marker dot */
/*
.mil-has-entry::after {
    content: '';
    position: absolute;
    bottom: 5px;
    width: 4px;
    height: 4px;
    background: currentColor;
    border-radius: 50%;
}
*/
</style>
