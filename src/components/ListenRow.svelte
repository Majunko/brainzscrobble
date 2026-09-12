<script lang="ts">
  let {
    track,
    artist,
    album,
    time,
    error,
  }: {
    track: string;
    artist: string;
    album?: string;
    time: string;
    error?: string;
  } = $props();
</script>

<div class="min-w-0">
  <p class="truncate font-medium t-strong">{track}</p>
  <p class="truncate text-sm t-soft">
    {artist}
    {#if album}<span class="t-dim">· {album}</span>{/if}
  </p>
  <p class="mt-0.5 text-xs t-faint">{time}</p>
  {#if error}
    <p class="mt-1 text-xs text-[var(--err-fg)]">{error}</p>
  {/if}
</div>