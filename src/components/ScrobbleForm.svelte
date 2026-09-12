<script lang="ts">
  import { enqueue, isLoggedIn, submitBatch, submitSingle } from '../lib/store.svelte';
  import { parseList, parsePasted } from '../lib/parse';
  import {
    TIME_PRESETS,
    fromDateTimeLocal,
    formatTime,
    nowEpoch,
    presetOffset,
    toDateTimeLocal,
  } from '../lib/time';
  import { t } from '../lib/i18n.svelte';
  import { settings } from '../lib/settings.svelte';

  type Mode = 'single' | 'list';
  type ListMsg = { type: 'ok' | 'warn'; text: string };

  let mode = $state<Mode>('single');
  let artist = $state('');
  let track = $state('');
  let album = $state('');
  let preset = $state('time.now');
  let customAt = $state(toDateTimeLocal(nowEpoch()));
  let customMode = $state(false);
  let busy = $state(false);
  let error = $state<string | null>(null);
  let pasteInfo = $state<string | null>(null);
  let pasteTimer: ReturnType<typeof setTimeout> | undefined;
  let listText = $state('');
  let listBusy = $state(false);
  let listMsg = $state<ListMsg | null>(null);

  const listenedAt = $derived.by(() => {
    if (customMode) {
      try {
        return fromDateTimeLocal(customAt);
      } catch {
        return 0;
      }
    }
    return nowEpoch() - presetOffset(preset);
  });

  function currentAt(): number {
    if (customMode) {
      return fromDateTimeLocal(customAt);
    }
    return nowEpoch() - presetOffset(preset);
  }

  function resetFeedback(): void {
    error = null;
    pasteInfo = null;
    if (pasteTimer) {
      clearTimeout(pasteTimer);
      pasteTimer = undefined;
    }
  }

  function handlePaste(e: ClipboardEvent, reversed: boolean): void {
    if (!settings.autoSplit) return;
    const song = parsePasted(e.clipboardData?.getData('text/plain') ?? '', reversed);
    if (!song) return;
    e.preventDefault();
    resetFeedback();
    artist = song.artist;
    track = song.track;
    if (song.album) album = song.album;
    pasteInfo = t('form.parsedHint');
    pasteTimer = setTimeout(() => {
      pasteInfo = null;
    }, 4000);
  }

  function validate(): string | null {
    if (!isLoggedIn()) return t('errors.notConnected');
    if (!artist.trim()) return t('form.needArtist');
    if (!track.trim()) return t('form.needTrack');
    return null;
  }

  function handleSwap(): void {
    resetFeedback();
    const tmp = artist;
    artist = track;
    track = tmp;
  }

  async function handleScrobble() {
    resetFeedback();
    const problem = validate();
    if (problem) {
      error = problem;
      return;
    }
    busy = true;
    const at = currentAt();
    const item = enqueue({ artist, track, album }, at);
    const ok = await submitSingle(item.id);
    if (ok) {
      artist = '';
      track = '';
      album = '';
    }
    busy = false;
  }

  async function handleSendList() {
    resetFeedback();
    listMsg = null;
    if (!isLoggedIn()) {
      error = t('errors.notConnected');
      return;
    }
    const { items, invalid } = parseList(listText);
    if (items.length === 0) {
      error = t('form.listEmpty');
      return;
    }
    const at = currentAt();
    for (const song of items) {
      enqueue(
        { artist: song.artist, track: song.track, album: song.album },
        at,
      );
    }
    const invalidNote =
      invalid > 0 ? ` ${t('form.listInvalid').replace('{n}', String(invalid))}` : '';
    listBusy = true;
    try {
      const res = await submitBatch();
      if (res.fail > 0) {
        listMsg = {
          type: 'warn',
          text: `${t('form.listResult')
            .replace('{ok}', String(res.ok))
            .replace('{fail}', String(res.fail))}${invalidNote}`,
        };
      } else {
        listMsg = {
          type: 'ok',
          text: `${t('form.listSent').replace('{n}', String(res.ok))}${invalidNote}`,
        };
        listText = '';
      }
    } finally {
      listBusy = false;
    }
  }
</script>

