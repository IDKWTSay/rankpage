document.querySelectorAll('.tab-button').forEach(button => {
  button.addEventListener('click', event => {
    const tabId = event.currentTarget.getAttribute('data-tab');
    openTab(tabId);
    document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
  });
});

function openTab(tabId) {
  const tabContents = document.querySelectorAll('.tab-content');
  tabContents.forEach(content => content.style.display = 'none');
  
  const activeTab = document.getElementById(tabId);
  if (activeTab) activeTab.style.display = 'block';
}


document.querySelectorAll('.copy-link').forEach(link => {
    link.addEventListener('click', event => {
        event.preventDefault();
        const url = link.getAttribute('data-url');

        navigator.clipboard.writeText(url)
            .then(() => {
                alert(`URL이 클립보드에 복사되었습니다: ${url}`);
            })
            .catch(err => {
                alert('복사에 실패했습니다. 브라우저가 지원하지 않을 수 있습니다.');
            });
    });
});


(function sliderModule() {
  const sliderWrapper = document.querySelector('.slider-wrapper');
  const slides = document.querySelectorAll('.slider-item');
  const leftArrow = document.querySelector('.left-arrow');
  const rightArrow = document.querySelector('.right-arrow');
  const paginationButtons = document.querySelectorAll('.page-btn');

  let currentIndex = 0;
  const totalSlides = slides.length;

  function moveToSlide(index) {
    sliderWrapper.style.transform = `translateX(-${index * 100}%)`;

    paginationButtons.forEach((btn, i) => {
      btn.classList.toggle('active', i === index);
    });
  }

  leftArrow.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    moveToSlide(currentIndex);
  });

  rightArrow.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % totalSlides;
    moveToSlide(currentIndex);
  });

  paginationButtons.forEach((btn, i) => {
    btn.addEventListener('click', () => {
      currentIndex = i;
      moveToSlide(currentIndex);
    });
  });

  moveToSlide(0);
})();



document.addEventListener('DOMContentLoaded', () => {

    const faqTitles = document.querySelectorAll('.faq-title');

    faqTitles.forEach(title => {
        title.addEventListener('click', () => {
            const faqItem = title.closest('.faq-item');
            faqItem.classList.toggle('active');
        });
    });

    const imageTriggers = document.querySelectorAll('.faq-item:first-child .image-hover-trigger');
    const popupContainer = document.getElementById('image-popup-container');

    if (popupContainer) {
        imageTriggers.forEach(trigger => {
            let popupImage = null;

            trigger.addEventListener('mouseenter', (event) => {
                const imageSrc = trigger.getAttribute('data-image-src');
                if (!imageSrc) return;

                popupContainer.innerHTML = '';

                popupImage = document.createElement('img');
                popupImage.src = imageSrc;
                popupImage.alt = "설명이미지";

                popupContainer.appendChild(popupImage);

                positionPopup(event);

                popupContainer.style.display = 'block';

                document.addEventListener('mousemove', positionPopup);
            });

            trigger.addEventListener('mouseleave', () => {
                popupContainer.style.display = 'none';
                popupContainer.innerHTML = '';
                popupImage = null;

                document.removeEventListener('mousemove', positionPopup);
            });
        });

        function positionPopup(e) {
            if (!popupContainer || popupContainer.style.display === 'none') return;

            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            const popupWidth = popupContainer.offsetWidth;
            const popupHeight = popupContainer.offsetHeight;
            const offsetX = 15;
            const offsetY = 15;
            let top = e.clientY + offsetY;
            let left = e.clientX + offsetX;
            if (left + popupWidth > winWidth) {
                left = e.clientX - popupWidth - offsetX;
            }
            if (left < 0) {
                left = offsetX;
            }

            if (top + popupHeight > winHeight) {
                top = e.clientY - popupHeight - offsetY;
            }
            if (top < 0) {
                top = offsetY;
            }

            popupContainer.style.left = `${left}px`;
            popupContainer.style.top = `${top}px`;
        }

    } else {
        console.error("이미지 팝업 컨테이너 없");
    }

});