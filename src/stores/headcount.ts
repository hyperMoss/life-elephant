// life-elephant-app/src/stores/headcount.ts
import { defineStore } from "pinia";
import Taro from "@tarojs/taro";

export interface HeadcountRecord {
  date: string; // YYYY-MM-DD格式
  count: number;
  change: number; // 当日变化量
  timestamp: number;
}

export const useHeadcountStore = defineStore("headcount", () => {
  // 当前人数
  const currentCount = ref(0);

  // 历史记录
  const records = ref<HeadcountRecord[]>([]);

  // 从Taro存储加载数据
  async function loadData() {
    try {
      // 加载当前人数
      const savedCount = await Taro.getStorage({
        key: "company-headcount",
      }).catch(() => ({ data: null }));

      if (savedCount.data) {
        const parsedCount = Number(savedCount.data);
        currentCount.value =
          Number.isInteger(parsedCount) && parsedCount >= 0 ? parsedCount : 0;
      }

      // 加载历史记录
      const savedRecords = await Taro.getStorage({
        key: "company-headcount-records",
      }).catch(() => ({ data: null }));

      if (savedRecords.data) {
        const parsedRecords = JSON.parse(savedRecords.data) || [];
        // 确保记录中的数字字段都是数字类型
        records.value = parsedRecords.map((record: any) => ({
          ...record,
          count: Number(record.count) || 0,
          change: Number(record.change) || 0,
          timestamp: Number(record.timestamp) || Date.now(),
        }));
      }
    } catch (error) {
      console.error("加载数据失败:", error);
      currentCount.value = 0;
      records.value = [];
    }
  }

  // 保存数据到Taro存储
  async function saveData() {
    try {
      // 保存当前人数
      await Taro.setStorage({
        key: "company-headcount",
        data: currentCount.value.toString(),
      });

      // 保存历史记录
      await Taro.setStorage({
        key: "company-headcount-records",
        data: JSON.stringify(records.value),
      });
    } catch (error) {
      console.error("保存数据失败:", error);
    }
  }

  // 获取今天的日期字符串
  function getTodayString() {
    const today = new Date();
    return (
      today.getFullYear() +
      "-" +
      String(today.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(today.getDate()).padStart(2, "0")
    );
  }

  // 增加人数
  function increment(amount = 1) {
    const numAmount = Number(amount);
    if (!Number.isInteger(numAmount) || numAmount <= 0) {
      console.warn("增加人数必须是正整数:", amount);
      return;
    }

    const oldCount = currentCount.value;
    currentCount.value += numAmount;
    recordChange(numAmount, oldCount);
    saveData();
  }

  // 减少人数
  function decrement(amount = 1) {
    const numAmount = Number(amount);
    if (!Number.isInteger(numAmount) || numAmount <= 0) {
      console.warn("减少人数必须是正整数:", amount);
      return;
    }

    const oldCount = currentCount.value;
    currentCount.value = Math.max(0, currentCount.value - numAmount);
    const actualChange = currentCount.value - oldCount;
    recordChange(actualChange, oldCount);
    saveData();
  }

  // 直接设置人数
  function setCount(newCount: number) {
    const numCount = Number(newCount);
    if (!Number.isInteger(numCount) || numCount < 0) {
      console.warn("设置人数必须是非负整数:", newCount);
      return;
    }

    const oldCount = currentCount.value;
    currentCount.value = numCount;
    const change = currentCount.value - oldCount;
    if (change !== 0) {
      recordChange(change, oldCount);
      saveData();
    }
  }

  // 记录变化
  function recordChange(change: number, oldCount: number) {
    if (change === 0) return;

    const today = getTodayString();
    const existingRecordIndex = records.value.findIndex(
      (record) => record.date === today
    );

    if (existingRecordIndex >= 0) {
      // 更新今天的记录
      const existingRecord = records.value[existingRecordIndex];
      existingRecord.change += change;
      existingRecord.count = currentCount.value;
      existingRecord.timestamp = Date.now();
    } else {
      // 创建新的记录
      const newRecord: HeadcountRecord = {
        date: today,
        count: currentCount.value,
        change: change,
        timestamp: Date.now(),
      };
      records.value.push(newRecord);
    }

    // 保持记录按日期排序
    records.value.sort((a, b) => b.date.localeCompare(a.date));

    // 只保留最近30天的记录
    if (records.value.length > 30) {
      records.value = records.value.slice(0, 30);
    }
  }

  // 获取最近几天的记录
  function getRecentRecords(days = 7) {
    return records.value.slice(0, days);
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
        minCount: currentCount.value,
      };
    }

    const totalIncrease = records.value.reduce(
      (sum, record) => sum + (record.change > 0 ? record.change : 0),
      0
    );
    const totalDecrease = records.value.reduce(
      (sum, record) => sum + (record.change < 0 ? Math.abs(record.change) : 0),
      0
    );
    const totalChange = records.value.reduce(
      (sum, record) => sum + record.change,
      0
    );
    const maxCount = Math.max(
      ...records.value.map((r) => r.count),
      currentCount.value
    );
    const minCount = Math.min(
      ...records.value.map((r) => r.count),
      currentCount.value
    );

    return {
      totalDays: records.value.length,
      totalIncrease,
      totalDecrease,
      averageChange:
        records.value.length > 0 ? totalChange / records.value.length : 0,
      maxCount,
      minCount,
    };
  });

  // 初始化时加载数据
  loadData().catch((error) => {
    console.error("初始化加载数据失败:", error);
  });

  return {
    currentCount: readonly(currentCount),
    records: readonly(records),
    statistics,
    increment,
    decrement,
    setCount,
    getRecentRecords,
    loadData,
    saveData,
  };
});
