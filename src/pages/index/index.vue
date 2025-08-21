<template>
    <view class="headcount-page">
        <!-- 当前人数显示 -->
        <view class="current-count-section">
            <view class="count-display">
                <text class="count-label">当前公司人数</text>
                <text class="count-number">{{ headcountStore.currentCount }}</text>
                <text class="count-unit">人</text>
            </view>
        </view>

        <!-- 操作按钮区域 -->
        <view class="operation-section">
            <view class="operation-title">人数变更操作</view>

            <!-- 快速操作按钮 -->
            <view class="quick-operations">
                <button
                    class="operation-btn increase-btn add-btn"
                    @click="handleIncrement(1)"
                >
                    +1
                </button>
                <button
                    class="operation-btn increase-btn"
                    @click="handleIncrement(5)"
                >
                    +5
                </button>
                <button
                    class="operation-btn decrease-btn"
                    @click="handleDecrement(1)"
                >
                    -1
                </button>
                <button
                    class="operation-btn decrease-btn"
                    @click="handleDecrement(5)"
                >
                    -5
                </button>
            </view>

            <!-- 自定义数量输入 -->
            <view class="custom-input-section">
                <view class="input-group">
                    <text class="input-label">自定义变更数量：</text>
                    <input
                        :cursor="cursor"
                        class="number-input"
                        type="number"
                        v-model="customAmount"
                        placeholder="输入数量"
                        min="1"
                        step="1"
                        @input="handleInput"
                    />
                </view>
                <view class="custom-buttons">
                    <button
                        class="custom-btn increase-btn"
                        @click="handleCustomIncrement"
                        :disabled="!customAmount || Number(customAmount) <= 0"
                    >
                        增加 {{ customAmount || 0 }} 人
                    </button>
                    <button
                        class="custom-btn decrease-btn"
                        @click="handleCustomDecrement"
                        :disabled="!customAmount || Number(customAmount) <= 0"
                    >
                        减少 {{ customAmount || 0 }} 人
                    </button>
                </view>
            </view>

            <!-- 直接设置总数 -->
            <view class="direct-set-section">
                <view class="input-group">
                    <text class="input-label">直接设置总人数：</text>
                    <input
                        :cursor="cursor"
                        class="number-input"
                        type="number"
                        v-model="directCount"
                        placeholder="输入总人数"
                        min="0"
                        step="1"
                    />
                </view>
                <button
                    class="custom-btn set-btn"
                    @click="handleDirectSet"
                    :disabled="!directCount || Number(directCount) < 0"
                >
                    设置为 {{ directCount || 0 }} 人
                </button>
            </view>
        </view>

        <!-- 今日变化记录 -->
        <view
            class="today-changes"
            v-if="todayRecord"
        >
            <view class="section-title">今日变化</view>
            <view class="change-info">
                <text class="change-text">
                    今日{{ todayRecord.change >= 0 ? '增加' : '减少' }}了
                    <text :class="todayRecord.change >= 0 ? 'increase-text' : 'decrease-text'">
                        {{ Math.abs(todayRecord.change) }}
                    </text> 人
                </text>
            </view>
        </view>

        <!-- 最近记录 -->
        <view
            class="recent-records"
            v-if="recentRecords.length > 0"
        >
            <view class="section-title">最近记录</view>
            <view class="records-list">
                <view
                    class="record-item"
                    v-for="record in recentRecords.slice(0, 5)"
                    :key="record.date"
                >
                    <view class="record-date">{{ formatDate(record.date) }}</view>
                    <view class="record-count">{{ record.count }}人</view>
                    <view
                        class="record-change"
                        :class="record.change >= 0 ? 'increase-text' : 'decrease-text'"
                    >
                        {{ record.change >= 0 ? '+' : '' }}{{ record.change }}
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import './index.less'
import { useHeadcountStore } from '../../stores/headcount'

const headcountStore = useHeadcountStore();
const cursor = ref<number>(-1)
function setCursor(val: number) {
    cursor.value = val
}
function handleInput(e: any) {
    const { value, cursor } = e.detail
    // const val = value.replace(/\s/g, "")
    // getValue(val)
    setCursor(cursor)
}

// 自定义变更数量
const customAmount = ref<string>('')
// 直接设置的总数
const directCount = ref<string>('')

// 获取今日记录
const todayRecord = computed(() => {
    const today = new Date().toISOString().split('T')[0]
    return headcountStore.records.find(record => record.date === today)
})

// 获取最近记录
const recentRecords = computed(() => {
    return headcountStore.getRecentRecords(7)
})

// 增加人数
function handleIncrement(amount: number) {
    headcountStore.increment(amount)
}

// 减少人数
function handleDecrement(amount: number) {
    headcountStore.decrement(amount)
}

// 自定义增加
function handleCustomIncrement() {
    const amount = Number(customAmount.value)
    if (amount && amount > 0 && Number.isInteger(amount)) {
        headcountStore.increment(amount)
        customAmount.value = ''
    }
}

// 自定义减少
function handleCustomDecrement() {
    const amount = Number(customAmount.value)
    if (amount && amount > 0 && Number.isInteger(amount)) {
        headcountStore.decrement(amount)
        customAmount.value = ''
    }
}

// 直接设置总数
function handleDirectSet() {
    const count = Number(directCount.value)
    if (!isNaN(count) && count >= 0 && Number.isInteger(count)) {
        headcountStore.setCount(count)
        directCount.value = ''
    }
}

// 格式化日期显示
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
        return `${date.getMonth() + 1}/${date.getDate()}`
    }
}
</script>
