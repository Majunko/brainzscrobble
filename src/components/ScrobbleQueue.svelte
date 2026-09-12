<script lang="ts">
  import { removeItem, retryItem, store, submitBatch } from '../lib/store.svelte';
  import { formatTime } from '../lib/time';
  import { t } from '../lib/i18n.svelte';
  import ListenRow from './ListenRow.svelte';

  const total = $derived(
    store.queue.filter((i) => i.status === 'pending' || i.status === 'error')
      .length,
  );
  let error = $state<string | null>(null);

  async function handleBatch() {
    error = null;
    const res = await submitBatch();
    if (res.fail > 0) {
      error = t('queue.batchFail').replace('{n}', String(res.fail));
    }
  }
</script>

<section class="card">
  <div class="mb-3 flex items-center justify-between gap-2">
    <h2 class="text-sm font-semibold uppercase tracking-wide t-sub">
      {t('queue.title')}
    </h2>
    <span class="badge bg-surface2 t-soft">{store.queue.length}</span>
  </div>

  {#if store.queue.length === 0}
    <p class="text-sm t-faint">
      {t('queue.empty')}
    </p>
  {:else}
    <ul class="flex flex-col gap-2">
      {#each store.queue as item (item.id)}
        <li
          class="rounded-xl border bd-soft bg-surface p-3
            {item.status === 'error' ? 'border-[var(--err-bd)]' : ''}"
        >
          <div class="flex items-start justify-between gap-3">
            <ListenRow
              track={item.track}
              artist={item.artist}
              album={item.album}
              time={formatTime(item.listenedAt)}
              error={item.error}
            />
            <div class="flex shrink-0 items-center gap-1">
              {#if item.status === 'pending'}
                <span class="badge-amber badge">{t('queue.queued')}</span>
              {:else}
                <span class="badge-err badge">{t('queue.error')}</span>
                <button
                  type="button"
                  class="btn-icon"
                  aria-label={t('queue.retry')}
                  title={t('queue.retry')}
                  onclick={() => retryItem(item.id)}
                >
                  <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M23 4v6h-6" />
                    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                  </svg>
                </button>
              {/if}
              <button
                type="button"
                class="btn-icon"
                aria-label={t('queue.remove')}
                title={t('queue.remove')}
                onclick={() => removeItem(item.id)}
              >
                <svg viewBox="0 0 24 24" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </li>
      {/each}
    </ul>

    {#if error}
      <p class="msg-err mt-3">{error}</p>
    {/if}

    <button
      type="button"
      class="btn-primary mt-4 w-full"
      onclick={handleBatch}
      disabled={store.batchBusy || total === 0}
    >
      {#if store.batchBusy}
        <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
          <path class="opacity-90" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
        </svg>
        {t('queue.submitting')}
      {:else}
        {t('queue.submitBatch').replace('{n}', String(total))}
      {/if}
    </button>
  {/if}
</section>