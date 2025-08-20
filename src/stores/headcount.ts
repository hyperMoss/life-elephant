// life-elephant-app/src/stores/headcount.ts
import { defineStore } from 'pinia'

export interface HeadcountRecord {
  date: string // YYYY-MM-DD格式
  count: number
  change: number // 当日变化量
  timestamp: number
}

export const useHeadcountStore = defineStore('headcount', () => {
  // 当前人数
  const currentCount = ref(0)
  
  // 历史记录
  const records = ref<HeadcountRecord[]>([])
  
  // 从localStorage加载数据
  function loadData() {
    try {
      const savedCount = localStorage.getItem('company-headcount')
      const savedRecords = localStorage.getItem('company-headcount-records')
      
      if (savedCount) {
        currentCount.value = parseInt(savedCount, 10) || 0
      }
      
      if (savedRecords) {
        records.value = JSON.parse(savedRecords) || []
      }
    } catch (error) {
      console.error('加载数据失败:', error)
    }
  }
  
  // 保存数据到localStorage
  function saveData() {
    try {
      localStorage.setItem('company-headcount', currentCount.value.toString())
      localStorage.setItem('company-headcount-records', JSON.stringify(records.value))
    } catch (error) {
      console.error('保存数据失败:', error)
    }
  }
  
  // 获取今天的日期字符串
  function getTodayString() {
    const today = new Date()
    return today.getFullYear() + '-' + 
           String(today.getMonth() + 1).padStart(2, '0') + '-' + 
           String(today.getDate()).padStart(2, '0')
  }
  
  // 增加人数
  function increment(amount = 1) {
    const oldCount = currentCount.value
    currentCount.value += amount
    recordChange(amount, oldCount)
    saveData()
  }
  
  // 减少人数
  function decrement(amount = 1) {
    const oldCount = currentCount.value
    currentCount.value = Math.max(0, currentCount.value - amount)
    const actualChange = currentCount.value - oldCount
    recordChange(actualChange, oldCount)
    saveData()
  }
  
  // 直接设置人数
  function setCount(newCount: number) {
    const oldCount = currentCount.value
    currentCount.value = Math.max(0, newCount)
    const change = currentCount.value - oldCount
    if (change !== 0) {
      recordChange(change, oldCount)
      saveData()
    }
  }
  
  // 记录变化
  function recordChange(change: number, oldCount: number) {
    if (change === 0) return
    
    const today = getTodayString()
    const existingRecordIndex = records.value.findIndex(record => record.date === today)
    
    if (existingRecordIndex >= 0) {
      // 更新今天的记录
      const existingRecord = records.value[existingRecordIndex]
      existingRecord.change += change
      existingRecord.count = currentCount.value
      existingRecord.timestamp = Date.now()
    } else {
      // 创建新的记录
      const newRecord: HeadcountRecord = {
        date: today,
        count: currentCount.value,
        change: change,
        timestamp: Date.now()
      }
      records.value.push(newRecord)
    }
    
    // 保持记录按日期排序
    records.value.sort((a, b) => b.date.localeCompare(a.date))
    
    // 只保留最近30天的记录
    if (records.value.length > 30) {
      records.value = records.value.slice(0, 30)
    }
  }
  
  // 获取最近几天的记录
  function getRecentRecords(days = 7) {
    return records.value.slice(0, days)
  }
  
  // 获取统计信息
  const statistics = computed(() => {
    if (records.value.length === 0) {
      return {
        totalDays: 0,
        totalIncrease: 0,
        totalDecrease: 0,
        averageChange: 0,
        maxCount: currentCount.value,
        minCount: currentCount.value
      }
    }
    
    const totalIncrease = records.value.reduce((sum, record) => 
      sum + (record.change > 0 ? record.change : 0), 0)
    const totalDecrease = records.value.reduce((sum, record) => 
      sum + (record.change < 0 ? Math.abs(record.change) : 0), 0)
    const totalChange = records.value.reduce((sum, record) => sum + record.change, 0)
    const maxCount = Math.max(...records.value.map(r => r.count), currentCount.value)
    const minCount = Math.min(...records.value.map(r => r.count), currentCount.value)
    
    return {
      totalDays: records.value.length,
      totalIncrease,
      totalDecrease,
      averageChange: records.value.length > 0 ? totalChange / records.value.length : 0,
      maxCount,
      minCount
    }
  })
  
  // 初始化时加载数据
  loadData()
  
  return {
    currentCount: readonly(currentCount),
    records: readonly(records),
    statistics,
    increment,
    decrement,
    setCount,
    getRecentRecords,
    loadData,
    saveData
  }
})
