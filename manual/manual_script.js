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