import { escapeHtml } from '../learning-annotations.js';

export function renderFavoriteSyncControls({
  favoriteCount = 0,
  syncText = '',
  syncMessage = '',
  syncMessageKind = 'info',
} = {}) {
  return `
    <section class="favorite-sync-panel" aria-label="收藏题号同步">
      <div class="favorite-sync-panel__head">
        <strong>收藏同步</strong>
        <small>手机 ↔ 电脑</small>
      </div>
      <div class="favorite-sync-panel__actions">
        <button
          class="secondary-btn"
          type="button"
          data-action="export-favorites"
          ${favoriteCount === 0 ? 'disabled' : ''}
        >
          导出题号
        </button>
        <button
          class="secondary-btn"
          type="button"
          data-action="import-favorites"
        >
          导入题号
        </button>
      </div>
      ${syncText ? `
        <textarea
          class="favorite-sync-panel__output"
          data-favorite-sync-output
          readonly
          rows="5"
        >${escapeHtml(syncText)}</textarea>
      ` : ''}
      <textarea
        class="favorite-sync-panel__input"
        data-favorite-sync-input
        rows="3"
        placeholder="粘贴手机发来的收藏文本，或输入 10,39,120"
      ></textarea>
      ${syncMessage ? `
        <p class="favorite-sync-panel__message is-${escapeHtml(syncMessageKind)}">
          ${escapeHtml(syncMessage)}
        </p>
      ` : ''}
    </section>
  `;
}

