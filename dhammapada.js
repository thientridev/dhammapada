/* ==========================================================================
   🌸 DHAMMAPADA EBOOK & PRINT ENGINE (JS V6.3 - FULLSCREEN & QUICK JUMP & FADE)
   REPOSITORY: thientridev/dhammapada
   ========================================================================== */

(function() {
  const CHAPTERS_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada_chapters.json";
  const VERSES_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada_verses.json";
  const LOI_TUA_AUDIO = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/audio/00LoiTua.mp3";

  let chapters = [];
  let verses = [];
  let pages = [];
  let currentIndex = 0;

  let globalAudio = new Audio();
  let currentAudioUrl = "";
  let isAudioPlaying = false;
  let activeAudioTitle = "";

  function cleanText(str) {
    return (str || '').normalize('NFC').trim();
  }

  function formatTime(seconds) {
    if (isNaN(seconds)) return "00:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  function toggleAudio(url, title) {
    if (!url) return;

    if (currentAudioUrl === url) {
      if (globalAudio.paused) {
        globalAudio.play();
        isAudioPlaying = true;
      } else {
        globalAudio.pause();
        isAudioPlaying = false;
      }
    } else {
      globalAudio.src = url;
      currentAudioUrl = url;
      activeAudioTitle = title || "Kinh Pháp Cú";
      globalAudio.play().then(() => {
        isAudioPlaying = true;
      }).catch(e => console.log("Audio Play Error:", e));
    }
    updateAudioUI();
  }

  function updateAudioUI() {
    const playIcons = document.querySelectorAll('.dhp-audio-icon');
    playIcons.forEach(icon => {
      icon.textContent = isAudioPlaying ? "⏸" : "▶";
    });

    const dock = document.getElementById('dhp-header-audio-dock');
    const dockTitle = document.getElementById('dhp-dock-title');
    if (dock && dockTitle) {
      if (currentAudioUrl && isAudioPlaying) {
        dock.style.display = 'inline-flex';
        dockTitle.textContent = activeAudioTitle;
      } else if (!isAudioPlaying) {
        dock.style.display = 'none';
      }
    }
  }

  globalAudio.addEventListener('timeupdate', () => {
    const sliders = document.querySelectorAll('.dhp-audio-slider');
    const timeLabels = document.querySelectorAll('.dhp-audio-time');
    const cur = globalAudio.currentTime;
    const dur = globalAudio.duration || 0;

    sliders.forEach(s => {
      s.max = dur;
      s.value = cur;
    });

    timeLabels.forEach(t => {
      t.textContent = `${formatTime(cur)} / ${formatTime(dur)}`;
    });
  });

  globalAudio.addEventListener('play', () => { isAudioPlaying = true; updateAudioUI(); });
  globalAudio.addEventListener('pause', () => { isAudioPlaying = false; updateAudioUI(); });
  globalAudio.addEventListener('ended', () => { isAudioPlaying = false; updateAudioUI(); });

  async function compressImageForPrint(url, targetWidth = 800, targetHeight = 1060) {
    return new Promise((resolve) => {
      if (!url) return resolve('');
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = targetWidth;
          canvas.height = targetHeight;
          const ctx = canvas.getContext('2d');
          ctx.imageSmoothingEnabled = true;
          ctx.imageSmoothingQuality = 'high';
          ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.82);
          resolve(dataUrl);
        } catch (e) {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  }

  function showToast(msg) {
    let t = document.getElementById('dhp-compress-toast');
    if (!t) {
      t = document.createElement('div');
      t.id = 'dhp-compress-toast';
      document.body.appendChild(t);
    }
    t.innerHTML = `<span style="font-size: 16px;">🌸</span> <span>${msg}</span>`;
    t.style.display = 'flex';
  }

  function hideToast() {
    const t = document.getElementById('dhp-compress-toast');
    if (t) t.style.display = 'none';
  }

  function forceA5LandscapePrint() {
    try {
      Array.from(document.styleSheets).forEach(sheet => {
        try {
          const rules = sheet.cssRules || sheet.rules;
          if (rules) {
            for (let i = rules.length - 1; i >= 0; i--) {
              if (rules[i].type === CSSRule.PAGE_RULE || (rules[i].cssText && rules[i].cssText.includes('@page'))) {
                sheet.deleteRule(i);
              }
            }
          }
        } catch(e) {}
      });
    } catch(e) {}

    let style = document.getElementById('dhp-force-print-landscape');
    if (!style) {
      style = document.createElement('style');
      style.id = 'dhp-force-print-landscape';
      document.head.appendChild(style);
    }
    style.innerHTML = `
      @page {
        size: a5 landscape !important;
        margin: 0mm !important;
      }
    `;
  }

  function setupWorkspace() {
    let ws = document.getElementById('dhp-master-workspace');
    if (!ws) {
      ws = document.createElement('div');
      ws.id = 'dhp-master-workspace';
      document.body.appendChild(ws);
    }

    let pm = document.getElementById('dhp-print-mount');
    if (!pm) {
      pm = document.createElement('div');
      pm.id = 'dhp-print-mount';
      document.body.appendChild(pm);
    }

    document.documentElement.classList.add('dhp-active');
    document.body.classList.add('dhp-active');

    Array.from(document.body.children).forEach((child) => {
      if (child.id !== 'dhp-master-workspace' && child.id !== 'dhp-print-mount' && child.id !== 'dhp-compress-toast' && !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) {
        child.style.display = 'none';
      }
    });

    ws.innerHTML = `
      <!-- HEADER CONTROLLER -->
      <div class="dhp-ctrl-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 7px 14px; background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 12px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); flex-shrink: 0; position: relative;">
        <!-- LOGO VỀ BÌA SÁCH CHÍNH -->
        <div style="display: flex; align-items: center; gap: 10px;">
          <div id="dhp-brand-btn" title="Bấm để về Trang Bìa Sách Chính" style="display: flex; align-items: center; gap: 6px;">
            <span style="background: #d97706; color: #fff; padding: 2px 7px; border-radius: 6px; font-weight: 900; font-size: 11px;">EDEVX</span>
            <span class="dhp-hide-mobile" style="font-weight: bold; color: #fde68a; font-size: 12.5px;">KINH PHÁP CÚ</span>
          </div>

          <div id="dhp-header-audio-dock">
            <span id="dhp-dock-title" style="font-weight: bold;">Đang nghe...</span>
            <button id="dhp-dock-toggle" style="background: #d97706; border: none; color: #fff; border-radius: 50%; width: 20px; height: 20px; font-size: 9px; cursor: pointer; display: flex; align-items: center; justify-content: center;">⏸</button>
          </div>
        </div>

        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="dhp-chapter-select" style="background: #0f172a; color: #fde68a; border: 1px solid #d97706; border-radius: 8px; padding: 4px 6px; font-size: 11.5px; outline: none; cursor: pointer; max-width: 180px;">
            <option>Đang nạp dữ liệu...</option>
          </select>

          <!-- 🌸 1. NÚT TOÀN MÀN HÌNH (FULLSCREEN MODE) -->
          <button id="dhp-fullscreen-btn" style="background: #1e293b; color: #fde68a; border: 1px solid #475569; padding: 5px 10px; border-radius: 8px; cursor: pointer; font-size: 11px; font-weight: bold; display: flex; align-items: center; gap: 4px;" title="Bật/Tắt Toàn Màn Hình">
            ⛶ <span class="dhp-hide-mobile">Toàn màn</span>
          </button>
          
          <!-- MENU IN SÁCH -->
          <div id="dhp-print-menu-container" style="position: relative;">
            <button id="dhp-print-menu-btn" style="background: linear-gradient(135deg, #d97706, #b45309); color: #fff; font-weight: bold; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              🖨️ <span>IN SÁCH A5</span> <span style="font-size: 9px;">▼</span>
            </button>
            <div id="dhp-print-dropdown" class="dhp-dropdown-menu hidden">
              <div id="dhp-print-current-btn" class="dhp-dropdown-item">📄 In Trang Này (Siêu nhẹ < 200KB)</div>
              <div id="dhp-print-chapter-btn" class="dhp-dropdown-item" style="color: #6ee7b7;">⚡ In Phẩm Này (~2MB - Nhanh &amp; Nét ⭐)</div>
              <div id="dhp-print-all-btn" class="dhp-dropdown-item">📚 In Toàn Bộ Sách (450 trang)</div>
            </div>
          </div>
        </div>
      </div>

      <!-- TỜ GIẤY CHỨA NỘI DUNG -->
      <div id="dhp-canvas-container">
        <div class="dhp-paper-a5" id="dhp-paper-box">
          <div style="padding: 40px; text-align: center; color: #d97706; font-size: 14px; font-family: sans-serif; font-weight: bold;">
            Đang nạp 423 bài kệ từ GitHub CDN...
          </div>
        </div>
      </div>

      <!-- FOOTER PAGINATION -->
      <div class="dhp-ctrl-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 7px 14px; background: rgba(30, 41, 59, 0.95); border: 1px solid #334155; border-radius: 12px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px; flex-shrink: 0;">
        <button id="dhp-prev-btn" style="background: #0f172a; color: #fde68a; border: 1px solid #475569; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11.5px; white-space: nowrap;">
          ⬅ <span class="dhp-hide-mobile">Trước</span>
        </button>

        <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1; max-width: 440px; margin: 0 10px;">
          <input type="range" id="dhp-slider" min="0" max="449" value="0" style="width: 100%; accent-color: #d97706; cursor: pointer;" />
          <span id="dhp-page-num" style="font-family: monospace; font-weight: bold; color: #fde68a; min-width: 55px; text-align: right; font-size: 12px;">1/450</span>
          
          <!-- 🌸 2. Ô NHẬP NHẢY ĐẾN SỐ KỆ NHANH (QUICK JUMP INPUT) -->
          <div style="display: flex; align-items: center; gap: 4px; border-left: 1px solid #475569; padding-left: 8px;">
            <input type="number" id="dhp-jump-input" placeholder="Kệ..." min="1" max="423" style="width: 50px; background: #0f172a; border: 1px solid #d97706; color: #fde68a; border-radius: 6px; padding: 3px 4px; font-size: 11px; text-align: center; outline: none;" title="Gõ số Kệ (1 - 423) rồi bấm Enter" />
          </div>
        </div>

        <button id="dhp-next-btn" style="background: #0f172a; color: #fde68a; border: 1px solid #475569; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11.5px; white-space: nowrap;">
          <span class="dhp-hide-mobile">Sau</span> ➡
        </button>
      </div>
    `;

    bindEvents();
  }

  function buildPrintPageHtml(p, compressedImgUrl = '') {
    if (p.type === 'main_cover') {
      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card" style="align-items: center; text-align: center; justify-content: space-between;">
            <img src="https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/images/hinhnen02.webp" style="position: absolute; bottom: 5mm; left: 50%; transform: translateX(-50%); width: 85mm; height: 60mm; opacity: 0.15; z-index: 0; pointer-events: none;" />

            <div style="width: 100%; padding-top: 2mm; position: relative; z-index: 10;">
              <div style="font-size: 12px; letter-spacing: 6px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm;">DHAMMAPADA</div>
              <div style="font-size: 32px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 2mm;">KINH PHÁP CÚ</div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 3mm 0;">
                <div style="height: 1.2px; width: 45px; background: #b45309;"></div>
                <span style="color: #d97706; font-size: 15px;">☸</span>
                <div style="height: 1.2px; width: 45px; background: #b45309;"></div>
              </div>
              <div style="font-size: 12px; font-weight: bold; color: #78350f; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 4mm;">
                TUYỂN TẬP 423 BÀI KỆ TRANH MINH HỌA MÀU
              </div>
              <div style="font-size: 11.5px; line-height: 1.6; color: #334155; font-style: italic; max-width: 140mm; margin: 0 auto;">
                “Tâm dẫn đầu mọi pháp, Tâm làm chủ, tâm tạo;<br/>Nếu với tâm thanh tịnh, Nói lên hay hành động,<br/>An lạc bước theo sau, Như bóng không rời hình.”
              </div>
            </div>
            
            <div style="width: 100%; display: flex; justify-content: space-around; align-items: center; border-top: 1px dashed rgba(217, 119, 6, 0.4); padding-top: 3mm; font-family: system-ui, sans-serif; position: relative; z-index: 10;">
              <div style="text-align: center;">
                <span style="font-size: 8.5px; text-transform: uppercase; color: #b45309; font-weight: bold; display: block;">Việt Dịch</span>
                <b style="font-size: 11px; color: #0f172a;">HT. Thích Minh Châu</b>
              </div>
              <div style="height: 18px; width: 1px; background: rgba(217, 119, 6, 0.3);"></div>
              <div style="text-align: center;">
                <span style="font-size: 8.5px; text-transform: uppercase; color: #b45309; font-weight: bold; display: block;">Tranh Minh Họa</span>
                <b style="font-size: 11px; color: #0f172a;">Piyadhasa Wickramanayake</b>
              </div>
            </div>
          </div>
        </div>
      `;
    } else if (p.type === 'cover') {
      const c = p.data;
      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card" style="align-items: center; text-align: center; justify-content: space-between;">
            <img src="https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/images/hinhnen01.webp" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 125mm; height: 125mm; opacity: 0.12; z-index: 0; pointer-events: none; object-fit: contain;" />

            <div style="flex-shrink: 0; padding-top: 1mm; position: relative; z-index: 10;">
              <div style="font-size: 11px; letter-spacing: 4px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm;">${cleanText(c.chapter_pali)}</div>
              <div style="font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">${cleanText(c.chapter_roman)}. ${cleanText(c.chapter_vi)}</div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 2mm 0;">
                <div style="height: 1px; width: 40px; background: #b45309;"></div>
                <span style="color: #d97706; font-size: 13px;">☸</span>
                <div style="height: 1px; width: 40px; background: #b45309;"></div>
              </div>
            </div>

            <div style="flex-grow: 1; display: flex; align-items: center; justify-content: center; padding: 0 10mm; position: relative; z-index: 10; background: transparent;">
              <div style="font-size: 13.5px; line-height: 1.75; color: #1e293b; font-style: italic; text-align: justify; text-align-last: center; max-width: 150mm; background: transparent;">
                “${cleanText(c.intro_vi)}”
              </div>
            </div>

            <div style="flex-shrink: 0; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 0.8px solid rgba(217, 119, 6, 0.4); padding-top: 2.5mm; font-family: system-ui, sans-serif; font-size: 10px; color: #64748b; position: relative; z-index: 10; background: transparent;">
              <span>🌸 <i>Kinh Pháp Cú Tranh Minh Họa</i></span>
              <span style="border: 1px solid #d97706; color: #92400e; font-weight: bold; padding: 1.5px 8px; border-radius: 99px; background: transparent;">
                ${c.verse_count} Bài Kệ: Kệ ${c.verse_range}
              </span>
              <span>Trang Bìa Phẩm ${c.chapter_roman}</span>
            </div>
          </div>
        </div>
      `;
    } else {
      const v = p.data;
      const chap = p.chapter;
      const imgSrc = compressedImgUrl || v.image_url;

      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card">
            <div class="dhp-grid-container">
              <div class="dhp-image-col">
                <img src="${imgSrc}" alt="Kệ ${v.verse_no}" />
              </div>
              <div class="dhp-text-col" style="position: relative;">
                <img src="https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/images/hinhnen02.webp" style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 80mm; height: 80mm; opacity: 0.12; z-index: 0; pointer-events: none; object-fit: contain;" />

                <div style="position: relative; z-index: 10; background: transparent;">
                  <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #fed7aa; padding-bottom: 1.5mm; margin-bottom: 1.5mm; font-family: system-ui, sans-serif;">
                    <span style="font-size: 13px; font-weight: 900; color: #b45309;">KỆ SỐ ${cleanText(v.verse_no)}</span>
                    <span style="font-size: 10px; color: #64748b; font-style: italic; font-weight: bold;">${cleanText(chap.chapter_vi)}</span>
                  </div>
                  <div style="font-size: 12px; line-height: 1.38; font-weight: bold; color: #0f172a; white-space: pre-line; margin-bottom: 1.5mm;">${cleanText(v.verse_vi)}</div>
                  <div class="dhp-pali-box" style="margin-bottom: 1.5mm; background: transparent;">
                    <div style="font-size: 10.5px; line-height: 1.34; font-style: italic; white-space: pre-line; font-weight: 600;">${cleanText(v.verse_pali)}</div>
                  </div>
                </div>

                <div style="position: relative; z-index: 10; background: transparent;">
                  <div style="font-size: 10.8px; line-height: 1.4; color: #0f172a; text-align: justify; border-top: 1px dashed #cbd5e1; padding-top: 1.5mm;">
                    <b style="color: #92400e;">Dịch nghĩa:</b> ${cleanText(v.meaning_vi)}
                  </div>
                  <div style="display: flex; justify-content: space-between; align-items: center; font-size: 8.5px; font-family: system-ui, sans-serif; border-top: 0.8px solid #e2e8f0; padding-top: 1mm; margin-top: 1.5mm; color: #94a3b8;">
                    <span>Dhammapada Verse ${cleanText(v.verse_no)}</span>
                    <span>${cleanText(chap.chapter_vi)}</span>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </div>
      `;
    }
  }

  function bindEvents() {
    const prev = () => { if (currentIndex > 0) { currentIndex--; renderPage(); } };
    const next = () => { if (currentIndex < pages.length - 1) { currentIndex++; renderPage(); } };

    document.getElementById('dhp-prev-btn').onclick = prev;
    document.getElementById('dhp-next-btn').onclick = next;
    document.getElementById('dhp-slider').oninput = (e) => { currentIndex = parseInt(e.target.value, 10); renderPage(); };
    
    // CLICK LOGO VỀ BÌA SÁCH CHÍNH
    const brandBtn = document.getElementById('dhp-brand-btn');
    if (brandBtn) {
      brandBtn.onclick = () => {
        currentIndex = 0;
        renderPage();
      };
    }

    // 🌸 1. SỰ KIỆN NÚT TOÀN MÀN HÌNH (FULLSCREEN TOGGLE)
    const fsBtn = document.getElementById('dhp-fullscreen-btn');
    if (fsBtn) {
      fsBtn.onclick = () => {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(err => console.log(err));
        } else {
          if (document.exitFullscreen) document.exitFullscreen();
        }
      };
    }

    document.addEventListener('fullscreenchange', () => {
      const btn = document.getElementById('dhp-fullscreen-btn');
      if (btn) {
        btn.innerHTML = document.fullscreenElement ? '🗗 <span class="dhp-hide-mobile">Thu nhỏ</span>' : '⛶ <span class="dhp-hide-mobile">Toàn màn</span>';
      }
    });

    // 🌸 2. SỰ KIỆN Ô NHẬP NHẢY NHANH SỐ KỆ (ENTER ĐỂ BAY TỚI KỆ ĐÓ)
    const jumpInput = document.getElementById('dhp-jump-input');
    if (jumpInput) {
      jumpInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const val = parseInt(jumpInput.value, 10);
          if (!isNaN(val) && val >= 1 && val <= 423) {
            // Tìm trang bài kệ có số kệ tương ứng
            const targetIdx = pages.findIndex(p => p.type === 'verse' && parseInt(p.data.verse_no, 10) === val);
            if (targetIdx !== -1) {
              currentIndex = targetIdx;
              renderPage();
              jumpInput.value = '';
              jumpInput.blur();
            }
          }
        }
      });
    }

    // Toggle Audio Dock trên Header
    const dockBtn = document.getElementById('dhp-dock-toggle');
    if (dockBtn) {
      dockBtn.onclick = () => {
        if (isAudioPlaying) {
          globalAudio.pause();
        } else if (currentAudioUrl) {
          globalAudio.play();
        }
      };
    }

    document.getElementById('dhp-chapter-select').onchange = (e) => {
      const val = e.target.value;
      if (val === 'main_cover') {
        currentIndex = 0;
      } else {
        const cId = parseInt(val, 10);
        const target = pages.findIndex(p => p.type === 'cover' && p.data.chapter_id === cId);
        if (target !== -1) { currentIndex = target; }
      }
      renderPage();
    };

    const printMenuBtn = document.getElementById('dhp-print-menu-btn');
    const printDropdown = document.getElementById('dhp-print-dropdown');

    if (printMenuBtn && printDropdown) {
      printMenuBtn.onclick = (e) => {
        e.stopPropagation();
        printDropdown.classList.toggle('hidden');
      };
      document.addEventListener('click', () => printDropdown.classList.add('hidden'));
    }

    // 1. In 1 Trang Hiện Tại
    document.getElementById('dhp-print-current-btn').onclick = async () => {
      showToast('Đang chuẩn bị trang in...');
      forceA5LandscapePrint();
      const cur = pages[currentIndex];
      let compImg = '';
      if (cur.type === 'verse') {
        compImg = await compressImageForPrint(cur.data.image_url);
      }
      const pm = document.getElementById('dhp-print-mount');
      pm.innerHTML = buildPrintPageHtml(cur, compImg);
      hideToast();
      setTimeout(() => window.print(), 50);
    };

    // 2. In Phẩm Hiện Tại
    document.getElementById('dhp-print-chapter-btn').onclick = async () => {
      forceA5LandscapePrint();
      const cur = pages[currentIndex];
      let targetChapterId = 1;
      if (cur.type === 'verse') targetChapterId = cur.chapter.chapter_id;
      else if (cur.type === 'cover') targetChapterId = cur.data.chapter_id;

      const chapPages = pages.filter(p => (p.type === 'cover' && p.data.chapter_id === targetChapterId) || (p.type === 'verse' && p.chapter.chapter_id === targetChapterId));
      const totalImgs = chapPages.filter(p => p.type === 'verse').length;

      showToast(`Đang tối ưu nén ${totalImgs} ảnh in xuất bản...`);

      const compImgs = await Promise.all(
        chapPages.map(p => p.type === 'verse' ? compressImageForPrint(p.data.image_url) : Promise.resolve(''))
      );

      const pm = document.getElementById('dhp-print-mount');
      pm.innerHTML = chapPages.map((p, idx) => buildPrintPageHtml(p, compImgs[idx])).join('');
      hideToast();
      setTimeout(() => window.print(), 80);
    };

    // 3. In Toàn Bộ 450 Trang Sách
    document.getElementById('dhp-print-all-btn').onclick = async () => {
      forceA5LandscapePrint();
      showToast('Đang nạp và nén 423 ảnh in toàn sách (vui lòng chờ vài giây)...');

      const pm = document.getElementById('dhp-print-mount');
      const compImgs = [];
      const batchSize = 25;
      for (let i = 0; i < pages.length; i += batchSize) {
        const batch = pages.slice(i, i + batchSize);
        showToast(`Đang nén ảnh in: ${Math.min(i + batchSize, pages.length)} / ${pages.length}...`);
        const batchResults = await Promise.all(
          batch.map(p => p.type === 'verse' ? compressImageForPrint(p.data.image_url) : Promise.resolve(''))
        );
        compImgs.push(...batchResults);
      }

      pm.innerHTML = pages.map((p, idx) => buildPrintPageHtml(p, compImgs[idx])).join('');
      hideToast();
      setTimeout(() => window.print(), 200);
    };

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { next(); }
      if (e.key === 'ArrowLeft') { prev(); }
    });

    let touchStartX = 0, touchStartY = 0;
    let touchEndX = 0, touchEndY = 0;
    const scrollContainer = document.getElementById('dhp-canvas-container');

    scrollContainer.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].screenX;
      touchStartY = e.changedTouches[0].screenY;
    }, { passive: true });

    scrollContainer.addEventListener('touchend', (e) => {
      touchEndX = e.changedTouches[0].screenX;
      touchEndY = e.changedTouches[0].screenY;
      const deltaX = touchEndX - touchStartX;
      const deltaY = touchEndY - touchStartY;
      if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
        if (deltaX < 0) next();
        else prev();
      }
    }, { passive: true });
  }

  async function loadData() {
    try {
      const [cRes, vRes] = await Promise.all([fetch(CHAPTERS_URL), fetch(VERSES_URL)]);
      chapters = await cRes.json();
      verses = await vRes.json();

      pages = [{ type: 'main_cover' }];

      chapters.forEach(chap => {
        pages.push({ type: 'cover', data: chap });
        const vList = verses.filter(v => v.chapter_id === chap.chapter_id);
        vList.forEach(v => pages.push({ type: 'verse', data: v, chapter: chap }));
      });

      const sel = document.getElementById('dhp-chapter-select');
      let optionsHtml = `<option value="main_cover">📖 Bìa Sách Chính</option>`;
      optionsHtml += chapters.map(c => `<option value="${c.chapter_id}">Phẩm ${c.chapter_roman}: ${cleanText(c.chapter_vi)}</option>`).join('');
      sel.innerHTML = optionsHtml;

      renderPage();
    } catch (e) {
      console.error(e);
    }
  }

  function renderPage() {
    const paperBox = document.getElementById('dhp-paper-box');
    const scrollContainer = document.getElementById('dhp-canvas-container');
    const page = pages[currentIndex];
    if (!page || !paperBox) return;

    // 🌸 3. HIỆU ỨNG CHUYỂN TRANG MỜ NHẸ (MICRO FADE-IN 0.15S)
    paperBox.classList.add('dhp-page-fading');
    setTimeout(() => {
      paperBox.classList.remove('dhp-page-fading');
    }, 50);

    if (scrollContainer) scrollContainer.scrollTop = 0;

    document.getElementById('dhp-page-num').textContent = `${currentIndex + 1}/${pages.length}`;
    document.getElementById('dhp-slider').value = currentIndex;
    document.getElementById('dhp-slider').max = pages.length - 1;

    // Đồng bộ mục lục Dropdown
    const sel = document.getElementById('dhp-chapter-select');
    if (sel) {
      if (page.type === 'main_cover') {
        sel.value = 'main_cover';
      } else if (page.type === 'cover') {
        sel.value = page.data.chapter_id.toString();
      } else if (page.type === 'verse') {
        sel.value = page.chapter.chapter_id.toString();
      }
    }

    if (page.type === 'main_cover') {
      paperBox.innerHTML = `
        <div class="dhp-inner-card dhp-bg-cover-lotus" style="align-items: center; text-align: center; justify-content: space-between; padding: 20px 25px;">
          <div style="width: 100%; padding-top: 10px;">
            <div style="font-size: 13px; letter-spacing: 6px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 8px;">DHAMMAPADA</div>
            <div style="font-size: 34px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">KINH PHÁP CÚ</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0;">
              <div style="height: 1.5px; width: 70px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
              <span style="color: #d97706; font-size: 20px;">☸</span>
              <div style="height: 1.5px; width: 70px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
            </div>
            <div style="font-size: 13.5px; font-weight: bold; color: #78350f; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px;">
              TUYỂN TẬP 423 BÀI KỆ TRANH MINH HỌA MÀU
            </div>
            <div style="font-size: 12.5px; line-height: 1.65; color: #334155; font-style: italic; max-width: 520px; margin: 0 auto;">
              “Tâm dẫn đầu mọi pháp, Tâm làm chủ, tâm tạo;<br/>Nếu với tâm thanh tịnh, Nói lên hay hành động,<br/>An lạc bước theo sau, Như bóng không rời hình.”
            </div>

            <!-- 🎧 TRÌNH PHÁT AUDIO LỜI TỰA BÌA CHÍNH -->
            <div class="dhp-audio-box no-print">
              <button class="dhp-audio-btn" id="dhp-btn-main-audio" title="Nghe Lời Tựa">
                <span class="dhp-audio-icon">${isAudioPlaying && currentAudioUrl === LOI_TUA_AUDIO ? "⏸" : "▶"}</span>
              </button>
              <div class="dhp-audio-track">
                <span style="font-size: 11.5px; font-weight: bold; color: #78350f;">🎧 Nghe Lời Tựa</span>
                <input type="range" class="dhp-audio-slider" min="0" max="0" value="0" />
                <span class="dhp-audio-time">00:00 / 00:00</span>
              </div>
            </div>
          </div>

          <div style="width: 100%; display: flex; justify-content: space-around; align-items: center; border-top: 1.5px dashed rgba(217, 119, 6, 0.4); padding-top: 10px; font-family: system-ui, sans-serif;">
            <div style="text-align: center;">
              <span style="font-size: 10px; text-transform: uppercase; color: #b45309; font-weight: bold; letter-spacing: 1px; display: block; margin-bottom: 2px;">Việt Dịch</span>
              <b style="font-size: 13px; color: #0f172a;">Trưởng lão HT. Thích Minh Châu</b>
            </div>
            <div style="height: 22px; width: 1px; background: rgba(217, 119, 6, 0.3);"></div>
            <div style="text-align: center;">
              <span style="font-size: 10px; text-transform: uppercase; color: #b45309; font-weight: bold; letter-spacing: 1px; display: block; margin-bottom: 2px;">Tranh Minh Họa</span>
              <b style="font-size: 13px; color: #0f172a;">Họa sĩ Piyadhasa Wickramanayake</b>
            </div>
          </div>
        </div>
      `;

      document.getElementById('dhp-btn-main-audio').onclick = () => {
        toggleAudio(LOI_TUA_AUDIO, "Lời Tựa - Kinh Pháp Cú");
      };

    } else if (page.type === 'cover') {
      const c = page.data;
      const audioUrl = c.audio_url || "";
      const isCurrentPhapAm = currentAudioUrl === audioUrl;

      paperBox.innerHTML = `
        <div class="dhp-inner-card dhp-bg-buddha" style="align-items: center; text-align: center;">
          <div style="padding-top: 15px;">
            <div style="font-size: 13px; letter-spacing: 5px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 4px;">${cleanText(c.chapter_pali)}</div>
            <div style="font-size: 26px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px;">${cleanText(c.chapter_roman)}. ${cleanText(c.chapter_vi)}</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 8px 0;">
              <div style="height: 1.5px; width: 60px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
              <span style="color: #d97706; font-size: 18px;">☸</span>
              <div style="height: 1.5px; width: 60px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
            </div>
          </div>

          <div style="padding: 0 20px; max-width: 580px; font-size: 15px; line-height: 1.7; color: #1e293b; font-style: italic; text-align: justify; text-align-last: center; margin-top: 10px;">
            “${cleanText(c.intro_vi)}”
          </div>

          <!-- 🎧 TRÌNH PHÁT AUDIO CHO PHẨM NÀY -->
          ${audioUrl ? `
          <div class="dhp-audio-box no-print">
            <button class="dhp-audio-btn" id="dhp-btn-chap-audio" title="Nghe Tụng Phẩm ${c.chapter_roman}">
              <span class="dhp-audio-icon">${isAudioPlaying && isCurrentPhapAm ? "⏸" : "▶"}</span>
            </button>
            <div class="dhp-audio-track">
              <span style="font-size: 11.5px; font-weight: bold; color: #78350f;">🎧 Nghe Tụng Phẩm ${c.chapter_roman}</span>
              <input type="range" class="dhp-audio-slider" min="0" max="0" value="0" />
              <span class="dhp-audio-time">00:00 / 00:00</span>
            </div>
          </div>` : ''}

          <div style="padding-bottom: 4px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(217, 119, 6, 0.3); padding-top: 8px; font-family: system-ui, sans-serif; font-size: 11px; color: #64748b;">
            <span>🌸 <i>Kinh Pháp Cú</i></span>
            <span style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; font-weight: bold; padding: 2px 10px; border-radius: 99px; font-size: 11.5px;">
              ${c.verse_count} Bài Kệ: Kệ ${c.verse_range}
            </span>
            <span>Phẩm ${c.chapter_roman}</span>
          </div>
        </div>
      `;

      if (audioUrl) {
        document.getElementById('dhp-btn-chap-audio').onclick = () => {
          toggleAudio(audioUrl, `Phẩm ${c.chapter_roman}: ${cleanText(c.chapter_vi)}`);
        };
      }

    } else {
      const v = page.data;
      const chap = page.chapter;

      paperBox.innerHTML = `
        <div class="dhp-inner-card">
          <div class="dhp-grid-container">
            <!-- TRANH MINH HỌA (340px x 450px) -->
            <div class="dhp-image-col">
              <img src="${v.image_url}" alt="Kệ ${v.verse_no}" loading="lazy" />
            </div>

            <!-- CỘT CHỮ CHUẨN MẪU (380px x 450px) -->
            <div class="dhp-text-col">
              <div>
                <!-- TIÊU ĐỀ KỆ SỐ -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1.5px solid #fed7aa; padding-bottom: 2px; margin-bottom: 4px; font-family: system-ui, sans-serif;">
                  <span style="font-size: 16px; font-weight: 900; color: #b45309; letter-spacing: 0.5px;">KỆ SỐ ${cleanText(v.verse_no)}</span>
                  <span style="font-size: 11.5px; color: #64748b; font-style: italic; font-weight: 600;">${cleanText(chap.chapter_vi)}</span>
                </div>

                <!-- THƠ LỤC BÁT (CHUẨN 15PX) -->
                <div style="font-size: 15px; line-height: 1.38; font-weight: bold; color: #0f172a; white-space: pre-line; margin-bottom: 4px;">${cleanText(v.verse_vi)}</div>

                <!-- HỘP PĀLI (CHUẨN 12.5PX) -->
                <div class="dhp-pali-box" style="margin-bottom: 4px;">
                  <div style="font-size: 12.5px; line-height: 1.34; font-style: italic; white-space: pre-line; font-weight: 600;">${cleanText(v.verse_pali)}</div>
                </div>
              </div>

              <div>
                <!-- DỊCH NGHĨA (CHUẨN 13.2PX) -->
                <div style="font-size: 13.2px; line-height: 1.4; color: #0f172a; text-align: justify; border-top: 1.2px dashed #cbd5e1; padding-top: 5px;">
                  <b style="color: #92400e;">Dịch nghĩa:</b> ${cleanText(v.meaning_vi)}
                </div>

                <!-- FOOTER CARD -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 9.5px; font-family: system-ui, sans-serif; border-top: 1px solid #e2e8f0; padding-top: 3px; margin-top: 3px; color: #94a3b8;">
                  <span>Dhammapada Verse ${cleanText(v.verse_no)}</span>
                  <span>${cleanText(chap.chapter_vi)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }

    updateAudioUI();

    const activeSliders = document.querySelectorAll('.dhp-audio-slider');
    activeSliders.forEach(slider => {
      slider.oninput = (e) => {
        globalAudio.currentTime = e.target.value;
      };
    });
  }

  document.addEventListener("DOMContentLoaded", function() {
    setupWorkspace();
    loadData();
  });
})();