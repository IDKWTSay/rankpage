(function initManualPage() {
  const tabButtons = Array.from(document.querySelectorAll('.tab-button'));
  const tabPanels = Array.from(document.querySelectorAll('.tab-panel'));
  const toastEl = document.getElementById('toast');
  const lineRelayoutFns = [];

  function showToast(message) {
    if (!toastEl) {
      return;
    }

    toastEl.textContent = message;
    toastEl.classList.add('show');

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      toastEl.classList.remove('show');
    }, 1800);
  }

  function setActiveTab(tabId) {
    tabButtons.forEach((button) => {
      const isActive = button.dataset.tab === tabId;
      button.classList.toggle('active', isActive);
      button.setAttribute('aria-selected', isActive ? 'true' : 'false');
      button.tabIndex = isActive ? 0 : -1;
    });

    tabPanels.forEach((panel) => {
      const isActive = panel.id === tabId;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    window.requestAnimationFrame(() => {
      lineRelayoutFns.forEach((fn) => fn());
    });
  }

  tabButtons.forEach((button) => {
    button.addEventListener('click', () => {
      setActiveTab(button.dataset.tab);
    });
  });

  const initialTab = tabButtons.find((button) => button.classList.contains('active'))?.dataset.tab || 'tab1';
  setActiveTab(initialTab);

  document.querySelectorAll('[data-ui-slider]').forEach((slider) => {
    const track = slider.querySelector('.ui-preview-track');
    const slides = Array.from(slider.querySelectorAll('.ui-preview-item'));
    const prevButtons = Array.from(slider.querySelectorAll('[data-slider-prev]'));
    const nextButtons = Array.from(slider.querySelectorAll('[data-slider-next]'));
    const pagination = slider.querySelector('.ui-slider-pagination');

    if (!track || slides.length === 0 || prevButtons.length === 0 || nextButtons.length === 0 || !pagination) {
      return;
    }

    let currentIndex = 0;

    function moveTo(index) {
      currentIndex = (index + slides.length) % slides.length;
      track.style.transform = `translateX(-${currentIndex * 100}%)`;
      Array.from(pagination.children).forEach((dot, dotIndex) => {
        dot.classList.toggle('active', dotIndex === currentIndex);
      });
    }

    slides.forEach((_, index) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'page-dot';
      dot.setAttribute('aria-label', `${index + 1}번 미리보기`);
      dot.addEventListener('click', () => moveTo(index));
      pagination.appendChild(dot);
    });

    prevButtons.forEach((button) => {
      button.addEventListener('click', () => moveTo(currentIndex - 1));
    });
    nextButtons.forEach((button) => {
      button.addEventListener('click', () => moveTo(currentIndex + 1));
    });
    moveTo(0);
  });

  const SVG_NS = 'http://www.w3.org/2000/svg';

  document.querySelectorAll('.line-link').forEach((item) => {
    const svg = item.querySelector('.hotspot-svg');
    const crop = item.querySelector('.ui-crop');
    const triggers = Array.from(item.querySelectorAll('.hotspot-trigger[data-target-x][data-target-y]'));

    if (!svg || !crop || triggers.length === 0) {
      return;
    }

    const entries = triggers.map((trigger) => {
      const path = document.createElementNS(SVG_NS, 'path');
      path.classList.add('hotspot-path');
      path.dataset.hotspot = trigger.dataset.hotspot || '';
      svg.appendChild(path);
      return { trigger, path };
    });

    function relayoutLines() {
      const itemRect = item.getBoundingClientRect();
      const cropRect = crop.getBoundingClientRect();
      const width = Math.max(1, itemRect.width);
      const height = Math.max(1, itemRect.height);

      svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      svg.setAttribute('width', `${width}`);
      svg.setAttribute('height', `${height}`);

      entries.forEach(({ trigger, path }) => {
        const tx = Number(trigger.dataset.targetX);
        const ty = Number(trigger.dataset.targetY);
        const triggerRect = trigger.getBoundingClientRect();

        const startX = triggerRect.left - itemRect.left + 7;
        const startY = triggerRect.top - itemRect.top + triggerRect.height * 0.5;
        const endX = cropRect.left - itemRect.left + cropRect.width * tx;
        const endY = cropRect.top - itemRect.top + cropRect.height * ty;
        const elbowX = cropRect.right - itemRect.left + 12;
        const shorten = 18;
        const finalX = endX + Math.sign(elbowX - endX) * shorten;
        const d = `M ${startX} ${startY} L ${elbowX} ${startY} L ${elbowX} ${endY} L ${finalX} ${endY}`;

        path.setAttribute('d', d);
      });
    }

    function setActive(triggerOrNull) {
      entries.forEach(({ trigger, path }) => {
        const active = triggerOrNull === trigger;
        trigger.classList.toggle('active', active);
        path.classList.toggle('active', active);
      });
    }

    entries.forEach(({ trigger }) => {
      trigger.addEventListener('mouseenter', () => setActive(trigger));
      trigger.addEventListener('focus', () => setActive(trigger));
      trigger.addEventListener('mouseleave', () => setActive(null));
      trigger.addEventListener('blur', () => setActive(null));
    });

    item.addEventListener('mouseleave', () => setActive(null));
    lineRelayoutFns.push(relayoutLines);
    window.requestAnimationFrame(relayoutLines);
  });

  window.addEventListener('resize', () => {
    lineRelayoutFns.forEach((fn) => fn());
  });

  document.querySelectorAll('.faq-question').forEach((question) => {
    question.addEventListener('click', () => {
      const answer = question.nextElementSibling;
      const isOpen = question.getAttribute('aria-expanded') === 'true';

      question.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (answer) {
        answer.hidden = isOpen;
      }
    });
  });

  const modal = document.getElementById('image-modal');
  const modalImage = document.getElementById('modal-image');

  function closeModal() {
    if (!modal || !modalImage) {
      return;
    }

    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    modalImage.src = '';
    modalImage.alt = '설명 이미지';
    document.body.style.overflow = '';
  }

  function openModal(src, altText) {
    if (!modal || !modalImage || !src) {
      return;
    }

    modalImage.src = src;
    modalImage.alt = altText || '설명 이미지';
    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  const hoverPreview = document.createElement('div');
  hoverPreview.className = 'faq-hover-preview';
  const hoverPreviewImage = document.createElement('img');
  hoverPreview.appendChild(hoverPreviewImage);
  document.body.appendChild(hoverPreview);

  function hideHoverPreview() {
    hoverPreview.style.display = 'none';
    hoverPreviewImage.src = '';
    hoverPreviewImage.alt = '';
  }

  function placeHoverPreview(clientX, clientY) {
    const gap = 16;
    const popupRect = hoverPreview.getBoundingClientRect();
    let left = clientX + gap;
    let top = clientY + gap;

    if (left + popupRect.width > window.innerWidth - 8) {
      left = clientX - popupRect.width - gap;
    }
    if (left < 8) {
      left = 8;
    }

    if (top + popupRect.height > window.innerHeight - 8) {
      top = clientY - popupRect.height - gap;
    }
    if (top < 8) {
      top = 8;
    }

    hoverPreview.style.left = `${left}px`;
    hoverPreview.style.top = `${top}px`;
  }

  function showHoverPreview(button, clientX, clientY) {
    const src = button.dataset.imageSrc;
    if (!src) {
      return;
    }

    hoverPreviewImage.src = src;
    hoverPreviewImage.alt = button.dataset.imageAlt || '설명 이미지';
    hoverPreview.style.display = 'block';
    placeHoverPreview(clientX, clientY);
  }

  document.querySelectorAll('.preview-btn').forEach((button) => {
    button.addEventListener('click', (event) => {
      event.preventDefault();
    });
    button.addEventListener('mouseenter', (event) => {
      showHoverPreview(button, event.clientX, event.clientY);
    });
    button.addEventListener('mousemove', (event) => {
      if (hoverPreview.style.display === 'block') {
        placeHoverPreview(event.clientX, event.clientY);
      }
    });
    button.addEventListener('mouseleave', hideHoverPreview);
    button.addEventListener('focus', () => {
      const rect = button.getBoundingClientRect();
      showHoverPreview(button, rect.right, rect.top + rect.height * 0.5);
    });
    button.addEventListener('blur', hideHoverPreview);
  });

  document.querySelectorAll('[data-close-modal]').forEach((button) => {
    button.addEventListener('click', closeModal);
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  });

  async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return;
    }

    const tempInput = document.createElement('textarea');
    tempInput.value = text;
    tempInput.setAttribute('readonly', '');
    tempInput.style.position = 'absolute';
    tempInput.style.left = '-9999px';
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand('copy');
    tempInput.remove();
  }

  document.querySelectorAll('.copy-link').forEach((button) => {
    button.addEventListener('click', async () => {
      const targetUrl = button.dataset.url;

      if (!targetUrl) {
        return;
      }

      try {
        await copyTextToClipboard(targetUrl);
        showToast(`복사됨: ${targetUrl}`);
      } catch (error) {
        showToast('복사에 실패했습니다. 주소를 직접 입력해 주세요.');
      }
    });
  });
})();