<section class="card">
  <h2 class="mb-3 text-sm font-semibold uppercase tracking-wide t-sub">
    {t('form.title')}
  </h2>

  <div class="mb-4 inline-flex rounded-lg border bd-line p-0.5">
    <button
      type="button"
      class="rounded-md px-3 py-1 text-xs font-medium transition
        {mode === 'single' ? 'bg-purple-600 text-white' : 't-faint hover:t-sub'}"
      onclick={() => (mode = 'single')}
    >
      {t('form.modeSingle')}
    </button>
    <button
      type="button"
      class="rounded-md px-3 py-1 text-xs font-medium transition
        {mode === 'list' ? 'bg-purple-600 text-white' : 't-faint hover:t-sub'}"
      onclick={() => (mode = 'list')}
    >
      {t('form.modeList')}
    </button>
  </div>

  <div class="flex flex-col gap-3">
    <div>
      <span class="label">{t('form.when')}</span>
      <div class="mb-2 inline-flex rounded-lg border bd-line p-0.5">
        <button
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium transition
            {!customMode ? 'bg-purple-600 text-white' : 't-faint hover:t-sub'}"
          onclick={() => (customMode = false)}
        >
          {t('form.tabPreset')}
        </button>
        <button
          type="button"
          class="rounded-md px-3 py-1 text-xs font-medium transition
            {customMode ? 'bg-purple-600 text-white' : 't-faint hover:t-sub'}"
          onclick={() => (customMode = true)}
        >
          {t('form.tabCustom')}
        </button>
      </div>

      {#if customMode}
        <input
          type="datetime-local"
          class="input w-full sm:w-auto"
          bind:value={customAt}
        />
      {:else}
        <select class="input w-full sm:w-auto" bind:value={preset}>
          {#each TIME_PRESETS as p (p.key)}
            <option value={p.key}>{t(p.key)}</option>
          {/each}
        </select>
      {/if}

      <p class="mt-1.5 font-mono text-xs t-faint">
        {listenedAt
          ? `${formatTime(listenedAt)} · ${t('form.epoch')} ${listenedAt}`
          : t('form.badDate')}
      </p>
    </div>

    {#if mode === 'single'}
      <div class="flex items-stretch gap-2">
        <div class="flex min-w-0 flex-1 flex-col gap-3">
          <div>
            <label class="label" for="scrob-artist">{t('form.artist')}</label>
            <input
              id="scrob-artist"
              class="input"
              bind:value={artist}
              placeholder={t('form.placeArtist')}
              autocomplete="off"
              onpaste={(e) => handlePaste(e, false)}
            />
          </div>

          <div>
            <label class="label" for="scrob-track">{t('form.track')}</label>
            <input
              id="scrob-track"
              class="input"
              bind:value={track}
              placeholder={t('form.placeTrack')}
              autocomplete="off"
              onpaste={(e) => handlePaste(e, true)}
              onkeydown={(e) => {
                if (e.key === 'Enter') handleScrobble();
              }}
            />
          </div>
        </div>

        <div class="flex w-9 shrink-0 flex-col items-center justify-center gap-1 t-dim">
          <span class="select-none text-[10px] leading-none" aria-hidden="true">⏋</span>
          <button
            type="button"
            class="btn-icon shrink-0"
            aria-label={t('form.swap')}
            title={t('form.swap')}
            onclick={handleSwap}
            disabled={busy || (!artist.trim() && !track.trim())}
          >
            <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="m21 16-4 4-4-4" />
              <path d="M17 20V4" />
              <path d="m3 8 4-4 4 4" />
              <path d="M7 4v16" />
            </svg>
          </button>
          <span class="select-none text-[10px] leading-none" aria-hidden="true">⏌</span>
        </div>
      </div>

      <div>
        <label class="label" for="scrob-album">{t('form.album')}</label>
        <input
          id="scrob-album"
          class="input"
          bind:value={album}
          placeholder={t('form.placeAlbum')}
          autocomplete="off"
        />
      </div>

      {#if pasteInfo}
        <p class="msg-info">{pasteInfo}</p>
      {/if}
    {:else}
      <div>
        <label class="label" for="scrob-list">{t('form.pasteList')}</label>
        <textarea
          id="scrob-list"
          class="input h-48 resize-y font-mono"
          bind:value={listText}
          placeholder={t('form.pasteListPlaceholder')}
          autocomplete="off"
          spellcheck="false"
        ></textarea>
        <p class="mt-1.5 text-xs t-faint">{t('form.listHint')}</p>
      </div>
    {/if}

    {#if error}
      <p class="msg-err">{error}</p>
    {/if}
    {#if mode === 'list' && listMsg}
      <p class={listMsg.type === 'ok' ? 'msg-ok' : 'msg-warn'}>
        {listMsg.text}
      </p>
    {/if}

    <div class="flex flex-wrap items-center gap-2 pt-1">
      {#if mode === 'single'}
        <button type="button" class="btn-primary" onclick={handleScrobble} disabled={busy}>
          {#if busy}
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            {t('form.submitting')}
          {:else}
            {t('form.scrobbleNow')}
          {/if}
        </button>
      {:else}
        <button
          type="button"
          class="btn-primary"
          onclick={handleSendList}
          disabled={listBusy || !listText.trim()}
        >
          {#if listBusy}
            <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
            </svg>
            {t('form.submitting')}
          {:else}
            {t('form.sendAll')}
          {/if}
        </button>
      {/if}
    </div>
  </div>
</section>