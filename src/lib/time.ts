import { settings } from './settings.svelte';
import { t } from './i18n.svelte';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const mo = pad2(d.getMonth() + 1);
  const da = pad2(d.getDate());
  switch (settings.dateFormat) {
    case 'DD/MM/YYYY':
      return `${da}/${mo}/${y}`;
    case 'YYYY-MM-DD':
      return `${y}-${mo}-${da}`;
    default:
      return `${mo}/${da}/${y}`;
  }
}

function formatClock(d: Date): string {
  const h = d.getHours();
  const m = d.getMinutes();
  if (settings.timeFormat === '24') return `${pad2(h)}:${pad2(m)}`;
  const period = h < 12 ? 'AM' : 'PM';
  const hour = h % 12 || 12;
  return `${hour}:${pad2(m)} ${period}`;
}

export function nowEpoch(): number {
  return Math.floor(Date.now() / 1000);
}

export interface TimePreset {
  key: string;
  offset: number;
}

export const TIME_PRESETS: TimePreset[] = [
  { key: 'time.now', offset: 0 },
  { key: 'time.min5', offset: 300 },
  { key: 'time.min15', offset: 900 },
  { key: 'time.min30', offset: 1800 },
  { key: 'time.hour1', offset: 3600 },
  { key: 'time.hours3', offset: 10800 },
  { key: 'time.hours6', offset: 21600 },
  { key: 'time.hours12', offset: 43200 },
  { key: 'time.yesterday', offset: 86400 },
];

export function presetOffset(key: string): number {
  return TIME_PRESETS.find((p) => p.key === key)?.offset ?? 0;
}

export function toDateTimeLocal(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` +
    `T${pad(d.getHours())}:${pad(d.getMinutes())}`
  );
}

export function fromDateTimeLocal(value: string): number {
  const ms = new Date(value).getTime();
  if (Number.isNaN(ms)) throw new Error('Invalid date and time');
  return Math.floor(ms / 1000);
}

export function formatTime(epochSec: number): string {
  const d = new Date(epochSec * 1000);
  return `${formatDate(d)}, ${formatClock(d)}`;
}

export function relativeTime(epochSec: number): string {
  const ago = (key: string, n?: number) =>
    n === undefined ? t(key) : t(key).replace('{n}', String(n));
  const diff = nowEpoch() - epochSec;
  if (diff < 60) return ago('time.momentAgo');
  if (diff < 3600) return ago('time.agoMin', Math.floor(diff / 60));
  if (diff < 86400) return ago('time.agoH', Math.floor(diff / 3600));
  if (diff < 86400 * 7) return ago('time.agoD', Math.floor(diff / 86400));
  return formatTime(epochSec);
}

export function toErrorMessage(e: unknown): string {
  if (e instanceof Error) return e.message;
  return String(e);
}