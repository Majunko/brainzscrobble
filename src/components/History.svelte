<script lang="ts">
  import { clearHistory, store } from '../lib/store.svelte';
  import { relativeTime } from '../lib/time';
  import { t } from '../lib/i18n.svelte';
  import ListenRow from './ListenRow.svelte';

  function handleClear() {
    if (confirm(t('history.clearConfirm'))) {
      clearHistory();
    }
  }
</script>

<section class="card">
  <div class="mb-3 flex items-center justify-between gap-2">
    <h2 class="text-sm font-semibold uppercase tracking-wide t-sub">
      {t('history.title')}
    </h2>
    {#if store.history.length > 0}
      <button
        type="button"
        class="btn-icon"
        title={t('history.clear')}
        aria-label={t('history.clear')}
        onclick={handleClear}
      >
        <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M3 6h18" />
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
          <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
          <line x1="10" y1="11" x2="10" y2="17" />
          <line x1="14" y1="11" x2="14" y2="17" />
        </svg>
      </button>
    {/if}
  </div>

  {#if store.history.length === 0}
    <p class="text-sm t-faint">
      {t('history.empty')}
    </p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each store.history as item (item.id)}
        <li class="rounded-xl border bd-soft bg-surface p-3">
          <div class="flex items-start gap-2.5">
            <svg viewBox="0 0 24 24" class="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
            <ListenRow
              track={item.track}
              artist={item.artist}
              album={item.album}
              time={`${t('history.listened')} ${relativeTime(item.listenedAt)}`}
            />
          </div>
        </li>
      {/each}
    </ul>
  {/if}
</section>