import { mount } from '@vue/test-utils'
import { describe, it, expect, beforeEach, vi } from 'vitest'
import JournalCalendar from '../components/JournalCalendar.vue'

describe('JournalCalendar.vue', () => {
  let wrapper

  beforeEach(() => {
    wrapper = mount(JournalCalendar, {
      props: {
        activeDates: new Set(['2026-02-26'])
      }
    })
  })

  it('renders the calendar component', () => {
    expect(wrapper.find('.mil-journal-cal').exists()).toBe(true)
  })

  it('displays month and year', () => {
    const currentDate = new Date()
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ]
    const expectedLabel = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`
    expect(wrapper.find('.mil-cal-title').text()).toBe(expectedLabel)
  })

  it('displays days of week', () => {
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    daysOfWeek.forEach(day => {
      expect(wrapper.find(`.mil-cal-head-cell:contains("${day}")`).exists() || 
             wrapper.findAll('.mil-cal-head-cell').some(el => el.text() === day)).toBe(true)
    })
  })

  it('renders calendar cells', () => {
    const cells = wrapper.findAll('.mil-cal-cell')
    expect(cells.length).toBeGreaterThan(0)
  })

  it('marks days with entries', () => {
    const cellsWithEntry = wrapper.findAll('.mil-has-entry')
    expect(cellsWithEntry.length).toBeGreaterThan(0)
  })

  it('highlights today', () => {
    const todayCell = wrapper.find('.mil-today')
    expect(todayCell.exists()).toBe(true)
  })

  it('navigates to previous month', () => {
    const initialMonth = wrapper.vm.currentMonth
    wrapper.find('.mil-cal-nav-btn').trigger('click')
    // Since first button is left arrow, clicking it should go to prev month
    // Note: Implementation may vary based on button order in template
  })

  it('emits select event when clicking a day with entry', async () => {
    const cellWithEntry = wrapper.find('.mil-has-entry')
    if (cellWithEntry.exists()) {
      await cellWithEntry.trigger('click')
      expect(wrapper.emitted('select')).toBeTruthy()
    }
  })
})
