const gallery = document.querySelector('[data-inspection-gallery]');
const mainImage = gallery.querySelector('.example-main-image');
const status = gallery.querySelector('[role="status"]');

for (const view of gallery.querySelectorAll('.example-thumbnails a')) {
  view.addEventListener('click', (event) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    if (view.hasAttribute('aria-current')) return;

    const image = view.querySelector('img');
    mainImage.alt = image.alt;
    mainImage.src = view.href;
    gallery.querySelector('[aria-current]').removeAttribute('aria-current');
    view.setAttribute('aria-current', 'true');
    status.textContent = image.alt;
  });
}
