<script lang="ts">
  import { settings, updateSetting } from '../lib/settings.svelte';
  import type { DateFormat, Theme, TimeFormat } from '../lib/settings.svelte';
  import { isLoggedIn, store } from '../lib/store.svelte';
  import { availableLocales, i18n, setLocale, t } from '../lib/i18n.svelte';

  let { onclose }: { onclose: () => void } = $props();

  const LOCALE_NAMES: Record<string, string> = {
    es: 'Español',
    en: 'English',
  };

  const TIME_FORMATS: TimeFormat[] = ['12', '24'];
  const DATE_FORMATS: DateFormat[] = ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'];
  const THEMES: Theme[] = ['dark', 'light'];

  function onKeydown(e: KeyboardEvent) {
    if (e.key === 'Escape') onclose();
  }

  function segmentClass(active: boolean): string {
    return `rounded-md px-3 py-1 text-xs font-medium transition ${
      active ? 'bg-purple-600 text-white' : 't-soft hover:t-strong'
    }`;
  }
</script>

<svelte:window onkeydown={onKeydown} />

<div
  class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
  role="presentation"
  onclick={onclose}
  onkeydown={onKeydown}
>
  <div
    class="card w-full max-w-md p-5"
    role="dialog"
    aria-modal="true"
    aria-label={t('settings.title')}
    tabindex="-1"
    onclick={(e) => e.stopPropagation()}
    onkeydown={onKeydown}
  >
    <div class="mb-4 flex items-center justify-between gap-2">
      <h3 class="text-sm font-semibold uppercase tracking-wide t-sub">
        {t('settings.title')}
      </h3>
      <button
        type="button"
        class="btn-icon"
        title={t('settings.close')}
        aria-label={t('settings.close')}
        onclick={onclose}
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>

    <div class="flex flex-col gap-5">
      {#if isLoggedIn()}
        <div>
          <span class="label">{t('settings.profile')}</span>
          <div class="flex items-center gap-2 rounded-lg border bd-soft bg-surface2 px-3 py-2">
            <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white uppercase">
              {store.username[0] ?? '?'}
            </span>
            <span class="min-w-0 flex-1 truncate text-sm t-strong">{store.username}</span>
            <a
              class="link-purple shrink-0 text-xs"
              href={`https://listenbrainz.org/user/${encodeURIComponent(store.username)}`}
              target="_blank"
              rel="noreferrer"
            >
              {t('settings.profileOpen')}
            </a>
          </div>
        </div>
      {/if}

      <div>
        <span class="label">{t('settings.language')}</span>
        <div class="inline-flex flex-wrap gap-1 rounded-lg border bd-soft p-0.5">
          {#each availableLocales() as loc (loc)}
            <button
              type="button"
              class={segmentClass(i18n.locale === loc)}
              onclick={() => setLocale(loc)}
            >
              {LOCALE_NAMES[loc] ?? loc}
            </button>
          {/each}
        </div>
      </div>

      <div>
        <span class="label">{t('settings.timeFormat')}</span>
        <div class="inline-flex rounded-lg border bd-soft p-0.5">
          {#each TIME_FORMATS as fmt (fmt)}
            <button
              type="button"
              class={segmentClass(settings.timeFormat === fmt)}
              onclick={() => updateSetting('timeFormat', fmt)}
            >
              {fmt === '12' ? t('settings.time12') : t('settings.time24')}
            </button>
          {/each}
        </div>
      </div>

      <div>
        <span class="label">{t('settings.dateFormat')}</span>
        <select
          class="input w-full sm:w-auto"
          value={settings.dateFormat}
          onchange={(e) => updateSetting('dateFormat', e.currentTarget.value as DateFormat)}
        >
          {#each DATE_FORMATS as fmt (fmt)}
            <option value={fmt}>{fmt}</option>
          {/each}
        </select>
      </div>

      <div class="flex items-center justify-between gap-3">
        <span class="label mb-0">{t('settings.split')}</span>
        <button
          type="button"
          role="switch"
          aria-checked={settings.autoSplit}
          aria-label={t('settings.split')}
          title={t('settings.split')}
          class="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition
            {settings.autoSplit ? 'border-transparent bg-purple-600' : 'bd-soft bg-surface2'}"
          onclick={() => updateSetting('autoSplit', !settings.autoSplit)}
        >
          <span
            class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform
              {settings.autoSplit ? 'translate-x-5' : ''}"
          ></span>
        </button>
      </div>

      <div>
        <span class="label">{t('settings.theme')}</span>
        <div class="inline-flex rounded-lg border bd-soft p-0.5">
          {#each THEMES as theme (theme)}
            <button
              type="button"
              class={segmentClass(settings.theme === theme)}
              onclick={() => updateSetting('theme', theme)}
            >
              {#if theme === 'dark'}
                <svg viewBox="0 0 24 24" class="mr-1 inline h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" class="mr-1 inline h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <circle cx="12" cy="12" r="4" />
                  <path d="M12 2v2" />
                  <path d="M12 20v2" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M2 12h2" />
                  <path d="M20 12h2" />
                  <path d="m6.34 17.66-1.41 1.41" />
                  <path d="m19.07 4.93-1.41 1.41" />
                </svg>
              {/if}
              {theme === 'dark' ? t('settings.dark') : t('settings.light')}
            </button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</div>