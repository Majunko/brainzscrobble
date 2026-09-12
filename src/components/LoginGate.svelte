<script lang="ts">
  import { onMount } from 'svelte';
  import { validateToken } from '../lib/listenbrainz';
  import { connect } from '../lib/store.svelte';
  import { toErrorMessage } from '../lib/time';
  import { t } from '../lib/i18n.svelte';

  let started = $state(false);
  let draft = $state('');
  let busy = $state(false);
  let error = $state<string | null>(null);
  let show = $state(false);

  function looksLikeToken(text: string): boolean {
    const s = text.trim();
    if (!s || s.length > 128) return false;
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(s)) {
      return true;
    }
    return /^[A-Za-z0-9_-]{20,}$/.test(s);
  }

  async function tryFillFromClipboard() {
    if (!started || busy || draft.trim()) return;
    if (!navigator.clipboard?.readText) return;
    try {
      const text = await navigator.clipboard.readText();
      if (looksLikeToken(text)) draft = text.trim();
    } catch {
      // clipboard permission not granted: the user can paste manually
    }
  }

  onMount(() => {
    const onFocus = () => {
      tryFillFromClipboard();
    };
    const onVisible = () => {
      if (document.visibilityState === 'visible') tryFillFromClipboard();
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  });

  function start() {
    started = true;
    error = null;
    tryFillFromClipboard();
  }

  async function handleConnect() {
    if (!draft.trim() || busy) return;
    busy = true;
    error = null;
    try {
      const res = await validateToken(draft.trim());
      if (res.valid && res.user_name) {
        connect({ token: draft.trim(), username: res.user_name });
      } else {
        error = t('login.invalid');
      }
    } catch (e) {
      error = toErrorMessage(e) || t('login.failed');
    } finally {
      busy = false;
    }
  }
</script>

<section class="mx-auto flex w-full max-w-xl flex-col items-center gap-6 py-10 text-center">
  <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-800 shadow-xl shadow-purple-950/50">
    <svg viewBox="0 0 24 24" class="h-8 w-8" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  </div>

  <div>
    <h2 class="text-2xl font-bold t-strong">brainzscrobble</h2>
    <p class="mt-2 text-sm t-soft">{t('login.heroTitle')}</p>
    <p class="mx-auto mt-1 max-w-md text-sm t-faint">
      {t('login.heroText')}
    </p>
  </div>

  {#if !started}
    <button
      type="button"
      class="btn-primary w-full max-w-sm px-6 py-4 text-base shadow-lg shadow-purple-950/40"
      onclick={start}
    >
      <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="4" y="11" width="16" height="11" rx="2" />
        <path d="M8 11V7a4 4 0 0 1 8 0v4" />
      </svg>
      {t('login.connect')}
    </button>
    <p class="max-w-sm text-xs t-faint">{t('login.privacy')}</p>
  {:else}
    <div class="card w-full px-5 py-5 text-left">
      <h3 class="mb-3 text-sm font-semibold uppercase tracking-wide t-sub">
        {t('login.stepsTitle')}
      </h3>
      <ol class="mb-4 flex flex-col gap-2 text-sm t-sub">
        <li>
          <span class="t-soft">1.</span>
          {t('login.step1')}
          <a
            class="link-purple ml-1 text-xs"
            href="https://listenbrainz.org/settings"
            target="_blank"
            rel="noreferrer"
            >{t('login.openToCopy')}</a
          >
        </li>
        <li><span class="t-soft">2.</span> {t('login.step2')}</li>
        <li><span class="t-soft">3.</span> {t('login.step3')}</li>
      </ol>

      <div class="relative">
        <input
          type={show ? 'text' : 'password'}
          class="input pr-10 font-mono"
          bind:value={draft}
          placeholder={t('login.paste')}
          autocomplete="off"
          spellcheck="false"
          onkeydown={(e) => {
            if (e.key === 'Enter') handleConnect();
          }}
        />
        <button
          type="button"
          class="absolute inset-y-0 right-0 flex items-center pr-2.5 t-faint transition hover:t-strong"
          aria-label={show ? t('login.hide') : t('login.show')}
          title={show ? t('login.hide') : t('login.show')}
          onclick={() => (show = !show)}
        >
          {#if show}
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
              <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
              <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
              <line x1="2" y1="2" x2="22" y2="22" />
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" class="h-[18px] w-[18px]" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          {/if}
        </button>
      </div>

      {#if error}
        <p class="msg-err mt-3">{error}</p>
      {/if}

      <button
        type="button"
        class="btn-primary mt-4 w-full"
        onclick={handleConnect}
        disabled={busy || !draft.trim()}
      >
        {#if busy}
          <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
            <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
          </svg>
          {t('login.connecting')}
        {:else}
          {t('login.connectBtn')}
        {/if}
      </button>

      <p class="mt-3 text-xs t-faint">{t('login.privacy')}</p>
    </div>
  {/if}
</section>