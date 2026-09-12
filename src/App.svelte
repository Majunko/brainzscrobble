<script lang="ts">
  import History from './components/History.svelte';
  import LoginGate from './components/LoginGate.svelte';
  import ScrobbleForm from './components/ScrobbleForm.svelte';
  import ScrobbleQueue from './components/ScrobbleQueue.svelte';
  import SettingsModal from './components/SettingsModal.svelte';
  import { i18n, t } from './lib/i18n.svelte';
  import { settings } from './lib/settings.svelte';
  import { isLoggedIn, logout, store } from './lib/store.svelte';

  let settingsOpen = $state(false);
  let menuOpen = $state(false);

  function handleLogout(): void {
    menuOpen = false;
    logout();
  }

  $effect(() => {
    const locale = i18n.locale;
    document.documentElement.lang = locale;
    document.title = t('seo.title');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('seo.description'));
    document
      .querySelector('meta[property="og:locale"]')
      ?.setAttribute('content', locale === 'es' ? 'es_ES' : 'en_US');
  });

  $effect(() => {
    const theme = settings.theme;
    document.documentElement.classList.toggle('light', theme === 'light');
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute('content', theme === 'light' ? '#f4f4f5' : '#09090b');
  });
</script>

<div class="flex min-h-svh w-full flex-col">
  <header class="sticky top-0 z-20 border-b bd-line bg-elev backdrop-blur">
    <div class="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-3 px-3 py-2.5 sm:px-5 lg:px-8">
      <div class="flex min-w-0 items-center gap-2.5">
        <div class="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-800 shadow-md shadow-purple-950/50">
          <svg viewBox="0 0 24 24" class="h-5 w-5" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" />
            <circle cx="18" cy="16" r="3" />
          </svg>
        </div>
        <div class="min-w-0">
          <h1 class="truncate text-base leading-tight font-bold t-strong">
            brainzscrobble
          </h1>
        </div>
      </div>

      <div class="flex shrink-0 items-center gap-2">
        {#if isLoggedIn()}
          <div class="relative">
            <button
              type="button"
              class="flex items-center gap-1.5 rounded-full border bd-line bg-surface py-1 pr-2 pl-1 transition hover:bg-surface2"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              onclick={() => (menuOpen = !menuOpen)}
            >
              <span class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-purple-600 text-xs font-bold text-white uppercase">
                {store.username[0] ?? '?'}
              </span>
              <span class="hidden max-w-[8rem] truncate text-sm t-strong sm:block">
                {store.username}
              </span>
              <svg
                viewBox="0 0 24 24"
                class="h-3.5 w-3.5 shrink-0 t-faint transition-transform {menuOpen ? 'rotate-180' : ''}"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="m19.5 8.25-7.5 7.5-7.5-7.5" />
              </svg>
            </button>

            {#if menuOpen}
              <div
                class="fixed inset-0 z-40"
                role="presentation"
                onclick={() => (menuOpen = false)}
                onkeydown={() => (menuOpen = false)}
              ></div>
              <div
                class="absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border bd-line bg-elev p-1 shadow-xl"
                role="menu"
                aria-label={t('app.settings')}
                tabindex="-1"
                onclick={(e) => e.stopPropagation()}
                onkeydown={() => (menuOpen = false)}
              >
                <a
                  class="menu-item"
                  role="menuitem"
                  href={`https://listenbrainz.org/user/${encodeURIComponent(store.username)}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                  </svg>
                  {t('settings.profileOpen')}
                </a>
                <button
                  type="button"
                  class="menu-item"
                  role="menuitem"
                  onclick={() => {
                    menuOpen = false;
                    settingsOpen = true;
                  }}
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                  {t('app.settings')}
                </button>
                <div class="my-1 h-px bg-surface2"></div>
                <button type="button" class="menu-item menu-item-danger" role="menuitem" onclick={handleLogout}>
                  <svg viewBox="0 0 24 24" class="h-4 w-4 shrink-0" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M8.25 9V5.25A2.25 2.25 0 0 1 10.5 3h6a2.25 2.25 0 0 1 2.25 2.25v13.5A2.25 2.25 0 0 1 16.5 21h-6a2.25 2.25 0 0 1-2.25-2.25V15m-3 0-3-3m0 0 3-3m-3 3H15" />
                  </svg>
                  {t('app.signout')}
                </button>
              </div>
            {/if}
          </div>
        {:else}
          <button
            type="button"
            class="btn-icon"
            title={t('app.settings')}
            aria-label={t('app.settings')}
            onclick={() => (settingsOpen = true)}
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <span class="badge-amber badge hidden sm:inline-flex">
            {t('app.notConnected')}
          </span>
        {/if}
      </div>
    </div>
  </header>

  <main class="mx-auto w-full max-w-[1600px] flex-1 px-3 py-4 sm:px-5 lg:px-8">
    {#if isLoggedIn()}
      <div class="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,460px)_minmax(0,1fr)] xl:grid-cols-[minmax(0,430px)_minmax(0,1fr)_minmax(0,1fr)]">
        <ScrobbleForm />
        <ScrobbleQueue />
        <div class="lg:col-span-2 xl:col-span-1">
          <History />
        </div>
      </div>
    {:else}
      <LoginGate />
    {/if}
  </main>

  <footer class="mx-auto w-full max-w-[1600px] px-3 pt-2 pb-6 text-center text-xs t-faint sm:px-5 lg:px-8">
    {t('app.footer')}
  </footer>
</div>

{#if settingsOpen}
  <SettingsModal onclose={() => (settingsOpen = false)} />
{/if}