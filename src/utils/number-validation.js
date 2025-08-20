// life-elephant-app/src/utils/number-validation.js
// 数字验证工具函数

/**
 * 验证并转换为安全的正整数
 * @param {any} value - 要验证的值
 * @param {number} defaultValue - 默认值
 * @returns {number} 验证后的正整数
 */
export function toSafePositiveInteger(value, defaultValue = 1) {
  const num = Number(value)
  if (!Number.isInteger(num) || num <= 0) {
    console.warn('输入值必须是正整数:', value)
    return defaultValue
  }
  return num
}

/**
 * 验证并转换为安全的非负整数
 * @param {any} value - 要验证的值
 * @param {number} defaultValue - 默认值
 * @returns {number} 验证后的非负整数
 */
export function toSafeNonNegativeInteger(value, defaultValue = 0) {
  const num = Number(value)
  if (!Number.isInteger(num) || num < 0) {
    console.warn('输入值必须是非负整数:', value)
    return defaultValue
  }
  return num
}

/**
 * 检查值是否为有效的正整数
 * @param {any} value - 要检查的值
 * @returns {boolean} 是否为有效的正整数
 */
export function isValidPositiveInteger(value) {
  const num = Number(value)
  return Number.isInteger(num) && num > 0
}

/**
 * 检查值是否为有效的非负整数
 * @param {any} value - 要检查的值
 * @returns {boolean} 是否为有效的非负整数
 */
export function isValidNonNegativeInteger(value) {
  const num = Number(value)
  return Number.isInteger(num) && num >= 0
}
