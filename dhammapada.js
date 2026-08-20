/* ==========================================================================
   🌸 DHAMMAPADA EBOOK & PRINT ENGINE (JS V5.2 - ULTRA LIGHTWEIGHT VECTOR PDF)
   REPOSITORY: thientridev/dhammapada
   ========================================================================== */

(function() {
  const CHAPTERS_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada_chapters.json";
  const VERSES_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@a00d585/dhammapada_verses.json";

  let chapters = [];
  let verses = [];
  let pages = [];
  let currentIndex = 0;

  function cleanText(str) {
    return (str || '').normalize('NFC').trim();
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
      if (child.id !== 'dhp-master-workspace' && child.id !== 'dhp-print-mount' && !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) {
        child.style.display = 'none';
      }
    });

    ws.innerHTML = `
      <!-- HEADER CONTROLLER -->
      <div class="dhp-ctrl-bar" style="display: flex; justify-content: space-between; align-items: center; padding: 7px 14px; background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 12px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5); flex-shrink: 0; position: relative;">
        <div style="display: flex; align-items: center; gap: 6px;">
          <span style="background: #d97706; color: #fff; padding: 2px 7px; border-radius: 6px; font-weight: 900; font-size: 11px;">EDEVX</span>
          <span class="dhp-hide-mobile" style="font-weight: bold; color: #fde68a; font-size: 12.5px;">KINH PHÁP CÚ</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="dhp-chapter-select" style="background: #0f172a; color: #fde68a; border: 1px solid #d97706; border-radius: 8px; padding: 4px 6px; font-size: 11.5px; outline: none; cursor: pointer; max-width: 190px;">
            <option>Đang nạp dữ liệu...</option>
          </select>
          
          <div id="dhp-print-menu-container" style="position: relative;">
            <button id="dhp-print-menu-btn" style="background: linear-gradient(135deg, #d97706, #b45309); color: #fff; font-weight: bold; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 11px; white-space: nowrap; display: flex; align-items: center; gap: 4px;">
              🖨️ <span>IN SÁCH A5</span> <span style="font-size: 9px;">▼</span>
            </button>
            <div id="dhp-print-dropdown" class="dhp-dropdown-menu hidden">
              <div id="dhp-print-current-btn" class="dhp-dropdown-item">📄 In Trang Này (1 trang A5)</div>
              <div id="dhp-print-chapter-btn" class="dhp-dropdown-item" style="color: #6ee7b7;">⚡ In Phẩm Này (Siêu nhẹ &amp; Nét ⭐)</div>
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
        <div style="display: flex; align-items: center; gap: 8px; flex-grow: 1; max-width: 380px; margin: 0 10px;">
          <input type="range" id="dhp-slider" min="0" max="449" value="0" style="width: 100%; accent-color: #d97706; cursor: pointer;" />
          <span id="dhp-page-num" style="font-family: monospace; font-weight: bold; color: #fde68a; min-width: 55px; text-align: right; font-size: 12px;">1/450</span>
        </div>
        <button id="dhp-next-btn" style="background: #0f172a; color: #fde68a; border: 1px solid #475569; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 11.5px; white-space: nowrap;">
          <span class="dhp-hide-mobile">Sau</span> ➡
        </button>
      </div>
    `;

    bindEvents();
  }

  function buildPrintPageHtml(p) {
    if (p.type === 'main_cover') {
      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card dhp-bg-cover-lotus" style="align-items: center; text-align: center; justify-content: space-between; padding: 6mm 10mm;">
            <div style="width: 100%; padding-top: 2mm;">
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
            <div style="width: 100%; display: flex; justify-content: space-around; align-items: center; border-top: 1px dashed rgba(217, 119, 6, 0.4); padding-top: 3mm; font-family: system-ui, sans-serif;">
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
      // 🌸 ĐƯA ĐOẠN TRÍCH VỀ CHÍNH GIỮA TÂM TRANG VỚI margin: auto 0;
      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card dhp-bg-buddha" style="align-items: center; text-align: center; justify-content: space-between; padding: 6mm 10mm;">
            <div style="padding-top: 2mm;">
              <div style="font-size: 11px; letter-spacing: 4px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 2mm;">${cleanText(c.chapter_pali)}</div>
              <div style="font-size: 22px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">${cleanText(c.chapter_roman)}. ${cleanText(c.chapter_vi)}</div>
              <div style="display: flex; align-items: center; justify-content: center; gap: 8px; margin: 3mm 0;">
                <div style="height: 1px; width: 40px; background: #b45309;"></div>
                <span style="color: #d97706; font-size: 13px;">☸</span>
                <div style="height: 1px; width: 40px; background: #b45309;"></div>
              </div>
            </div>

            <!-- NỘI DUNG TỰ CĂN CHÍNH GIỮA KHUNG IN -->
            <div style="padding: 0 8mm; max-width: 155mm; font-size: 13.5px; line-height: 1.75; color: #1e293b; font-style: italic; text-align: justify; text-align-last: center; margin: auto 0;">
              “${cleanText(c.intro_vi)}”
            </div>

            <div style="width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 0.8px solid rgba(217, 119, 6, 0.4); padding-top: 2.5mm; font-family: system-ui, sans-serif; font-size: 10px; color: #64748b;">
              <span>🌸 <i>Kinh Pháp Cú Tranh Minh Họa</i></span>
              <span style="border: 1px solid #d97706; color: #92400e; font-weight: bold; padding: 1.5px 8px; border-radius: 99px;">
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

      return `
        <div class="dhp-print-page">
          <div class="dhp-inner-card">
            <div class="dhp-grid-container">
              <div class="dhp-image-col">
                <img src="${v.image_url}" alt="Kệ ${v.verse_no}" />
              </div>
              <div class="dhp-text-col">
                <div>
                  <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #fed7aa; padding-bottom: 1.5mm; margin-bottom: 1.5mm; font-family: system-ui, sans-serif;">
                    <span style="font-size: 13px; font-weight: 900; color: #b45309;">KỆ SỐ ${cleanText(v.verse_no)}</span>
                    <span style="font-size: 10px; color: #64748b; font-style: italic; font-weight: bold;">${cleanText(chap.chapter_vi)}</span>
                  </div>
                  <div style="font-size: 12px; line-height: 1.38; font-weight: bold; color: #0f172a; white-space: pre-line; margin-bottom: 1.5mm;">${cleanText(v.verse_vi)}</div>
                  <div class="dhp-pali-box" style="margin-bottom: 1.5mm;">
                    <div style="font-size: 10.5px; line-height: 1.34; font-style: italic; white-space: pre-line; font-weight: 600;">${cleanText(v.verse_pali)}</div>
                  </div>
                </div>
                <div>
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

    // 1. In 1 Trang Hiện Tại (Siêu nhẹ < 200KB)
    document.getElementById('dhp-print-current-btn').onclick = () => {
      forceA5LandscapePrint();
      const pm = document.getElementById('dhp-print-mount');
      pm.innerHTML = buildPrintPageHtml(pages[currentIndex]);
      setTimeout(() => window.print(), 100);
    };

    // 2. In Phẩm Hiện Tại (~2MB - Nhanh & Nét)
    document.getElementById('dhp-print-chapter-btn').onclick = () => {
      forceA5LandscapePrint();
      const cur = pages[currentIndex];
      let targetChapterId = 1;
      if (cur.type === 'verse') targetChapterId = cur.chapter.chapter_id;
      else if (cur.type === 'cover') targetChapterId = cur.data.chapter_id;

      const chapPages = pages.filter(p => (p.type === 'cover' && p.data.chapter_id === targetChapterId) || (p.type === 'verse' && p.chapter.chapter_id === targetChapterId));
      const pm = document.getElementById('dhp-print-mount');
      pm.innerHTML = chapPages.map(p => buildPrintPageHtml(p)).join('');
      setTimeout(() => window.print(), 150);
    };

    // 3. In Toàn Bộ 450 Trang Sách
    document.getElementById('dhp-print-all-btn').onclick = () => {
      forceA5LandscapePrint();
      const pm = document.getElementById('dhp-print-mount');
      pm.innerHTML = `<div style="text-align:center; padding: 20px; font-weight:bold; color:#d97706; font-size:16px;">Đang chuẩn bị 450 trang in A5...</div>`;
      
      setTimeout(() => {
        pm.innerHTML = pages.map(p => buildPrintPageHtml(p)).join('');
        setTimeout(() => window.print(), 400);
      }, 50);
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
    } else if (page.type === 'cover') {
      const c = page.data;
      paperBox.innerHTML = `
        <div class="dhp-inner-card dhp-bg-buddha" style="align-items: center; text-align: center;">
          <div style="padding-top: 18px;">
            <div style="font-size: 13px; letter-spacing: 5px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">${cleanText(c.chapter_pali)}</div>
            <div style="font-size: 26px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px;">${cleanText(c.chapter_roman)}. ${cleanText(c.chapter_vi)}</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0;">
              <div style="height: 1.5px; width: 60px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
              <span style="color: #d97706; font-size: 18px;">☸</span>
              <div style="height: 1.5px; width: 60px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
            </div>
          </div>
          <div style="padding: 0 20px; max-width: 580px; font-size: 15px; line-height: 1.7; color: #1e293b; font-style: italic; text-align: justify; text-align-last: center; margin-top: 15px;">
            “${cleanText(c.intro_vi)}”
          </div>
          <div style="padding-bottom: 4px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(217, 119, 6, 0.3); padding-top: 8px; font-family: system-ui, sans-serif; font-size: 11px; color: #64748b;">
            <span>🌸 <i>Kinh Pháp Cú</i></span>
            <span style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; font-weight: bold; padding: 2px 10px; border-radius: 99px; font-size: 11.5px;">
              ${c.verse_count} Bài Kệ: Kệ ${c.verse_range}
            </span>
            <span>Phẩm ${c.chapter_roman}</span>
          </div>
        </div>
      `;
    } else {
      const v = page.data;
      const chap = page.chapter;

      // 🌸 KHÓA CHUẨN ĐỒNG BỘ 100% CẢ 423 BÀI KỆ
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

                <!-- THƠ LỤC BÁT (CHUẨN 15PX - GIÃN DÒNG 1.38) -->
                <div style="font-size: 15px; line-height: 1.38; font-weight: bold; color: #0f172a; white-space: pre-line; margin-bottom: 4px;">${cleanText(v.verse_vi)}</div>

                <!-- HỘP PĀLI (CHUẨN 12.5PX - GIÃN DÒNG 1.34) -->
                <div class="dhp-pali-box" style="margin-bottom: 4px;">
                  <div style="font-size: 12.5px; line-height: 1.34; font-style: italic; white-space: pre-line; font-weight: 600;">${cleanText(v.verse_pali)}</div>
                </div>
              </div>

              <div>
                <!-- DỊCH NGHĨA (CHUẨN 13.2PX - GIÃN DÒNG 1.4) -->
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
  }

  document.addEventListener("DOMContentLoaded", function() {
    setupWorkspace();
    loadData();
  });
})();