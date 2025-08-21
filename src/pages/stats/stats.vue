<!-- life-elephant-app/src/pages/stats/stats.vue -->
<template>
  <view class="stats-page">
    <!-- 统计概览 -->
    <view class="stats-overview">
      <view class="overview-title">统计概览</view>
      <view class="stats-grid">
        <view class="stat-item">
          <view class="stat-value">{{ headcountStore.currentCount }}</view>
          <view class="stat-label">当前人数</view>
        </view>
        <view class="stat-item">
          <view class="stat-value">{{ statistics.totalDays }}</view>
          <view class="stat-label">记录天数</view>
        </view>
        <view class="stat-item">
          <view class="stat-value increase-text">+{{ statistics.totalIncrease }}</view>
          <view class="stat-label">总增加</view>
        </view>
        <view class="stat-item">
          <view class="stat-value decrease-text">-{{ statistics.totalDecrease }}</view>
          <view class="stat-label">总减少</view>
        </view>
      </view>
      
      <view class="range-stats">
        <view class="range-item">
          <text class="range-label">最高人数：</text>
          <text class="range-value">{{ statistics.maxCount }}人</text>
        </view>
        <view class="range-item">
          <text class="range-label">最低人数：</text>
          <text class="range-value">{{ statistics.minCount }}人</text>
        </view>
        <view class="range-item">
          <text class="range-label">平均变化：</text>
          <text class="range-value" :class="statistics.averageChange >= 0 ? 'increase-text' : 'decrease-text'">
            {{ statistics.averageChange >= 0 ? '+' : '' }}{{ statistics.averageChange.toFixed(1) }}人/天
          </text>
        </view>
      </view>
    </view>

    <!-- 趋势图表区域 -->
    <view class="chart-section">
      <view class="chart-title">人数变化趋势</view>
      <view class="chart-container">
        <canvas 
          canvas-id="headcountChart" 
          class="chart-canvas"
          @touchstart="handleChartTouch"
        ></canvas>
      </view>
      <view class="chart-legend">
        <view class="legend-item">
          <view class="legend-color count-color"></view>
          <text class="legend-text">人数</text>
        </view>
        <view class="legend-item">
          <view class="legend-color change-color"></view>
          <text class="legend-text">变化量</text>
        </view>
      </view>
    </view>

    <!-- 详细记录列表 -->
    <view class="records-section">
      <view class="records-title">详细记录</view>
      <view class="records-list" v-if="allRecords.length > 0">
        <view 
          class="record-item" 
          v-for="record in allRecords" 
          :key="record.date"
        >
          <view class="record-left">
            <view class="record-date">{{ formatDate(record.date) }}</view>
            <view class="record-time">{{ formatTime(record.timestamp) }}</view>
          </view>
          <view class="record-center">
            <view class="record-count">{{ record.count }}人</view>
          </view>
          <view class="record-right">
            <view 
              class="record-change"
              :class="record.change >= 0 ? 'increase-text' : 'decrease-text'"
            >
              {{ record.change >= 0 ? '+' : '' }}{{ record.change }}
            </view>
          </view>
        </view>
      </view>
      <view class="empty-records" v-else>
        <text class="empty-text">暂无记录数据</text>
      </view>
    </view>

    <!-- 数据管理 -->
    <view class="data-management">
      <view class="management-title">数据管理</view>
      <view class="management-buttons">
        <button class="management-btn export-btn" @click="exportData">
          导出数据
        </button>
        <button class="management-btn clear-btn" @click="showClearConfirm">
          清空数据
        </button>
      </view>
    </view>

    <!-- 清空确认弹窗 -->
    <view class="modal-overlay" v-if="showClearModal" @click="hideClearConfirm">
      <view class="modal-content" @click.stop>
        <view class="modal-title">确认清空数据</view>
        <view class="modal-text">此操作将清空所有历史记录，但保留当前人数，是否继续？</view>
        <view class="modal-buttons">
          <button class="modal-btn cancel-btn" @click="hideClearConfirm">取消</button>
          <button class="modal-btn confirm-btn" @click="confirmClear">确认</button>
        </view>
      </view>
    </view>
  </view>
</template>

<script lang="ts" setup>
import './stats.less'
import { useHeadcountStore } from '../../stores/headcount'
import Taro from '@tarojs/taro'

const headcountStore = useHeadcountStore()

// 获取统计数据
const statistics = computed(() => headcountStore.statistics)

// 获取所有记录
const allRecords = computed(() => headcountStore.records)

// 清空确认弹窗状态
const showClearModal = ref(false)

// 格式化日期
function formatDate(dateStr: string) {
  const date = new Date(dateStr)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  
  if (dateStr === today.toISOString().split('T')[0]) {
    return '今天'
  } else if (dateStr === yesterday.toISOString().split('T')[0]) {
    return '昨天'
  } else {
    return `${date.getMonth() + 1}月${date.getDate()}日`
  }
}

// 格式化时间
function formatTime(timestamp: number) {
  const date = new Date(timestamp)
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`
}

// 显示清空确认弹窗
function showClearConfirm() {
  showClearModal.value = true
}

// 隐藏清空确认弹窗
function hideClearConfirm() {
  showClearModal.value = false
}

// 确认清空数据
async function confirmClear() {
  try {
    await Taro.removeStorage({
      key: 'company-headcount-records'
    })
    await headcountStore.loadData()
    showClearModal.value = false
    Taro.showToast({
      title: '数据已清空',
      icon: 'success'
    })
  } catch (error) {
    Taro.showToast({
      title: '清空失败',
      icon: 'error'
    })
  }
}

// 导出数据
function exportData() {
  try {
    const data = {
      currentCount: headcountStore.currentCount,
      records: headcountStore.records,
      exportTime: new Date().toISOString(),
      statistics: statistics.value
    }
    
    const dataStr = JSON.stringify(data, null, 2)
    
    // 在小程序中，我们可以显示数据让用户复制
    Taro.showModal({
      title: '导出数据',
      content: '数据已准备好，请复制以下内容保存'+dataStr,
      showCancel: false,
      success: () => {
        // 这里可以进一步处理，比如显示在新页面或复制到剪贴板
        console.log('导出数据:', dataStr)
      }
    })
  } catch (error) {
    Taro.showToast({
      title: '导出失败',
      icon: 'error'
    })
  }
}

// 图表触摸事件（预留）
function handleChartTouch(e: any) {
  console.log('图表触摸事件:', e)
}

// 页面加载时初始化图表
onMounted(() => {
  // 这里可以初始化图表库，比如使用 F2 或其他小程序图表库
  console.log('统计页面已加载，可以初始化图表')
})
</script>
