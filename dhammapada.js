/* ==========================================================================
   🌸 DHAMMAPADA EBOOK & PRINT ENGINE (JS V3.2 - TYPOGRAPHY UPGRADE)
   REPOSITORY: thientridev/dhammapada
   ========================================================================== */

(function() {
  const CHAPTERS_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada_chapters.json";
  const VERSES_URL = "https://cdn.jsdelivr.net/gh/thientridev/dhammapada@main/dhammapada_verses.json";

  let chapters = [];
  let verses = [];
  let pages = [];
  let currentIndex = 0;

  // Khử sạch lỗi dấu tiếng Việt (NFD -> NFC)
  function cleanText(str) {
    return (str || '').normalize('NFC').trim();
  }

  // Khởi tạo phòng đọc toàn màn hình
  function setupWorkspace() {
    let ws = document.getElementById('dhp-master-workspace');
    if (!ws) {
      ws = document.createElement('div');
      ws.id = 'dhp-master-workspace';
      document.body.appendChild(ws);
    }

    document.documentElement.classList.add('dhp-active');
    document.body.classList.add('dhp-active');

    // Ẩn toàn bộ các thẻ khác của Blogger
    Array.from(document.body.children).forEach((child) => {
      if (child.id !== 'dhp-master-workspace' && child.id !== 'dhp-print-mount' && !['SCRIPT', 'STYLE', 'LINK'].includes(child.tagName)) {
        child.style.display = 'none';
      }
    });

    ws.innerHTML = `
      <!-- HEADER CONTROLLER -->
      <div style="width: 794px; max-width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 7px 16px; background: rgba(30, 41, 59, 0.95); border: 1px solid rgba(217, 119, 6, 0.4); border-radius: 12px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px; box-shadow: 0 4px 20px rgba(0,0,0,0.5);">
        <div style="display: flex; align-items: center; gap: 8px;">
          <span style="background: #d97706; color: #fff; padding: 2px 8px; border-radius: 6px; font-weight: 900; font-size: 11px;">EDEVX</span>
          <span style="font-weight: bold; color: #fde68a; font-size: 13px;">KINH PHÁP CÚ TRANH MINH HỌA</span>
        </div>
        <div style="display: flex; align-items: center; gap: 8px;">
          <select id="dhp-chapter-select" style="background: #0f172a; color: #fde68a; border: 1px solid #d97706; border-radius: 8px; padding: 4px 8px; font-size: 12px; outline: none; cursor: pointer;">
            <option>Đang nạp 26 phẩm...</option>
          </select>
          <button id="dhp-print-btn" style="background: linear-gradient(135deg, #d97706, #b45309); color: #fff; font-weight: bold; border: none; padding: 5px 12px; border-radius: 8px; cursor: pointer; font-size: 11.5px;">
            🖨️ IN PDF A5
          </button>
        </div>
      </div>

      <!-- TỜ GIẤY A5 NẰM NGANG -->
      <div class="dhp-paper-a5" id="dhp-canvas-container">
        <div style="padding: 40px; text-align: center; color: #d97706; font-size: 14px; font-family: sans-serif; font-weight: bold;">
          Đang nạp 423 bài kệ từ GitHub CDN...
        </div>
      </div>

      <!-- FOOTER PAGINATION -->
      <div style="width: 794px; max-width: 100%; display: flex; justify-content: space-between; align-items: center; padding: 7px 16px; background: rgba(30, 41, 59, 0.95); border: 1px solid #334155; border-radius: 12px; color: #fff; font-family: system-ui, sans-serif; font-size: 12px;">
        <button id="dhp-prev-btn" style="background: #0f172a; color: #fde68a; border: 1px solid #475569; padding: 4px 14px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px;">
          ⬅ Trang Trước
        </button>
        <div style="display: flex; align-items: center; gap: 10px; flex-grow: 1; max-width: 350px; margin: 0 15px;">
          <input type="range" id="dhp-slider" min="0" max="448" value="0" style="width: 100%; accent-color: #d97706; cursor: pointer;" />
          <span id="dhp-page-num" style="font-family: monospace; font-weight: bold; color: #fde68a; min-width: 65px; text-align: right; font-size: 13px;">1 / 449</span>
        </div>
        <button id="dhp-next-btn" style="background: #0f172a; color: #fde68a; border: 1px solid #475569; padding: 4px 14px; border-radius: 8px; cursor: pointer; font-weight: bold; font-size: 12px;">
          Trang Sau ➡
        </button>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    document.getElementById('dhp-prev-btn').onclick = () => { if (currentIndex > 0) { currentIndex--; renderPage(); } };
    document.getElementById('dhp-next-btn').onclick = () => { if (currentIndex < pages.length - 1) { currentIndex++; renderPage(); } };
    document.getElementById('dhp-slider').oninput = (e) => { currentIndex = parseInt(e.target.value, 10); renderPage(); };
    document.getElementById('dhp-chapter-select').onchange = (e) => {
      const cId = parseInt(e.target.value, 10);
      const target = pages.findIndex(p => p.type === 'cover' && p.data.chapter_id === cId);
      if (target !== -1) { currentIndex = target; renderPage(); }
    };
    document.getElementById('dhp-print-btn').onclick = () => window.print();

    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight' || e.key === ' ') { if (currentIndex < pages.length - 1) { currentIndex++; renderPage(); } }
      if (e.key === 'ArrowLeft') { if (currentIndex > 0) { currentIndex--; renderPage(); } }
    });
  }

  async function loadData() {
    try {
      const [cRes, vRes] = await Promise.all([fetch(CHAPTERS_URL), fetch(VERSES_URL)]);
      chapters = await cRes.json();
      verses = await vRes.json();

      pages = [];
      chapters.forEach(chap => {
        pages.push({ type: 'cover', data: chap });
        const vList = verses.filter(v => v.chapter_id === chap.chapter_id);
        vList.forEach(v => pages.push({ type: 'verse', data: v, chapter: chap }));
      });

      const sel = document.getElementById('dhp-chapter-select');
      sel.innerHTML = chapters.map(c => `<option value="${c.chapter_id}">Phẩm ${c.chapter_roman}: ${cleanText(c.chapter_vi)}</option>`).join('');

      renderPage();
    } catch (e) {
      console.error(e);
    }
  }

  function renderPage() {
    const canvas = document.getElementById('dhp-canvas-container');
    const page = pages[currentIndex];
    if (!page || !canvas) return;

    document.getElementById('dhp-page-num').textContent = `${currentIndex + 1} / ${pages.length}`;
    document.getElementById('dhp-slider').value = currentIndex;
    document.getElementById('dhp-slider').max = pages.length - 1;

    if (page.type === 'cover') {
      const c = page.data;
      canvas.innerHTML = `
        <div class="dhp-inner-card dhp-bg-buddha" style="align-items: center; text-align: center;">
          <div style="padding-top: 20px;">
            <div style="font-size: 13px; letter-spacing: 6px; color: #b45309; font-weight: bold; text-transform: uppercase; margin-bottom: 6px;">${cleanText(c.chapter_pali)}</div>
            <div style="font-size: 28px; font-weight: bold; color: #0f172a; text-transform: uppercase; letter-spacing: 1.5px;">${cleanText(c.chapter_roman)}. ${cleanText(c.chapter_vi)}</div>
            <div style="display: flex; align-items: center; justify-content: center; gap: 12px; margin: 12px 0;">
              <div style="height: 1.5px; width: 70px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
              <span style="color: #d97706; font-size: 16px;">☸</span>
              <div style="height: 1.5px; width: 70px; background: linear-gradient(to right, transparent, #b45309, transparent);"></div>
            </div>
          </div>
          <div style="padding: 0 30px; max-width: 600px; font-size: 15px; line-height: 1.7; color: #1e293b; font-style: italic; text-align: justify; text-align-last: center;">
            “${cleanText(c.intro_vi)}”
          </div>
          <div style="padding-bottom: 6px; width: 100%; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(217, 119, 6, 0.3); padding-top: 8px; font-family: system-ui, sans-serif; font-size: 11.5px; color: #64748b;">
            <span>🌸 <i>Kinh Pháp Cú Tranh Minh Họa</i></span>
            <span style="background: #fffbeb; color: #92400e; border: 1px solid #fde68a; font-weight: bold; padding: 3px 14px; border-radius: 99px; font-size: 12px;">
              Gồm ${c.verse_count} Bài Kệ: Kệ ${c.verse_range}
            </span>
            <span>Trang Bìa Phẩm ${c.chapter_roman}</span>
          </div>
        </div>
      `;
    } else {
      const v = page.data;
      const chap = page.chapter;
      canvas.innerHTML = `
        <div class="dhp-inner-card">
          <div class="dhp-grid-container">
            <!-- CỘT TRÁI: TRANH MINH HỌA -->
            <div class="dhp-image-col">
              <img src="${v.image_url}" alt="Kệ ${v.verse_no}" loading="lazy" />
            </div>

            <!-- CỘT PHẢI: VĂN BẢN & WATERMARK SEN VÀNG CANH GIỮA -->
            <div class="dhp-text-col">
              <div>
                <!-- TIÊU ĐỀ KỆ SỐ (TO - RÕ - ĐẬM) -->
                <div style="display: flex; justify-content: space-between; align-items: baseline; border-bottom: 1px solid #fed7aa; padding-bottom: 4px; margin-bottom: 8px; font-family: system-ui, sans-serif;">
                  <span style="font-size: 17px; font-weight: 900; color: #b45309; letter-spacing: 0.5px;">KỆ SỐ ${cleanText(v.verse_no)}</span>
                  <span style="font-size: 12.5px; color: #64748b; font-style: italic; font-weight: 600;">${cleanText(chap.chapter_vi)}</span>
                </div>

                <!-- THƠ LỤC BÁT (CHỮ TO 16PX - NÉT ĐẬM TRANG NHÃ) -->
                <div style="font-size: 16px; line-height: 1.6; font-weight: bold; color: #0f172a; white-space: pre-line; margin-bottom: 8px;">${cleanText(v.verse_vi)}</div>

                <!-- HỘP PĀLI (CHỮ 13PX) -->
                <div class="dhp-pali-box">
                  <div style="font-size: 13px; line-height: 1.5; font-style: italic; white-space: pre-line; font-weight: 500;">${cleanText(v.verse_pali)}</div>
                </div>
              </div>

              <div>
                <!-- PHẦN DỊCH NGHĨA (CHỮ TO 13PX DỄ ĐỌC) -->
                <div style="font-size: 13px; line-height: 1.55; color: #1e293b; text-align: justify; border-top: 1px dashed #cbd5e1; padding-top: 6px;">
                  <b style="color: #0f172a;">Dịch nghĩa:</b> ${cleanText(v.meaning_vi)}
                </div>

                <!-- FOOTER CARD -->
                <div style="display: flex; justify-content: space-between; align-items: center; font-size: 10.5px; font-family: system-ui, sans-serif; border-top: 1px solid #e2e8f0; padding-top: 4px; margin-top: 6px; color: #94a3b8;">
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