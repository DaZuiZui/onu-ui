import { computed, getCurrentInstance, inject, provide, ref, unref } from 'vue'
import { configProviderContextKey } from '../tokens'
import { mergeObjects } from '../shared'
import type { InstallOptions } from '../tokens'
import type { App, Ref } from 'vue'
import type { MaybeRef } from '@vueuse/core'

const globalConfig = ref<InstallOptions>()

/**
 * 获取全局配置 Hooks
 * @param key
 * @param defaultValue
 */
export function useGlobalConfig<T extends keyof InstallOptions, U extends InstallOptions[T]>(key: T, defaultValue?: U): Ref<Exclude<InstallOptions[T], undefined | U>>
export function useGlobalConfig(): Ref<InstallOptions>
export function useGlobalConfig(key?: keyof InstallOptions, defaultValue = undefined) {
  const config = getCurrentInstance() ? inject(configProviderContextKey, globalConfig) : globalConfig
  // console.log('调用 inject', globalConfig, config, getCurrentInstance())
  if (key)
    return computed(() => config.value?.[key] ?? defaultValue)
  else
    return config
}

/**
 * 注入配置
 * @param config
 * @param app
 * @param global
 */
export function provideGlobalConfig(config: MaybeRef<InstallOptions>, app?: App, global = false) {
  const inSetup = !!getCurrentInstance()
  const sourceConfig = inSetup ? useGlobalConfig() : undefined
  const provideFn = app?.provide ?? (inSetup ? provide : undefined)

  if (!provideFn) return

  const context = computed(() => {
    const cfg = unref(config)
    if (!sourceConfig?.value) return cfg

    return mergeObjects(sourceConfig.value, cfg)
  })

  provideFn(configProviderContextKey, context)

  // 初始化
  if (global || !globalConfig.value)
    globalConfig.value = context.value

  // console.log('调用 provide', globalConfig.value)

  return context
}
