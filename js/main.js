document.addEventListener("DOMContentLoaded", function () {
  const sections = document.querySelectorAll("section[id]");
  const navLinks = document.querySelectorAll(".sidebar nav a");

  // ====================================================
  // 스크롤 시 사이드바 active 표시
  // ====================================================
  function updateActive() {
    let currentSection = "";
    let currentSub = "";
    const activationLine = Math.min(window.innerHeight * 0.32, 320);

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      if (rect.top <= activationLine && rect.bottom > 0) {
        currentSection = section.id;
      }
    });

    navLinks.forEach(link => {
      if (!link.classList.contains("nav-sub")) return;
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const target = document.getElementById(href.slice(1));
      if (!target) return;

      const parentSection = target.matches("section[id]")
        ? target.id
        : target.closest("section[id]")?.id;
      const targetRect = target.getBoundingClientRect();

      if (parentSection === currentSection && targetRect.top <= activationLine) {
        currentSub = target.id;
      }
    });

    navLinks.forEach(link => {
      const href = link.getAttribute("href");
      if (!href) return;
      if (link.classList.contains("nav-sub")) {
        link.classList.toggle("active", href === "#" + currentSub);
      } else {
        link.classList.toggle("active", href === "#" + currentSection && !currentSub);
      }
    });
  }

  let scrollTicking = false;
  window.addEventListener("scroll", () => {
    if (!scrollTicking) {
      requestAnimationFrame(() => {
        updateActive();
        scrollTicking = false;
      });
      scrollTicking = true;
    }
  });
  updateActive();

  // ====================================================
  // 사이드바 클릭 → smooth scroll
  // ====================================================
  navLinks.forEach(link => {
    link.addEventListener("click", e => {
      const href = link.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      e.preventDefault();
      const id = href.slice(1);
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  // ====================================================
  // 이미지 lightbox
  // ====================================================
  const lightbox = document.getElementById("lightbox");
  const lightboxImg = document.getElementById("lightbox-img");

  document.querySelectorAll(".img-box img").forEach(img => {
    img.addEventListener("click", () => {
      lightboxImg.src = img.src;
      lightboxImg.alt = img.alt;
      lightbox.classList.add("active");
    });
  });

  lightbox.addEventListener("click", () => {
    lightbox.classList.remove("active");
  });

  // ====================================================
  // SVG lightbox
  // ====================================================
  const svgLightbox = document.getElementById("svg-lightbox");
  const svgLightboxContent = document.getElementById("svg-lightbox-content");

  document.querySelectorAll(".svg-box").forEach(box => {
    box.addEventListener("click", () => {
      const svg = box.querySelector("svg");
      if (svg) {
        svgLightboxContent.innerHTML = svg.outerHTML;
        svgLightbox.classList.add("active");
      }
    });
  });

  svgLightbox.addEventListener("click", () => {
    svgLightbox.classList.remove("active");
  });

  document.addEventListener("keydown", e => {
    if (e.key === "Escape") {
      lightbox.classList.remove("active");
      svgLightbox.classList.remove("active");
    }
  });

  // ====================================================
  // 모든 표를 .table-wrap으로 감싸기 (둥근 카드 효과)
  // ====================================================
  document.querySelectorAll(".content table").forEach(table => {
    if (table.parentElement && table.parentElement.classList.contains("table-wrap")) return;
    if (table.classList.contains("compact-file-table")) return;
    const wrap = document.createElement("div");
    wrap.className = "table-wrap";
    table.parentNode.insertBefore(wrap, table);
    wrap.appendChild(table);
  });

  // ====================================================
  // 복사 버튼 통일: 모든 표 셀의 우측 상단에 .td-copy-btn 부착
  // (pre/code 어떤 형태든 같은 스타일, 같은 위치)
  // ====================================================
  function makeCopyBtn(getText) {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "td-copy-btn";
    btn.textContent = "복사";
    btn.addEventListener("click", e => {
      e.stopPropagation();
      const text = typeof getText === "function" ? getText() : getText;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = "복사됨";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "복사";
            btn.classList.remove("copied");
          }, 1500);
        })
        .catch(() => {
          btn.textContent = "실패";
          setTimeout(() => (btn.textContent = "복사"), 1500);
        });
    });
    return btn;
  }

  document.querySelectorAll("tbody tr").forEach(tr => {
    if (tr.classList.contains("note-row")) return; // 안내 행 제외
    const cells = tr.querySelectorAll("td");
    cells.forEach((td, idx) => {
      if (idx === 0) return; // 항목 컬럼 제외
      if (td.querySelector("pre")) return; // pre가 있으면 pre 내부 복사 버튼이 처리
      // td의 직속 자식 code (또는 직속 자식 a 안의 code)만 대상.
      // .cell-text 안에 인라인으로 들어간 code는 인라인 cmd 스타일로 두고 wrap 안 함.
      const codeEl =
        td.querySelector(":scope > code") ||
        td.querySelector(":scope > a > code");
      if (!codeEl) return;
      // code를 .code-wrap div로 감싸서 버튼이 code 박스 기준으로 정렬되도록 함
      const wrap = document.createElement("div");
      wrap.className = "code-wrap";
      codeEl.parentNode.insertBefore(wrap, codeEl);
      wrap.appendChild(codeEl);
      wrap.appendChild(makeCopyBtn(() => codeEl.textContent));
      td.classList.add("has-copy");
    });
  });

  // ====================================================
  // 모든 <pre> 우상단 안쪽에 복사 버튼 (표 안/밖 모두)
  // ====================================================
  document.querySelectorAll("pre").forEach(pre => {
    pre.style.position = "relative";
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "copy-btn";
    btn.textContent = "복사";
    pre.appendChild(btn);

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const code = pre.querySelector("code");
      const text = code ? code.textContent : pre.textContent;
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = "복사됨";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "복사";
            btn.classList.remove("copied");
          }, 1500);
        })
        .catch(() => {
          btn.textContent = "실패";
          setTimeout(() => (btn.textContent = "복사"), 1500);
      });
    });
  });

  document.querySelectorAll(".inline-copy-code").forEach(box => {
    const btn = box.querySelector(".inline-copy-btn");
    if (!btn) return;

    btn.addEventListener("click", e => {
      e.stopPropagation();
      const text = box.dataset.copy || box.querySelector("code")?.textContent || "";
      navigator.clipboard
        .writeText(text)
        .then(() => {
          btn.textContent = "복사됨";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = "복사";
            btn.classList.remove("copied");
          }, 1500);
        })
        .catch(() => {
          const range = document.createRange();
          const code = box.querySelector("code");
          if (!code) return;
          range.selectNodeContents(code);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
          btn.textContent = "선택됨";
          btn.classList.remove("copied");
          setTimeout(() => {
            btn.textContent = "복사";
          }, 1500);
        });
    });
  });
});
