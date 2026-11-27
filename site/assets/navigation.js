const navigation = document.querySelector('.site-nav');
const menuButton = navigation.querySelector('.nav-toggle');
const menuLinks = navigation.querySelector('#site-nav-links');
const compactHeader = window.matchMedia('(max-width: 35rem)');

function setMenuOpen(open) {
  menuButton.setAttribute('aria-expanded', String(open));
  menuLinks.hidden = compactHeader.matches && !open;
}

function updateHeader() {
  const focusWasInLinks = menuLinks.contains(document.activeElement);
  const focusWasOnToggle = document.activeElement === menuButton;
  menuButton.hidden = !compactHeader.matches;
  setMenuOpen(false);
  if (compactHeader.matches && focusWasInLinks) menuButton.focus();
  if (!compactHeader.matches && focusWasOnToggle) menuLinks.querySelector('a').focus();
}

menuButton.addEventListener('click', () => {
  setMenuOpen(menuButton.getAttribute('aria-expanded') !== 'true');
});

navigation.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
    event.preventDefault();
    setMenuOpen(false);
    menuButton.focus();
  }
});

navigation.addEventListener('click', (event) => {
  const link = event.target.closest('a');
  if (compactHeader.matches && link?.pathname === window.location.pathname && link.hash) {
    setMenuOpen(false);
  }
});

compactHeader.addEventListener('change', updateHeader);
updateHeader();
