const wrapper = document.getElementById('presenceSelect')
const toggle = wrapper.querySelector('.select-toggle')
const optionsEl = wrapper.querySelector('.options')
const options = Array.from(wrapper.querySelectorAll('.options li'))
const hidden = document.getElementById('presenceTime')
const entryInput = document.getElementById('entryTime')
const calcBtn = document.getElementById('calculateBtn')
const result = document.getElementById('result')
const extraNote = document.getElementById('extraNote')
const entryWarning = document.getElementById('entryWarning')
const MAX_H = 17
const MAX_M = 45

function closeAll(){
  document.querySelectorAll('.custom-select.open').forEach(el=>{
    el.classList.remove('open')
    el.setAttribute('aria-expanded','false')
    el.querySelector('.options').setAttribute('aria-hidden','true')
  })
}

toggle.addEventListener('click',()=>{
  const open = wrapper.classList.contains('open')
  closeAll()
  if(!open){
    wrapper.classList.add('open')
    wrapper.setAttribute('aria-expanded','true')
    optionsEl.setAttribute('aria-hidden','false')
  }
})

options.forEach(li=>{
  li.addEventListener('click',()=>{
    options.forEach(o=>o.removeAttribute('aria-selected'))
    li.setAttribute('aria-selected','true')
    hidden.value = li.getAttribute('data-value')
    toggle.querySelector('.placeholder').textContent = li.textContent.trim()
    closeAll()
  })
})

document.addEventListener('click',e=>{
  if(!wrapper.contains(e.target)) closeAll()
})

function hhDotMMToMinutes(value){
  const num = parseFloat(String(value).replace(',', '.'))
  if(Number.isNaN(num)) return 0
  const hours = Math.floor(num)
  const mmPart = Math.round((num - hours) * 100)
  return hours * 60 + mmPart
}

function formatHhDotMM(value){
  const num = parseFloat(String(value).replace(',', '.'))
  if(Number.isNaN(num)) return '0 ساعت'
  const hours = Math.floor(num)
  const minutes = Math.round((num - hours) * 100)
  if(minutes >= 60){
    const carry = Math.floor(minutes / 60)
    return (hours + carry) + ' ساعت' + (minutes % 60 ? ' و ' + (minutes % 60) + ' دقیقه' : '')
  }
  return hours + ' ساعت' + (minutes ? ' و ' + minutes + ' دقیقه' : '')
}

function minutesBetween(h1,m1,h2,m2){
  return (h1 * 60 + m1) - (h2 * 60 + m2)
}

function absTimeDiff(mins){
  const abs = Math.abs(mins)
  const h = Math.floor(abs / 60)
  const m = abs % 60
  let txt = h + ' ساعت'
  if(m) txt += ' و ' + m + ' دقیقه'
  return txt
}

function validateEntry(){
  entryWarning.textContent = ''
  entryWarning.classList.remove('alert')
  const val = entryInput.value
  if(!val) return
  const [h,m] = val.split(':').map(Number)
  if(h > MAX_H || (h === MAX_H && m > MAX_M)){
    const diff = minutesBetween(h, m, MAX_H, MAX_M)
    entryWarning.textContent = 'ساعت ورود مجاز تا 17:45 است. شما ' + absTimeDiff(diff) + ' کسر کار دارید.'
    entryWarning.classList.add('alert')
  }
}

entryInput.addEventListener('change', validateEntry)
entryInput.addEventListener('input', validateEntry)

calcBtn.addEventListener('click',()=>{
  result.classList.remove('active')
  extraNote.textContent = ''
  extraNote.classList.remove('alert')
  entryWarning.textContent = ''
  entryWarning.classList.remove('alert')
  const entry = entryInput.value
  const presVal = hidden.value
  if(!entry || !presVal){
    result.textContent = '⚠️ لطفاً تمام فیلدها را تکمیل کنید.'
    result.classList.add('active')
    return
  }
  const [h,m] = entry.split(':').map(Number)
  const start = new Date()
  start.setHours(h, m, 0, 0)
  const totalMinutes = hhDotMMToMinutes(presVal)
  const exit = new Date(start.getTime() + totalMinutes * 60000)
  const hh = exit.getHours().toString().padStart(2, '0')
  const mm2 = exit.getMinutes().toString().padStart(2, '0')
  const durationText = formatHhDotMM(presVal)
  result.textContent = `اگر ساعت ${entry} وارد شوید و مدت حضور ${durationText} باشد، ساعت ${hh}:${mm2} می‌توانید خارج شوید.`
  result.classList.add('active')
  const exitDiff = minutesBetween(exit.getHours(), exit.getMinutes(), MAX_H, MAX_M)
  if(exitDiff > 0){
    extraNote.textContent = 'خروج بعد از 17:45 است؛ ' + absTimeDiff(exitDiff) + ' کسر کار می‌باشد.'
    extraNote.classList.add('alert')
  } else {
    const entryDiff = minutesBetween(h, m, MAX_H, MAX_M)
    if(entryDiff > 0){
      extraNote.textContent = 'ساعت ورود مجاز تا 17:45 است. شما ' + absTimeDiff(entryDiff) + ' کسر کار دارید.'
      extraNote.classList.add('alert')
    }
  }
})